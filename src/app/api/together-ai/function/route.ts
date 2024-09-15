// src/app/api/together-ai/function/route.ts
import { NextResponse } from 'next/server';
import { processUserQuery } from '~/server/together-ai/functionCalling';
import { z } from 'zod';

const requestSchema = z.object({
  query: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown;
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.issues },
        { status: 400 }
      );
    }

    const { query } = result.data;

    const aiResponse = await processUserQuery(query);
    return NextResponse.json({ result: aiResponse });
  } catch (error) {
    console.error('Error in function route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}