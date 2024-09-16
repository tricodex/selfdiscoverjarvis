// src/components/Presentation.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";

const slides = [
  {
    type: 'intro',
    content: (
      <div className="hero-container">
        <div className="hero-animation-container opacity-120 text-black">
        <h1>DISCOVER</h1>
        
        
        <h1>_</h1>
        <Link href="/" className="topnav-logo space-x-0">
          <Image src="/logo.svg" alt="RDJ Logo" width={36} height={40} />
          <span className="topnav-logo-text">RDJ</span>
        </Link>
        <h1 className="topnav-logo-text">Reflect Discover Jarvis</h1>
        

          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex-1">
              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">Patrick Camara</CardTitle>
                  <CardDescription>AI Developer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-6">
                    <Avatar className="h-24 w-24 mr-6">
                      <AvatarImage src="/patrick-camara.jpeg" alt="Patrick Camara" />
                      <AvatarFallback>PC</AvatarFallback>
                    </Avatar>
                    <div>
                    <p className="text-gray-600">MSc AI Cognitive Science, BSc Psychology</p>
                    <div className="flex mt-2">
                        <Badge variant="secondary" className="mr-2">AI Development</Badge>
                        <Badge variant="secondary" className="mr-2">Psychology</Badge>
                        <Badge variant="secondary">Web Development</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-black">
                    Combining my passion for psychology and artificial intelligence to create meaningful experiences in self-discovery and personal growth.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 flex justify-center">
              <Image src="/rdj.png" alt="RDJ Logo" width={500} height={400} />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "RDJ: AI-Powered Self-Discovery",
    content: "Introducing a platform that combines AI and psychological frameworks to offer personalized assessments and insights.",
    image: "https://utfs.io/f/skkJdUt435JOwL5WySMZfseQz24k5DEbLRaBqwNryGCSxJ7j",
    extra: (
      <Card className="mt-4 bg-white/80">
        <CardHeader>
          <CardTitle>Innovative Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Addressing the lack of accessible, personalized tools for self-discovery and mental well-being in the digital age.</p>
          <Link href="/assessment">
            <Button className="mt-4">Try the Assessment</Button>
          </Link>
        </CardContent>
      </Card>
    )
  },
  {
    title: "AI Integration",
    content: "Leveraging state-of-the-art AI models for personalized user experiences.",
    image: "https://utfs.io/f/skkJdUt435JOax8d1sg14AY09G2sqVrKdPpZ3cXCvi8JHWew",
    extra: (
      <Tabs defaultValue="models" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>AI Models Used</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Meta-Llama-3.1-70B-Instruct-Turbo (Together AI)</li>
                <li>Meta-Llama-3.1-8B-Instruct-Turbo (Together AI)</li>
                <li>Solar-pro for chat (Upstage AI)</li>
                <li>Solar-docvision for document analysis (Upstage AI)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Key AI Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Dynamic question generation</li>
                <li>Personalized response analysis</li>
                <li>Adaptive chat support</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  },
  {
    title: "AI Agents in RDJ",
    content: "Leveraging multiple AI agents to provide a comprehensive self-discovery experience.",
    image: "https://utfs.io/f/skkJdUt435JOax8d1sg14AY09G2sqVrKdPpZ3cXCvi8JHWew", // Reusing an image, replace with a more appropriate one if available
    extra: (
      <Card className="mt-4 bg-white/80">
        <CardHeader>
          <CardTitle>AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Assessment Generator Agent:</strong> Creates personalized questions based on user-specified topics using Meta-Llama-3.1-70B-Instruct-Turbo.</li>
              <li><strong>Response Analyzer Agent:</strong> Processes user answers to generate insights and personality profiles.</li>
              <li><strong>Chat Support Agent:</strong> Powered by Solar-pro, provides real-time assistance and clarification during the assessment process.</li>
              <li><strong>Visual Experience Agent:</strong> Generates mood-responsive shader configurations for an immersive user interface.</li>
              <li><strong>Document Analysis Agent:</strong> Utilizes Solar-docvision to analyze uploaded documents or images for additional context.</li>
            </ul>
          </ScrollArea>
          <p className="mt-4">These AI agents work collaboratively to create a seamless, intelligent, and personalized user experience throughout the RDJ platform.</p>
        </CardContent>
      </Card>
    )
  },
  {
    title: "Interactive User Experience",
    content: "Engaging users through dynamic shader animations that respond to mood and input.",
    image: "https://utfs.io/f/skkJdUt435JOkNdj95soWtDNBCHFUYig6RAJ5wxVbE0Irldq",
    extra: (
      <Card className="mt-4 bg-white/80">
        <CardHeader>
          <CardTitle>Visual Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Experience  visual shader that adapt to your mood and preferences.</p>
          <Link href="/vibes">
            <Button className="mt-4">Create Your Vibe</Button>
          </Link>
        </CardContent>
      </Card>
    )
  },
  {
    title: "Real-time AI Support",
    content: "Providing instant, context-aware assistance through an advanced AI chat system.",
    image: "https://utfs.io/f/skkJdUt435JOOkEuDnsCpj3Vo7bBPJZN124dTFLvEQzXgK9f",
    extra: (
      <Card className="mt-4 bg-white/80">
        <CardHeader>
          <CardTitle>AI Chat Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Experience personalized guidance and support throughout your self-discovery journey.</p>
          <Link href="/assessment">
            <Button className="mt-4">Start Chatting</Button>
          </Link>
        </CardContent>
      </Card>
    )
  },
  {
    title: "Market Potential",
    content: "Addressing a growing need for accessible, personalized mental health and self-improvement tools.",
    image: "https://utfs.io/f/skkJdUt435JOPc03y252nsWMbFcTwEvJHuUD3dXN86e9iVt4",
    extra: (
      <Card className="mt-4 bg-white/80">
        <CardHeader>
          <CardTitle>Target Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Individual consumers seeking personal growth</li>
              <li>Mental health professionals integrating technology</li>
              <li>Corporate wellness programs for employee well-being</li>
              <li>Educational institutions supporting student mental health</li>
              <li>Health and wellness apps looking for AI-powered features</li>
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  },
  
  {
    title: "Scalable Architecture",
    content: "Built on Next.js and tRPC, ensuring robust performance and easy scalability.",
    image: "https://utfs.io/f/skkJdUt435JOxu54VAOZ76TgkDAu2eq8hXWBbE3op9FNVJdc",
    extra: (
      <Tabs defaultValue="stack" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>
        <TabsContent value="stack">
          <Card>
            <CardHeader>
              <CardTitle>Tech Stack Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Next.js for server-side rendering</li>
                <li>tRPC for type-safe API calls</li>
                <li>PostgreSQL with Drizzle ORM</li>
                <li>Tailwind CSS with shadcn/ui components</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>High performance and responsiveness</li>
                <li>Easy scaling to handle growing user base</li>
                <li>Type-safe development for fewer bugs</li>
                <li>Modular design for easy feature additions</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  },
  {
    title: "Future Enhancements",
    content: "Exploring advanced psychological models and expanding to various sectors.",
    image: "https://utfs.io/f/skkJdUt435JOR3LDpynuefS9rBKbWCYZ8wlQcXxHE6TILOD5",
    extra: (
      <Card className="mt-4 bg-white/80">
        <CardHeader>
          <CardTitle>Upcoming Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <ul className="list-disc list-inside space-y-2">
              <li>Advanced emotion analysis using multimodal AI</li>
              <li>Longitudinal progress tracking with AI-powered insights</li>
              <li>Personalized exercises generated by LLM models</li>
              <li>Group sessions guided by AI agents</li>
              <li>Collaborative features for therapist-patient interactions</li>
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  },
  {
    type: 'outro',
    content: (
        
      <div className="hero-container">
                <h1>DISCOVER</h1>

                <h1>DISCOVER</h1>
                <h1>_</h1>


                <h1>DISCOVER</h1>

        <div className="hero-animation-container opacity-120 text-black">
          <Card className="bg-white bg-opacity-90">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Thank You for Your Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl mb-4">Explore RDJ and embark on your journey of self-discovery</p>
              <div className="flex space-x-4">
                <Link href="/">
                  <Button>Return to Home</Button>
                </Link>
                <Link href="/assessment">
                  <Button variant="outline">Try an Assessment</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
];

const Presentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {slides[currentSlide]?.type === 'intro' || slides[currentSlide]?.type === 'outro' ? (
            <div className="absolute inset-0 bg-gradient-to-br from-turquoise-500 to-turquoise-700" />
          ) : (
            <>
              <Image
                src={slides[currentSlide]?.image ?? ''}
                alt={slides[currentSlide]?.title ?? ''}
                layout="fill"
                objectFit="cover"
                className="z-0"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
            </>
          )}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-20 p-8">
            {slides[currentSlide]?.type === 'intro' || slides[currentSlide]?.type === 'outro' ? (
              slides[currentSlide].content
            ) : (
              <>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold mb-4"
                >
                  {slides[currentSlide]?.title ?? ''}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-center max-w-2xl mb-4"
                >
                  {slides[currentSlide]?.content ?? ''}
                </motion.p>
                {slides[currentSlide]?.extra ?? null}
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(index)}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-30"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        title="Previous Slide"
      >
        <ChevronLeft size={40} />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-30"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        title="Next Slide"
      >
        <ChevronRight size={40} />
      </button>
    </div>
  );
};

export default Presentation;