// src/components/main/Assessment.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useAssessmentLogic } from '~/hooks/useAssessmentLogic';
import { themes } from '~/utils/assessmentThemes';
import { Skeleton } from '~/components/ui/skeleton';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/trpc/react';
import { useToast } from '~/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { Progress } from '~/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ScrollArea } from '~/components/ui/scroll-area';
import { AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
// import { Separator } from '~/components/ui/separator';
import ReactMarkdown from 'react-markdown';

const AssessmentPage: React.FC = () => {
  const {
    assessment,
    isAssessmentLoading,
    currentQuestion,
    handleAnswer,
    showResults,
    result,
  } = useAssessmentLogic();

  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  const { toast } = useToast();

  const generateAssessmentMutation = api.assessment.generateAssessment.useMutation({
    onSuccess: () => {
      toast({
        title: "Assessment Generated",
        description: "Your new assessment is ready. Refreshing the page...",
        duration: 3000,
      });
      setTimeout(() => window.location.reload(), 3000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate assessment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const chatMutation = api.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.result }]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (assessment && currentQuestion < assessment.questions.length) {
      const questionText = assessment.questions[currentQuestion]?.text;
      if (questionText) {
        setConversation(prev => [...prev, { role: 'ai', content: questionText }]);
      }
    }
  }, [assessment, currentQuestion]);

  const handleGenerateAssessment = async () => {
    try {
      await generateAssessmentMutation.mutateAsync({ topic, numberOfQuestions });
    } catch (error) {
      console.error('Error generating assessment:', error);
    }
  };

  const handleChatSubmit = async () => {
    if (chatInput.trim()) {
      const newMessage = { role: 'user' as const, content: chatInput };
      setChatMessages((prev) => [...prev, newMessage]);
      setChatInput('');
      await chatMutation.mutateAsync({ messages: [...chatMessages, newMessage] });
    }
  };

  if (isAssessmentLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-3/4 bg-gray-700 mb-4" />
          <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
          <Skeleton className="h-4 w-5/6 bg-gray-700 mb-2" />
          <Skeleton className="h-4 w-4/5 bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Generate New Assessment</CardTitle>
          <CardDescription className="text-gray-400">
            Create a personalized assessment to explore your self-awareness and growth potential.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic" className="text-white">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter assessment topic"
                className="bg-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="numberOfQuestions" className="text-white">Number of Questions</Label>
              <Input
                id="numberOfQuestions"
                type="number"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
                min={1}
                max={20}
                className="bg-gray-700 text-white"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleGenerateAssessment} className="w-full">
                    Generate Assessment
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to create a new personalized assessment based on your chosen topic.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = () => {
    if (userInput.trim()) {
      setConversation(prev => [...prev, { role: 'user', content: userInput }]);
      handleAnswer(userInput);
      setUserInput('');
    }
  };

  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800 p-4 sm:p-8">
      <Card className="w-full max-w-6xl mx-auto bg-white shadow-lg border-turquoise-500 border-t-4">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">{assessment?.title || "Assessment"}</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Explore your inner self and gain valuable insights through this personalized assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="assessment" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="assessment" className="data-[state=active]:bg-white">Assessment</TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-white">Chat Support</TabsTrigger>
            </TabsList>
            <TabsContent value="assessment">
              <div className="mb-4">
                <Label className="text-sm text-gray-600">Progress</Label>
                <Progress value={progress} className="mt-2" />
              </div>
              <ScrollArea className="h-[400px] rounded-md border border-gray-200 p-4">
                <AnimatePresence>
                  {conversation.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar>
                          <AvatarImage src={message.role === 'user' ? '/user.svg' : '/logo.svg'} />
                          <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                        </Avatar>
                        <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-turquoise-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
              {!showResults && (
                <div className="mt-6">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full p-3 bg-white border-gray-300 text-gray-800 rounded-md focus:ring-2 focus:ring-turquoise-500 mb-4"
                    rows={4}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleSubmit} className="w-full bg-turquoise-500 hover:bg-turquoise-600">
                          Send Response
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Submit your answer to proceed to the next question.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {showResults && result && (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Insights</h2>
                  <Alert className="bg-turquoise-50 border-turquoise-200">
                    <AlertCircle className="h-4 w-4 text-turquoise-500" />
                    <AlertTitle className="text-turquoise-700">Personality Profile</AlertTitle>
                    <AlertDescription className="text-turquoise-600">
                      <ReactMarkdown>{result.personalityProfile}</ReactMarkdown>
                    </AlertDescription>
                  </Alert>
                  {result.insights.map((insight, index) => (
                    <Card key={index} className="mb-4 mt-4 bg-white border-turquoise-200">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-800">{themes[index]?.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ReactMarkdown>{insight}</ReactMarkdown>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="chat">
              <ScrollArea className="h-[400px] rounded-md border border-gray-200 p-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar>
                        <AvatarImage src={message.role === 'user' ? '/user.svg' : '/logo.svg'} />
                        <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                      </Avatar>
                      <div className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-turquoise-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="mt-4 flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow bg-white border-gray-300 text-gray-800"
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <Button onClick={handleChatSubmit} className="bg-turquoise-500 hover:bg-turquoise-600">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentPage;