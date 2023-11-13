import { createTRPCRouter } from "~/server/api/trpc";
import { ec2Router } from "./routers/ec2";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ec2: ec2Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
