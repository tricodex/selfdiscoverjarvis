import { NextResponse } from 'next/server';
import { extractVoiceNoteInfo } from '~/server/together-ai/jsonMode';
import { z } from 'zod';

const requestSchema = z.object({
  transcript: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.issues },
        { status: 400 }
      );
    }

    const { transcript } = result.data;

    const voiceNoteInfo = await extractVoiceNoteInfo(transcript);
    return NextResponse.json({ result: voiceNoteInfo });
  } catch (error) {
    console.error('Error in voice-note route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}