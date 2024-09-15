// src/server/upstage/chat.ts

import { env } from "~/env";
import OpenAI from "openai";

const apiKey = env.UPSTAGE_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar',
});

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function chatWithAssistant(messages: Message[]): Promise<string> {
  try {
    const stream = await openai.chat.completions.create({
      model: 'solar-pro',
      messages: messages,
      stream: true
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      fullResponse += chunk.choices[0]?.delta?.content ?? '';
    }

    return fullResponse || 'No response generated';
  } catch (error) {
    console.error('Error chatting with assistant:', error);
    throw new Error('Failed to chat with assistant');
  }
}