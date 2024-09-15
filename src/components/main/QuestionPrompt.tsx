// src/components/main/QuestionPrompt.tsx
import React, { useState } from 'react';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import type { Theme, Question } from '~/types/assessment';

interface QuestionPromptProps {
  theme: Theme;
  question: Question;
  onAnswer: (answer: string) => void;
}

export const QuestionPrompt: React.FC<QuestionPromptProps> = ({ theme, question, onAnswer }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer);
      setAnswer('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{theme.name}</h2>
      <p className="text-lg mb-6">{question.text}</p>
      <Textarea
        className="w-full p-3 bg-gray-700 border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
        rows={4}
        placeholder="Reflect on your thoughts and experiences..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <Button onClick={handleSubmit} className="w-full">Submit Answer</Button>
    </div>
  );
};