import React, { useRef, useEffect, useState } from 'react';
import { AIShaderController } from './AIShaderController';
import type { ShaderConfig } from '~/server/together-ai/shaderAI';

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

    console.log('Initializing renderer with config:', shaderConfig);

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    let renderer: Renderer | null = null;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (renderer) {
        renderer.updateScale(dpr);
      }
    };

    const init = () => {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.position = "absolute"; // Position relative to its container
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.zIndex = "0"; // Adjust z-index if needed

      renderer = new Renderer(canvas, dpr, shaderConfig);
      if (!renderer.gl) {
        console.error('WebGL2 is not supported in this browser.');
        return;
      }
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
    console.log('Received new shader config:', newConfig);
    setShaderConfig(newConfig);
  };

  return (
    <div className="relative w-full h-64 md:h-full min-h-[400px] rounded-2xl overflow-hidden"> {/* Container to control size */}
      <AIShaderController 
        mood={mood} 
        currentTheme={currentTheme} 
        onConfigUpdate={handleConfigUpdate} 
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full" // Canvas is now sized to fit its container
      />
      {shaderConfig && (
        <div className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-50 rounded">
          <pre className="text-xs">{JSON.stringify(shaderConfig, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};


class Renderer {
  private vertexSrc = `#version 300 es
    precision highp float;
    in vec4 position;
    void main() { gl_Position = position; }`;

  private fragmtSrc!: string;
  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
  private canvas: HTMLCanvasElement;
  private scale: number;
  gl: WebGL2RenderingContext | null;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private uniformLocations: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
  } | undefined;

  constructor(canvas: HTMLCanvasElement, scale: number, config: ShaderConfig) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2');
    if (!this.gl) {
      console.error('WebGL2 is not supported in this browser.');
      return;
    }
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.updateConfig(config);
    this.uniformLocations = { resolution: null, time: null };
  }

  updateConfig(config: ShaderConfig) {
    const defaultColor = [0.5, 0.5, 0.5];
    const defaultPhysics = { speed: 0.5, complexity: 0.5, turbulence: 0.5 };

    const colors = config?.colors || {};
    const physics = config?.physics || defaultPhysics;

    const fragmtSrc = `#version 300 es
      precision highp float;
      out vec4 O;
      uniform float time;
      uniform vec2 resolution;
      
      vec3 primaryColor = vec3(${colors.primary?.join(', ') || defaultColor.join(', ')});
      vec3 secondaryColor = vec3(${colors.secondary?.join(', ') || defaultColor.join(', ')});
      vec3 accentColor = vec3(${colors.accent?.join(', ') || defaultColor.join(', ')});
      
      float speed = ${physics.speed || defaultPhysics.speed};
      float complexity = ${physics.complexity || defaultPhysics.complexity};
      float turbulence = ${physics.turbulence || defaultPhysics.turbulence};
      
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
    // console.log('Generated fragment shader source:', fragmtSrc);
    this.fragmtSrc = fragmtSrc;
  }

  updateScale(scale: number) {
    this.scale = scale;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    if (!gl) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      console.error('Shader source:', source);
    }
  }

  setup() {
    const gl = this.gl;
    if (!gl) return;
    this.vs = gl.createShader(gl.VERTEX_SHADER);
    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!this.vs || !this.fs) {
      console.error("Failed to create shaders");
      return;
    }
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.fragmtSrc);
    this.program = gl.createProgram();
    if (!this.program) {
      console.error("Failed to create program");
      return;
    }
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    if (!gl || !this.program) {
      console.error("WebGL context or program not initialized");
      return;
    }
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
    // console.log('Rendering frame at time:', now);
    const gl = this.gl;
    if (!gl || !this.program || !this.buffer) {
      console.error("Cannot render: WebGL context, program, or buffer is not initialized");
      return;
    }
    if (gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      console.error("Cannot render: Program has been deleted");
      return;
    }
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    if (this.uniformLocations) {
      gl.uniform2f(this.uniformLocations.resolution, this.canvas.width, this.canvas.height);
    }
    if (this.uniformLocations) {
      gl.uniform1f(this.uniformLocations.time, now * 0.001);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export default ShaderComponent;
