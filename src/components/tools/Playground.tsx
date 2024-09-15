// src/components/main/Playground.tsx
'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";

interface ApiResponse {
  result?: unknown;
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Playground: React.FC = () => {
  const [documentQAInput, setDocumentQAInput] = useState({ imageUrl: '', query: '' });
  const [jsonModeInput, setJsonModeInput] = useState('');
  const [functionInput, setFunctionInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState({
    documentQA: '',
    jsonMode: '',
    function: '',
    chat: '',
  });
  const [activeTab, setActiveTab] = useState<keyof typeof results>('documentQA');

  const handleApiCall = async (
    endpoint: string,
    body: Record<string, unknown>,
    resultKey: keyof typeof results
  ): Promise<void> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json() as ApiResponse;
      setResults(prev => ({ ...prev, [resultKey]: JSON.stringify(data, null, 2) }));
    } catch (error) {
      console.error(`Error in ${resultKey}:`, error);
      setResults(prev => ({ ...prev, [resultKey]: 'Error occurred' }));
    }
  };

  const handleDocumentQA = () => handleApiCall('/api/upstage/document-qa', documentQAInput, 'documentQA');
  const handleJsonMode = () => handleApiCall('/api/together-ai/json-mode', { transcript: jsonModeInput }, 'jsonMode');
  const handleFunction = () => handleApiCall('/api/together-ai/function', { query: functionInput }, 'function');

  const handleChat = async () => {
    const newMessage: ChatMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);

    try {
      const response = await fetch('/api/upstage/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json() as ApiResponse;
      
      if (typeof data.result === 'string') {
        const assistantMessage: ChatMessage = { role: 'assistant', content: data.result };
        setChatMessages([...updatedMessages, assistantMessage]);
      }
      setResults(prev => ({ ...prev, chat: JSON.stringify(data, null, 2) }));
      setChatInput('');
    } catch (error) {
      console.error('Error in Chat:', error);
      setResults(prev => ({ ...prev, chat: 'Error occurred' }));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Playground</CardTitle>
        <CardDescription>Test various API routes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documentQA" onValueChange={(value) => setActiveTab(value as keyof typeof results)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documentQA">Document QA</TabsTrigger>
            <TabsTrigger value="jsonMode">JSON Mode</TabsTrigger>
            <TabsTrigger value="function">Function</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documentQA">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={documentQAInput.imageUrl}
                  onChange={(e) => setDocumentQAInput(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="query">Query</Label>
                <Input
                  id="query"
                  value={documentQAInput.query}
                  onChange={(e) => setDocumentQAInput(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="Enter your query"
                />
              </div>
              <Button onClick={handleDocumentQA}>Submit</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="jsonMode">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea
                  id="transcript"
                  value={jsonModeInput}
                  onChange={(e) => setJsonModeInput(e.target.value)}
                  placeholder="Enter transcript"
                />
              </div>
              <Button onClick={handleJsonMode}>Submit</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="function">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="functionQuery">Query</Label>
                <Input
                  id="functionQuery"
                  value={functionInput}
                  onChange={(e) => setFunctionInput(e.target.value)}
                  placeholder="Enter your query"
                />
              </div>
              <Button onClick={handleFunction}>Submit</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="space-y-4">
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                    <strong>{msg.role}:</strong> {msg.content}
                  </div>
                ))}
              </ScrollArea>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="chatInput">Message</Label>
                <Input
                  id="chatInput"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enter your message"
                />
              </div>
              <Button onClick={handleChat}>Send</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <Label htmlFor="results">Results</Label>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <pre id="results">{results[activeTab]}</pre>
          </ScrollArea>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Playground;