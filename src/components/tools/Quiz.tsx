// src/components/main/Assessment.tsx
'use client';

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { useToast } from '~/hooks/use-toast';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

interface AssessmentData {
  id: number;
  createdAt: Date;
  title: string;
  description: string | null;
  questions: Question[];
}

const AssessmentPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
    refetch: refetchAssessment,
  } = api.assessment.getCurrentAssessment.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const generateAssessmentMutation = api.assessment.generateAssessment.useMutation({
    onSuccess: () => {
      void refetchAssessment();
    },
  });

  const submitAssessmentMutation = api.assessment.submitAssessment.useMutation();

  const handleGenerateAssessment = async () => {
    try {
      await generateAssessmentMutation.mutateAsync({ topic, numberOfQuestions });
      toast({
        title: 'Assessment Generated',
        description: 'Your assessment has been created successfully.',
      });
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast({
        title: 'Generation Error',
        description: 'There was an error generating your assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (assessment && currentQuestion < (assessment.questions as Question[]).length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    try {
      await submitAssessmentMutation.mutateAsync({
        assessmentId: assessment.id,
        answers,
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
  };

  if (isAssessmentLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Generate New Assessment</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter assessment topic"
            />
          </div>
          <div>
            <Label htmlFor="numberOfQuestions">Number of Questions</Label>
            <Input
              id="numberOfQuestions"
              type="number"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
              min={1}
              max={20}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateAssessment} className="w-full">
            Generate Assessment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const questions = assessment.questions as Question[];

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">{assessment.title}</h2>
        <p className="text-muted-foreground">{assessment.description}</p>
      </CardHeader>
      <CardContent>
        {!isComplete ? (
          <>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-4" />
            <p className="mb-4 font-medium">{questions[currentQuestion]?.text}</p>
            <RadioGroup onValueChange={(value) => handleAnswer(parseInt(value, 10))}>
              {questions[currentQuestion]?.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </>
        ) : (
          <p>Assessment complete! Ready to submit your answers?</p>
        )}
      </CardContent>
      <CardFooter>
        {isComplete && (
          <Button onClick={handleSubmit} className="w-full">
            Submit Assessment
          </Button>
        )}
      </CardFooter>

      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assessment Results</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve completed the assessment. Here are your results:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {questions.map((question: Question, index: number) => (
              <div key={index} className="mb-4">
                <p className="font-medium">{question.text}</p>
                <p
                  className={
                    answers[index] === question.correctAnswer ? 'text-green-600' : 'text-red-600'
                  }
                >
                  Your answer: {answers[index] !== undefined ? question.options[answers[index]] : 'Not answered'}
                </p>
                {answers[index] !== question.correctAnswer && (
                  <p className="text-green-600">
                    Correct answer: {question.options[question.correctAnswer]}
                  </p>
                )}
              </div>
            ))}
            <p className="font-bold mt-4">
              Score:{' '}
              {answers.filter((answer, index) => answer === questions[index]?.correctAnswer).length}{' '}
              / {questions.length}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowResults(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AssessmentPage;