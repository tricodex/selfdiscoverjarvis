import { NextResponse } from 'next/server';
import { analyzeDocument } from '~/server/upstage/documentQA';
import { z } from 'zod';

const requestSchema = z.object({
  imageUrl: z.string().url(),
  query: z.string().min(1),
});

// type RequestBody = z.infer<typeof requestSchema>;

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

    const { imageUrl, query } = result.data;

    const analysisResult = await analyzeDocument(imageUrl, query);
    return NextResponse.json({ result: analysisResult });
  } catch (error) {
    console.error('Error in document-qa route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}