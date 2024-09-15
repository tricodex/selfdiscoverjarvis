// src/types/assessment.ts

export interface Theme {
  name: string;
  color: string;
  icon: string;
}

export interface Question {
  id: string;
  text: string;
  theme: string;
}

export interface AssessmentData {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  text: string;
}

export interface AssessmentResult {
  personalityProfile: string;
  insights: string[];
}