// src/server/together-ai/assessmentAI.ts
import { Together } from 'together-ai';
import { env } from "~/env";
import { type Answer } from '~/types/assessment';

const together = new Together({
  apiKey: env.TOGETHER_API_KEY,
});

export async function generateInsightAI(answer: Answer): Promise<string> {
  const prompt = `Given the following answer to a self-reflection question, provide a short, insightful analysis:
Question ID: ${answer.questionId}
Answer: "${answer.text}"
Insight:`;

  const response = await together.chat.completions.create({
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "Unable to generate insight.";
}

export async function generatePersonalityProfileAI(answers: Answer[]): Promise<string> {
  const answersText = answers.map(a => `Question ${a.questionId}: ${a.text}`).join('\n');
  const prompt = `Based on the following answers to a self-reflection assessment, provide a comprehensive personality profile:
${answersText}
Personality Profile:`;

  const response = await together.chat.completions.create({
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "Unable to generate personality profile.";
}