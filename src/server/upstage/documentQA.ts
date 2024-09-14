import { env } from "~/env";
import OpenAI from "openai";

const apiKey = env.UPSTAGE_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar',
});

export async function analyzeDocument(imageUrl: string, query: string): Promise<string> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'solar-docvision',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: query },
        ],
      }],
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content ?? 'No response generated';
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw new Error('Failed to analyze document');
  }
}