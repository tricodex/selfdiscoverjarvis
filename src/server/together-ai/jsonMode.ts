// src/server/together-ai/jsonMode.ts 
import Together from 'together-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { env } from "~/env";

const together = new Together({
  apiKey: env.TOGETHER_API_KEY,
});

// Defining the schema we want our data in
const voiceNoteSchema = z.object({
  title: z.string().describe('A title for the voice note'),
  summary: z
    .string()
    .describe('A short one sentence summary of the voice note.'),
  actionItems: z
    .array(z.string())
    .describe('A list of action items from the voice note'),
});

const jsonSchema = zodToJsonSchema(voiceNoteSchema, 'voiceNoteSchema');

export type VoiceNoteOutput = z.infer<typeof voiceNoteSchema>;

export async function extractVoiceNoteInfo(transcript: string): Promise<VoiceNoteOutput | string> {
  try {
    const extract = await together.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'The following is a voice message transcript. Only answer in JSON.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      response_format: { type: 'json_object', schema: jsonSchema as Record<string, unknown> },
    });

    if (extract?.choices?.[0]?.message?.content) {
      const output = JSON.parse(extract.choices[0].message.content) as VoiceNoteOutput;
      console.log(output);
      return output;
    }
    return 'No output.';
  } catch (error) {
    console.error('Error extracting voice note info:', error);
    throw new Error('Failed to extract voice note information');
  }
}

const questionsSchema = z.object({
  questions: z.array(z.object({
    text: z.string().describe('The question text'),
  })).min(1),
});

const questionsJsonSchema = zodToJsonSchema(questionsSchema, 'questionsSchema');

export type QuestionsOutput = z.infer<typeof questionsSchema>;

export async function extractQuestionsInfo(topic: string, numberOfQuestions: number): Promise<QuestionsOutput> {
  try {
    const prompt = `Generate ${numberOfQuestions} questions about ${topic}. Each question should be thought-provoking and suitable for a self-reflection assessment.`;
    
    const extract = await together.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in creating engaging and informative self-reflection questions, do truly unlock self-discovery for the user, you are a psychological wonder entity, that can make any one open up with your questions. Only answer in JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      response_format: { type: 'json_object', schema: questionsJsonSchema as Record<string, unknown> },
    });

    if (extract?.choices?.[0]?.message?.content) {
      const output = JSON.parse(extract.choices[0].message.content) as QuestionsOutput;
      return questionsSchema.parse(output);
    }
    throw new Error('No output generated');
  } catch (error) {
    console.error('Error extracting questions info:', error);
    throw new Error('Failed to extract questions information');
  }
}