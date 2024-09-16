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
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{theme.name}</h2>
      <p className="text-lg mb-6 text-gray-700">{question.text}</p>
      <Textarea
        className="w-full p-3 bg-white border-gray-300 text-gray-800 rounded-md focus:ring-2 focus:ring-turquoise-500 mb-4"
        rows={4}
        placeholder="Reflect on your thoughts and experiences..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <Button onClick={handleSubmit} className="w-full bg-turquoise-500 hover:bg-turquoise-600">
        Submit Answer
      </Button>
    </div>
  );
};
