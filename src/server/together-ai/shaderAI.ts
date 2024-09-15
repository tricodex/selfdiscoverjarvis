// src/server/together-ai/shaderAI.ts
import { Together } from 'together-ai';
import { env } from "~/env";

const together = new Together({
  apiKey: env.TOGETHER_API_KEY,
});

export async function generateShaderConfig(mood: string, currentTheme: number): Promise<string> {
  const prompt = `Given a user's mood of "${mood}" and the current theme number ${currentTheme}, generate a GLSL shader configuration. The configuration should include color schemes and physics parameters that reflect the mood. Provide the response as a JSON string with the following structure:
  {
    "colors": {
      "primary": [r, g, b],
      "secondary": [r, g, b],
      "accent": [r, g, b]
    },
    "physics": {
      "speed": number,
      "complexity": number,
      "turbulence": number
    }
  }
  Where r, g, b are float values between 0 and 1, and the physics parameters are float values between 0 and 1.`;

  const response = await together.chat.completions.create({
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "{}";
}