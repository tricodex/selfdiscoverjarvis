// src/server/api/routers/assessment.ts

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { assessments, userResponses } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { generateInsightAI, generatePersonalityProfileAI } from "~/server/together-ai/assessmentAI";
import { nanoid } from 'nanoid';

const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  theme: z.string(),
});

const assessmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  questions: z.array(questionSchema),
});

export const assessmentRouter = createTRPCRouter({
  getCurrentAssessment: protectedProcedure
    .query(async ({ ctx }) => {
      const assessment = await ctx.db.query.assessments.findFirst({
        orderBy: (assessments, { desc }) => [desc(assessments.createdAt)],
      });
      
      if (!assessment) {
        return null;
      }
      
      return assessmentSchema.parse(assessment);
    }),

  generateAssessment: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      numberOfQuestions: z.number().int().positive().max(20),
    }))
    .mutation(async ({ ctx, input }) => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "NEXT_PUBLIC_BASE_URL is not set",
        });
      }

      const response = await fetch(`${baseUrl}/api/assessment/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate questions",
        });
      }

      const { result } = await response.json() as { result: { questions: z.infer<typeof questionSchema>[] } };

      // Add id and theme to each question
      const questionsWithIds = result.questions.map(q => ({
        ...q,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        id: nanoid(),
        theme: 'general', // Assign themes as needed
      }));

      const [newAssessment] = await ctx.db.insert(assessments).values({
        title: `Assessment on ${input.topic}`,
        description: `A ${input.numberOfQuestions}-question assessment about ${input.topic}`,
        questions: questionsWithIds,
      }).returning();

      return assessmentSchema.parse(newAssessment);
    }),

  submitAssessment: protectedProcedure
    .input(z.object({
      assessmentId: z.number().int().positive(),
      answers: z.array(z.object({
        questionId: z.string(),
        text: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { assessmentId, answers } = input;

      await ctx.db.insert(userResponses).values({
        userId: ctx.session.user.id,
        assessmentId,
        answers: JSON.stringify(answers),
      });

      const insights = await Promise.all(answers.map(answer => generateInsightAI(answer)));
      const personalityProfile = await generatePersonalityProfileAI(answers);

      return { 
        success: true,
        insights,
        personalityProfile,
      };
    }),

  generateInsight: protectedProcedure
    .input(z.object({
      questionId: z.string(),
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      const insight = await generateInsightAI(input);
      return { insight };
    }),

  generatePersonalityProfile: protectedProcedure
    .input(z.array(z.object({
      questionId: z.string(),
      text: z.string(),
    })))
    .mutation(async ({ input }) => {
      const profile = await generatePersonalityProfileAI(input);
      return { profile };
    }),
});