// src/server/together-ai/shaderAI.ts
import Together from 'together-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { env } from "~/env";

const together = new Together({
  apiKey: env.TOGETHER_API_KEY,
});

// Define the schema for the shader configuration
const shaderConfigSchema = z.object({
  colors: z.object({
    primary: z.tuple([z.number(), z.number(), z.number()]).describe('RGB values between 0 and 1'),
    secondary: z.tuple([z.number(), z.number(), z.number()]).describe('RGB values between 0 and 1'),
    accent: z.tuple([z.number(), z.number(), z.number()]).describe('RGB values between 0 and 1'),
  }),
  physics: z.object({
    speed: z.number().min(0).max(1).describe('Float value between 0 and 1'),
    complexity: z.number().min(0).max(1).describe('Float value between 0 and 1'),
    turbulence: z.number().min(0).max(1).describe('Float value between 0 and 1'),
  }),
});

const jsonSchema = zodToJsonSchema(shaderConfigSchema, 'shaderConfigSchema');

export type ShaderConfig = z.infer<typeof shaderConfigSchema>;

// Fallback configurations for different moods
const fallbackConfigs: Record<string, ShaderConfig> = {
  default: {
    colors: {
      primary: [0.5, 0.5, 0.5],
      secondary: [0.7, 0.7, 0.7],
      accent: [1, 1, 1],
    },
    physics: {
      speed: 0.5,
      complexity: 0.5,
      turbulence: 0.5,
    },
  },
  energetic: {
    colors: {
      primary: [1, 0.5, 0],
      secondary: [1, 0.8, 0],
      accent: [1, 1, 1],
    },
    physics: {
      speed: 0.8,
      complexity: 0.7,
      turbulence: 0.6,
    },
  },
  // Add more fallback configs for other moods as needed
  cosmic: {
    colors: {
      primary: [0.2, 0.2, 0.2],
      secondary: [0.1, 0.1, 0.1],
      accent: [0.8, 0.8, 0.8],
    },
    physics: {
      speed: 0.3,
      complexity: 0.9,
      turbulence: 0.7,
    },
  },
  zen: {
    colors: {
      primary: [0.2, 0.8, 0.2],
      secondary: [0.1, 0.6, 0.1],
      accent: [0.8, 1, 0.8],
    },
    physics: {
      speed: 0.2,
      complexity: 0.2,
      turbulence: 0.2,
    },
  },
  forest: {
    colors: {
      primary: [0.1, 0.3, 0.1],
      secondary: [0.2, 0.5, 0.2],
      accent: [0.8, 1, 0.8],
    },
    physics: {
      speed: 0.4,
      complexity: 0.4,
      turbulence: 0.4,
    },
  },
};

export async function generateShaderConfig(mood: string, currentTheme: number): Promise<ShaderConfig> {
  try {
    const prompt = `Given a user's mood of "${mood}" and the current theme number ${currentTheme}, generate a GLSL shader configuration. The configuration should include color schemes and physics parameters that reflect the mood.`;

    const response = await together.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in creating GLSL shader configurations based on moods and themes. Only answer in JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      response_format: { type: 'json_object', schema: jsonSchema as Record<string, unknown> },
      max_tokens: 200,
      temperature: 0.7,
    });

    if (response?.choices?.[0]?.message?.content) {
      const output = JSON.parse(response.choices[0].message.content) as ShaderConfig;
      return shaderConfigSchema.parse(output);
    }

    throw new Error('No output generated');
  } catch (error) {
    console.error('Error generating shader config:', error);
    // Return a fallback configuration based on the mood, or a default if the mood is not recognized
    return fallbackConfigs[mood.toLowerCase()] ?? fallbackConfigs.default;
  }
}