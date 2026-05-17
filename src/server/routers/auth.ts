import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  getSession: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      session: ctx.session,
    };
  }),

  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            phone: input.phone,
          },
        },
      });

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return { user: data.user, session: data.session };
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message,
        });
      }

      return { user: data.user, session: data.session };
    }),

  signInWithOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.phone) {
        const { error } = await ctx.supabase.auth.signInWithOtp({
          phone: input.phone,
        });
        if (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        return { message: "OTP sent to phone" };
      }

      const { error } = await ctx.supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_APP_URL,
        },
      });

      if (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }

      return { message: "OTP sent to email" };
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        token: z.string(),
        type: z.enum(["email", "sms", "magiclink"]).default("email"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.verifyOtp({
        email: input.email ?? "",
        phone: input.phone ?? "",
        token: input.token,
        type: input.type as any,
      });

      if (error) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: error.message });
      }

      return { user: data.user, session: data.session };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();
    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    return { success: true };
  }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }

      return { message: "Password reset email sent" };
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.auth.updateUser({
        password: input.password,
      });

      if (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }

      return { success: true };
    }),
});
