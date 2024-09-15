// src/server/api/routers/chat.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { chatWithAssistant } from "~/server/upstage/chat";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await chatWithAssistant(input.messages);
        return { result: response };
      } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to process chat message");
      }
    }),
});