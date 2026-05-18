import { initTRPC, TRPCError } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { createClient } from "@supabase/supabase-js";
import superjson from "superjson";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function createContext({ req }: CreateNextContextOptions) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const cookie = req.headers.cookie;
  if (cookie) {
    const tokenMatch = cookie.match(/sb-[a-z]+-auth-token=([^;]+)/);
    if (tokenMatch) {
      try {
        const token = JSON.parse(decodeURIComponent(tokenMatch[1]));
        if (token?.access_token) {
          await supabase.auth.setSession({
            access_token: token.access_token,
            refresh_token: token.refresh_token || "",
          });
        }
      } catch {
        // Invalid cookie format, ignore
      }
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
      session: ctx.session!,
      supabase: ctx.supabase,
    },
  });
});
