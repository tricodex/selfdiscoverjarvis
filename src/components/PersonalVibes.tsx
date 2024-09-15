// src/components/PersonalVibes.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import ShaderComponent from './ShaderComponent';
import { Palette, Music, Wind, Zap, Heart } from 'lucide-react';

const moodOptions = [
  { name: 'Calm', icon: <Wind className="w-5 h-5" />, color: 'bg-blue-100' },
  { name: 'Energetic', icon: <Zap className="w-5 h-5" />, color: 'bg-yellow-100' },
  { name: 'Melancholic', icon: <Music className="w-5 h-5" />, color: 'bg-purple-100' },
  { name: 'Joyful', icon: <Heart className="w-5 h-5" />, color: 'bg-pink-100' },
  { name: 'Mysterious', icon: <Palette className="w-5 h-5" />, color: 'bg-indigo-100' },
] as const;

type Mood = typeof moodOptions[number]['name'];

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

interface SavedVibe {
  id: string;
  name: string;
  mood: Mood;
  theme: number;
  shaderConfig: ShaderConfig;
}

const PersonalVibes: React.FC = () => {
  const [name, setName] = useState('');
  const [mood, setMood] = useState<Mood>('Calm');
  const [theme, setTheme] = useState(0);
  const [speed, setSpeed] = useState(0.5);
  const [complexity, setComplexity] = useState(0.5);
  const [turbulence, setTurbulence] = useState(0.5);
  const [autoPlay, setAutoPlay] = useState(false);
  const [savedVibes, setSavedVibes] = useState<SavedVibe[]>([]);
  const [activeTab, setActiveTab] = useState('create');

  const { toast } = useToast();

  const createVibeMutation = api.personalVibe.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Vibe Created",
        description: "Your personal vibe has been saved!",
      });
      void refetchSavedVibes();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save vibe: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { data: fetchedVibes, refetch: refetchSavedVibes } = api.personalVibe.getAll.useQuery();

  useEffect(() => {
    if (fetchedVibes) {
      const convertedVibes: SavedVibe[] = fetchedVibes.map(vibe => ({
        id: String(vibe.id),
        name: vibe.name,
        mood: vibe.mood as Mood,
        theme: vibe.theme,
        shaderConfig: vibe.shaderConfig as ShaderConfig
      }));
      setSavedVibes(convertedVibes);
    }
  }, [fetchedVibes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPlay) {
      interval = setInterval(() => {
        setTheme((prevTheme) => (prevTheme + 1) % 5);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleSaveVibe = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a name for your vibe",
        variant: "destructive",
      });
      return;
    }

    createVibeMutation.mutate({
      name,
      mood,
      theme,
      shaderConfig: {
        colors: {
          primary: [1, 0, 0],
          secondary: [0, 1, 0],
          accent: [0, 0, 1],
        },
        physics: {
          speed,
          complexity,
          turbulence,
        },
      },
    });
  };

  const handleLoadVibe = (vibe: SavedVibe) => {
    setMood(vibe.mood);
    setTheme(vibe.theme);
    setSpeed(vibe.shaderConfig.physics.speed ?? 0.5);
    setComplexity(vibe.shaderConfig.physics.complexity ?? 0.5);
    setTurbulence(vibe.shaderConfig.physics.turbulence ?? 0.5);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 p-4 sm:p-8 bg-opacity-100">
      <Card className="w-full max-w-6xl mx-auto bg-white border-purple-200 border-2 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 py-8">
          <CardTitle className="text-4xl font-bold text-center text-purple-800">Personal Vibes Creator</CardTitle>
          <CardDescription className="text-center text-purple-600 text-lg mt-2">
            Craft your unique mood-based visual symphony
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-purple-50 p-1 rounded-lg">
              <TabsTrigger value="create" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md transition-all duration-300">Create</TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md transition-all duration-300">Saved Vibes</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="create" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="name" className="text-lg font-semibold text-purple-700">Name your vibe</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-2 bg-purple-50 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                          placeholder="e.g., Cosmic Serenity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mood" className="text-lg font-semibold text-purple-700">Select a mood</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {moodOptions.map((option) => (
                            <Button
                              key={option.name}
                              onClick={() => setMood(option.name)}
                              className={`${option.color} hover:opacity-80 transition-all duration-300 ${mood === option.name ? 'ring-2 ring-purple-500' : ''}`}
                            >
                              {option.icon}
                              <span className="ml-2">{option.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="speed" className="text-lg font-semibold text-purple-700">Speed</Label>
                        <Slider
                          id="speed"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[speed]}
                          onValueChange={(value) => setSpeed(value[0])}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="complexity" className="text-lg font-semibold text-purple-700">Complexity</Label>
                        <Slider
                          id="complexity"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[complexity]}
                          onValueChange={(value) => setComplexity(value[0])}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="turbulence" className="text-lg font-semibold text-purple-700">Turbulence</Label>
                        <Slider
                          id="turbulence"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[turbulence]}
                          onValueChange={(value) => setTurbulence(value[0])}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoPlay"
                          checked={autoPlay}
                          onCheckedChange={setAutoPlay}
                        />
                        <Label htmlFor="autoPlay" className="text-purple-700">Auto-play themes</Label>
                      </div>
                      <Button onClick={handleSaveVibe} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Save Your Vibe
                      </Button>
                    </div>
                    <div className="relative h-64 md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg">
                      <ShaderComponent mood={mood} currentTheme={theme} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="saved" className="mt-6">
                  <ScrollArea className="h-[500px] rounded-2xl border-2 border-purple-100 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedVibes.map((vibe, index) => (
                        <motion.div
                          key={vibe.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="bg-white border-purple-200 hover:border-purple-400 transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                              <CardTitle className="text-lg font-semibold text-purple-700">{vibe.name}</CardTitle>
                              <CardDescription className="text-purple-600">Mood: {vibe.mood}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <p className="text-sm text-gray-600">Theme: {vibe.theme}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Speed: {vibe.shaderConfig.physics.speed.toFixed(2)},
                                Complexity: {vibe.shaderConfig.physics.complexity.toFixed(2)},
                                Turbulence: {vibe.shaderConfig.physics.turbulence.toFixed(2)}
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button
                                onClick={() => handleLoadVibe(vibe)}
                                className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200"
                              >
                                Load Vibe
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalVibes;