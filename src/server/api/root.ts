import { postRouter } from "~/server/api/routers/post";
import { assessmentRouter } from "~/server/api/routers/assessment";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { aiShaderRouter } from "~/server/api/routers/aiShader";
import { chatRouter } from "~/server/api/routers/chat"; 
import { personalVibeRouter } from "~/server/api/routers/personalVibe";




/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  assessment: assessmentRouter,
  aiShader: aiShaderRouter,
  chat: chatRouter, 
  personalVibe: personalVibeRouter,



});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
