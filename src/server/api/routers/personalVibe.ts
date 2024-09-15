import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { personalVibes } from "~/server/db/schema";

export const personalVibeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      mood: z.string().min(1),
      theme: z.number().int().nonnegative(),
      shaderConfig: z.object({
        colors: z.object({
          primary: z.tuple([z.number(), z.number(), z.number()]),
          secondary: z.tuple([z.number(), z.number(), z.number()]),
          accent: z.tuple([z.number(), z.number(), z.number()]),
        }),
        physics: z.object({
          speed: z.number(),
          complexity: z.number(),
          turbulence: z.number(),
        }),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(personalVibes).values({
        userId: ctx.session.user.id,
        name: input.name,
        mood: input.mood,
        theme: input.theme,
        shaderConfig: input.shaderConfig,
      });
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.personalVibes.findMany({
        where: (personalVibes, { eq }) => eq(personalVibes.userId, ctx.session.user.id),
        orderBy: (personalVibes, { desc }) => [desc(personalVibes.createdAt)],
      });
    }),
});