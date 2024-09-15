// src/app/api/upstage/chat/route.ts
import { NextResponse } from 'next/server';
import { chatWithAssistant, type Message } from '~/server/upstage/chat';
import { z } from 'zod';

const requestSchema = z.object({
  messages: z.array(z.object({ 
    role: z.enum(['system', 'user', 'assistant', 'function']),
    content: z.string(),
    name: z.string().optional()
  })),
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

    const { messages } = result.data;
    const chatResult = await chatWithAssistant(messages as Message[]);
    return NextResponse.json({ result: chatResult });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in chat route:', errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}