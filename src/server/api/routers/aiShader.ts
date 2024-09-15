// src/server/api/routers/aiShader.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generateShaderConfig } from "~/server/together-ai/shaderAI"; // We'll create this file next

export const aiShaderRouter = createTRPCRouter({
  getShaderConfig: protectedProcedure
    .input(z.object({
      mood: z.string(),
      currentTheme: z.number(),
    }))
    .query(async ({ input }) => {
      const shaderConfig = await generateShaderConfig(input.mood, input.currentTheme);
      return shaderConfig;
    }),
});