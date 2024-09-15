// src/components/ShaderComponent.tsx
import React, { useRef, useEffect, useState } from 'react';
import { AIShaderController } from './AIShaderController';

interface ShaderConfig {
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
  };
  physics: {
    speed: number;
    complexity: number;
    turbulence: number;
  };
}

interface ShaderComponentProps {
  mood: string;
  currentTheme: number;
}

const ShaderComponent: React.FC<ShaderComponentProps> = ({ mood, currentTheme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shaderConfig, setShaderConfig] = useState<ShaderConfig | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shaderConfig) return;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    let renderer: Renderer | null = null;

    const resize = () => {
      const { innerWidth: width, innerHeight: height } = window;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (renderer) {
        renderer.updateScale(dpr);
      }
    };

    const init = () => {
      canvas.style.width = "100%";
      canvas.style.height = "100vh";
      canvas.style.userSelect = "none";

      renderer = new Renderer(canvas, dpr, shaderConfig);
      renderer.setup();
      renderer.init();
      resize();

      window.addEventListener('resize', resize);

      let animationFrameId: number;
      const loop = (now: number) => {
        renderer?.render(now);
        animationFrameId = requestAnimationFrame(loop);
      };
      loop(0);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resize);
      };
    };

    const cleanup = init();

    return () => {
      if (cleanup) cleanup();
    };
  }, [shaderConfig]);

  const handleConfigUpdate = (newConfig: ShaderConfig) => {
    setShaderConfig(newConfig);
  };

  return (
    <>
      <AIShaderController 
        mood={mood} 
        currentTheme={currentTheme} 
        onConfigUpdate={handleConfigUpdate} 
      />
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full touch-none -z-10"
      />
    </>
  );
};

class Renderer {
  private vertexSrc = `#version 300 es
    precision highp float;
    in vec4 position;
    void main(){gl_Position=position;}`;

  private fragmtSrc!: string;
  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
  private canvas: HTMLCanvasElement;
  private scale: number;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private uniformLocations: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
  };

  constructor(canvas: HTMLCanvasElement, scale: number, config: ShaderConfig) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2')!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.updateConfig(config);
    this.uniformLocations = { resolution: null, time: null };
  }

  updateConfig(config: ShaderConfig) {
    const { colors, physics } = config;
    const fragmtSrc = `#version 300 es
      precision highp float;
      out vec4 O;
      uniform float time;
      uniform vec2 resolution;
      
      vec3 primaryColor = vec3(${colors.primary.join(', ')});
      vec3 secondaryColor = vec3(${colors.secondary.join(', ')});
      vec3 accentColor = vec3(${colors.accent.join(', ')});
      
      float speed = ${physics.speed};
      float complexity = ${physics.complexity};
      float turbulence = ${physics.turbulence};
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        float t = time * speed;
        
        float pattern = sin(uv.x * complexity * 10.0 + t) * cos(uv.y * complexity * 10.0 + t);
        pattern += turbulence * sin(uv.x * 20.0 * turbulence + t) * sin(uv.y * 20.0 * turbulence + t);
        
        vec3 color = mix(primaryColor, secondaryColor, pattern);
        color = mix(color, accentColor, sin(t) * 0.5 + 0.5);
        
        O = vec4(color, 1.0);
      }
    `;
    this.fragmtSrc = fragmtSrc || ''; // Assign an empty string if fragmtSrc is undefined
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER);
    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!this.vs || !this.fs) throw new Error("Failed to create shaders");
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.fragmtSrc);
    this.program = gl.createProgram();
    if (!this.program) throw new Error("Failed to create program");
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    if (!this.program) throw new Error("Program not initialized");
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(this.program);
    this.uniformLocations = {
      resolution: gl.getUniformLocation(this.program, "resolution"),
      time: gl.getUniformLocation(this.program, "time"),
    };
  }

  render(now: number) {
    const { gl, program, buffer, canvas } = this;
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.uniform2f(this.uniformLocations.resolution, canvas.width, canvas.height);
    gl.uniform1f(this.uniformLocations.time, now * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export default ShaderComponent;