// src/components/Meditation.tsx
'use client';
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

const LOOP = 12;
const PI = Math.PI;
const TAU = PI * 2;

const mapRange = (a: number, b: number, c: number, d: number, e: number): number => {
  return ((a - b) * (e - d)) / (c - b) + d;
};

const sin = Math.sin;
const cos = Math.cos;

interface WaveProps {
  ctx: CanvasRenderingContext2D;
  dpr: number;
  lineWidth: number;
  points: number;
  offset: number;
  speed: number;
  amplitude: number;
  color: string;
}

class Wave {
  private props: WaveProps;

  constructor(props: WaveProps) {
    this.props = props;
  }

  draw(playhead: number, time: number, breeze: number): void {
    const { ctx, dpr, lineWidth, points, offset, speed, amplitude, color } = this.props;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = height / 2 + 
                sin((x / width + time * speed + offset) * TAU) * amplitude * dpr +
                sin((x / width * 2 + time * speed * 1.5) * TAU) * amplitude * 0.5 * dpr +
                breeze * sin((x / width * 3 + time * speed * 0.5) * TAU) * amplitude * 0.3 * dpr;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
}

const Meditation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [breeze, setBreeze] = useState(0);
  const [breathe, setBreathe] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio;
    let animationFrameId: number;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const waves = Array.from({ length: 15 }, (_, i) => new Wave({
      ctx,
      dpr,
      lineWidth: 1 * dpr,
      points: 200,
      offset: i * 0.1,
      speed: 0.05 + i * 0.002,
      amplitude: (10 + i * 1) * dpr,
      color: `hsla(${170 + i * 6}, 70%, ${75 + i * 1.5}%, 0.4)`
    }));

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const playhead = (time / 1000) % LOOP / LOOP;
      waves.forEach(wave => wave.draw(playhead, time / 1000, breeze));
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    const breezeInterval = setInterval(() => {
      setBreeze(Math.random() * 0.5);
    }, 5000);

    const breatheInterval = setInterval(() => {
      setBreathe(prev => (prev + 1) % 2);
    }, 4000);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
      clearInterval(breezeInterval);
      clearInterval(breatheInterval);
    };
  }, [breeze]);

  const scrollToVideos = () => {
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero-container">
      <div className={`hero-animation-container ${breathe ? 'hero-breathe-in' : 'hero-breathe-out'}`} 
           style={{ transform: `translate(${breeze * 5}px, ${breeze * 5}px)` }}>
        <h1>MEDITATION JOURNEY</h1>
        <div className="hero-canvas-wrapper">
          <canvas ref={canvasRef} />
        </div>
        <button className="hero-button" onClick={scrollToVideos}>Show Videos</button>
      </div>
      <p className="hero-haiku">
        Peaceful waves arise,<br />
        Calmly drift to shores within,<br />
        Finding stillness, whole.
      </p>
      <div className="hero-cards-container" ref={videoSectionRef} style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
      
        <div className="hero-card mb-7">
          <h2>Guided Meditation | Self-Love & Confidence</h2>
          <iframe width="500" height="280" src="https://www.youtube.com/embed/DtipEUV2gHM" title="Self-Love & Confidence"></iframe>
          <p>Experience a journey of self-love and confidence with this meditation. Embrace inner strength and radiate assurance through calming visualization and affirmations.</p>
        </div>

        <div className="hero-card mb-7">
          <h2>Guided Meditation | Calm Your ADHD Mind</h2>
          <iframe width="500" height="280" src="https://www.youtube.com/embed/cQwvQx-JFoM" title="Calm Your ADHD Mind"></iframe>
          <p>Meditation tailored for ADHD. Improve focus, reduce stress, and enhance emotional well-being through this mindfulness practice designed to manage ADHD symptoms.</p>
        </div>

      </div>
    </div>
  );
};

export default Meditation;
