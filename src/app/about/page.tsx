// src/components/About.tsx
'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const LOOP = 12;
const PI = Math.PI;
const TAU = PI * 2;

const sin = Math.sin;

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

const About: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  return (
    <div className="hero-container">
      <div className={`hero-animation-container opacity-120 text-black ${breathe ? 'hero-breathe-in' : 'hero-breathe-out'}`} 
           style={{ transform: `translate(${breeze * 5}px, ${breeze * 5}px)` }}>
        {/* <h1>ABOUT ME</h1> */}
        <div className="hero-canvas-wrapper">
          <canvas ref={canvasRef} />
        </div>
        <Card className="hero-card mb-20 bg-black bg-opacity-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">Reflect Discover Jarvis (RDJ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <Avatar className="h-24 w-24 mr-6">
                <AvatarImage src="/patrick-camara.jpeg" alt="Your Name" />
                <AvatarFallback>YN</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">Patrick Camara</h2>
                <p className="text-gray-600">AI Developer</p>
                <p className="text-gray-600">MSc AI Cognitive Science, BSc Psychology</p>

                <div className="flex mt-2">
                  <Badge variant="secondary" className="mr-2">AI Development</Badge>
                  <Badge variant="secondary" className="mr-2">Psychology</Badge>
                  <Badge variant="secondary">Web Development</Badge>
                </div>
              </div>
            </div>
            <p className="text-lg text-black">
              Reflect Discover Jarvis (RDJ) is a solo project combining my passion for psychology and artificial intelligence. With a Bachelor&apos;s in Psychology and a Master&apos;s in AI, I have crafted this website to help users explore self-love, mindfulness, and self-discovery. This project reflects my belief that the intersection of AI and psychology can create meaningful experiences.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="hero-cards-container" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <Tabs defaultValue="vision" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="philosophy">AI Philosophy</TabsTrigger>
          </TabsList>

          <TabsContent value="vision">
            <Card>
              <CardHeader>
                <CardTitle>A Vision for AI-Powered Well-being</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  RDJ aims to offer an accessible platform for self-discovery using AI and mindfulness practices. By leveraging my background in psychology and AI, I strive to create tools that promote mental well-being and self-improvement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Core Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personalized guided meditations</li>
                  <li>Interactive mental health tools</li>
                  <li>Dynamic AI-generated visuals for relaxation</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="philosophy">
            <Card>
              <CardHeader>
                <CardTitle>My Approach to AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The project focuses on combining AI&apos;s analytical power with human-centric mindfulness techniques. This involves creating interactive experiences that promote self-awareness, using AI responsibly and thoughtfully to support mental well-being.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
