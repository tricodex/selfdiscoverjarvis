// src/hooks/useAssessmentLogic.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '~/trpc/react';
import { useToast } from '~/hooks/use-toast';
import { themes } from '~/utils/assessmentThemes';
import type { Answer, AssessmentResult } from '~/types/assessment';

export const useAssessmentLogic = () => {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isReflecting, setIsReflecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const { toast } = useToast();

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
  } = api.assessment.getCurrentAssessment.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const submitAssessmentMutation = api.assessment.submitAssessment.useMutation();
  const generateInsightMutation = api.assessment.generateInsight.useMutation();

  const handleAnswer = useCallback((answer: string) => {
    if (!assessment) return;

    const newAnswer: Answer = {
      questionId: assessment.questions[currentQuestion]?.id ?? '',
      text: answer,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    
    void generateInsightMutation.mutateAsync(newAnswer).then((result) => {
      console.log("Generated insight:", result.insight);
    });

    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      if ((currentQuestion + 1) % Math.ceil(assessment.questions.length / themes.length) === 0) {
        setCurrentTheme((prev) => (prev + 1) % themes.length);
      }
    } else {
      void handleSubmit(newAnswers);
    }
  }, [answers, currentQuestion, assessment, generateInsightMutation]);

  const handleSubmit = useCallback(async (finalAnswers: Answer[]) => {
    if (!assessment) return;

    try {
      const result = await submitAssessmentMutation.mutateAsync({
        assessmentId: assessment.id,
        answers: finalAnswers,
      });

      setResult({
        insights: result.insights,
        personalityProfile: result.personalityProfile,
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: 'Submission Error',
        description: 'There was an error submitting your assessment. Please try again.',
        variant: 'destructive',
      });
    }
  }, [assessment, submitAssessmentMutation, toast]);

  return {
    assessment,
    isAssessmentLoading,
    currentTheme,
    currentQuestion,
    handleAnswer,
    isReflecting,
    showResults,
    result,
  };
};