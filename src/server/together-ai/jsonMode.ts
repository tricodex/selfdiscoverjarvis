import { Together } from 'together-ai';
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
          content:
            'The following is a voice message transcript. Only answer in JSON.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      response_format: { type: 'json_object', schema: jsonSchema },
    });

    if (extract?.choices?.[0]?.message?.content) {
      const output = JSON.parse(extract.choices[0].message.content) as VoiceNoteOutput;
      return output;
    }
    return 'No output.';
  } catch (error) {
    console.error('Error extracting voice note info:', error);
    throw new Error('Failed to extract voice note information');
  }
}