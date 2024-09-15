// src/app/api/assessment/generate-questions/route.ts
import { NextResponse } from 'next/server';
import { extractQuestionsInfo } from '~/server/together-ai/jsonMode';
import { z } from 'zod';

const requestSchema = z.object({
  topic: z.string().min(1),
  numberOfQuestions: z.number().int().positive().max(20),
});

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown;
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }

    const { topic, numberOfQuestions } = result.data;

    const questionsInfo = await extractQuestionsInfo(topic, numberOfQuestions);
    return NextResponse.json({ result: questionsInfo });
  } catch (error) {
    console.error('Error in generate-questions route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}