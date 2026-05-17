import { router } from "../trpc";
import { authRouter } from "./auth";
import { businessProfileRouter } from "./business";
import { documentRouter } from "./document";
import { complianceRouter } from "./compliance";

export const appRouter = router({
  auth: authRouter,
  business: businessProfileRouter,
  document: documentRouter,
  compliance: complianceRouter,
});

export type AppRouter = typeof appRouter;
