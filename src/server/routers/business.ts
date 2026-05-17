import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const businessProfileRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("BusinessProfile")
      .select("*")
      .eq("userId", ctx.user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }

    return data;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("BusinessProfile")
        .select("*, OnboardingAnswer(*)")
        .eq("id", input.id)
        .eq("userId", ctx.user.id)
        .single();

      if (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business profile not found" });
      }

      return data;
    }),

  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        businessEntity: z.enum([
          "PROPRIETORSHIP",
          "PARTNERSHIP",
          "LLP",
          "PRIVATE_LIMITED",
          "PUBLIC_LIMITED",
          "OPC",
          "SECTION_8",
          "HUF",
          "OTHER",
        ]),
        businessType: z.enum([
          "SAAS",
          "ECOMMERCE",
          "MARKETPLACE",
          "CONTENT",
          "FINTECH",
          "HEALTHCARE",
          "EDTECH",
          "MANUFACTURING",
          "RETAIL",
          "SERVICES",
          "AGENCY",
          "OTHER",
        ]),
        description: z.string().optional(),
        website: z.string().optional(),
        gstin: z.string().optional(),
        pan: z.string().optional(),
        cin: z.string().optional(),
        llpin: z.string().optional(),
        employeeCount: z.number().optional(),
        annualRevenue: z.number().optional(),
        foundedYear: z.number().optional(),
        incorporatedState: z.string().optional(),
        operatingStates: z.array(z.string()).default([]),
        targetAudience: z.enum(["B2B", "B2C", "BOTH"]).default("BOTH"),
        collectsPersonalData: z.boolean().default(false),
        dataTypesCollected: z.array(z.string()).default([]),
        usesThirdPartyServices: z.boolean().default(false),
        thirdPartyServices: z.array(z.string()).default([]),
        hasPaymentProcessing: z.boolean().default(false),
        paymentMethods: z.array(z.string()).default([]),
        usesCookies: z.boolean().default(false),
        cookieTypes: z.array(z.string()).default([]),
        hasUserAccounts: z.boolean().default(false),
        hasNewsletter: z.boolean().default(false),
        usesAnalytics: z.boolean().default(false),
        analyticsTools: z.array(z.string()).default([]),
        hasApiIntegrations: z.boolean().default(false),
        hasGrievanceOfficer: z.boolean().default(false),
        grievanceOfficerEmail: z.string().optional(),
        dataProtectionOfficer: z.boolean().default(false),
        dpoEmail: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("BusinessProfile")
        .insert({
          ...input,
          userId: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        companyName: z.string().min(1).optional(),
        businessEntity: z
          .enum([
            "PROPRIETORSHIP",
            "PARTNERSHIP",
            "LLP",
            "PRIVATE_LIMITED",
            "PUBLIC_LIMITED",
            "OPC",
            "SECTION_8",
            "HUF",
            "OTHER",
          ])
          .optional(),
        businessType: z
          .enum([
            "SAAS",
            "ECOMMERCE",
            "MARKETPLACE",
            "CONTENT",
            "FINTECH",
            "HEALTHCARE",
            "EDTECH",
            "MANUFACTURING",
            "RETAIL",
            "SERVICES",
            "AGENCY",
            "OTHER",
          ])
          .optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        gstin: z.string().optional(),
        pan: z.string().optional(),
        cin: z.string().optional(),
        llpin: z.string().optional(),
        employeeCount: z.number().optional(),
        annualRevenue: z.number().optional(),
        foundedYear: z.number().optional(),
        incorporatedState: z.string().optional(),
        operatingStates: z.array(z.string()).optional(),
        targetAudience: z.enum(["B2B", "B2C", "BOTH"]).optional(),
        collectsPersonalData: z.boolean().optional(),
        dataTypesCollected: z.array(z.string()).optional(),
        usesThirdPartyServices: z.boolean().optional(),
        thirdPartyServices: z.array(z.string()).optional(),
        hasPaymentProcessing: z.boolean().optional(),
        paymentMethods: z.array(z.string()).optional(),
        usesCookies: z.boolean().optional(),
        cookieTypes: z.array(z.string()).optional(),
        hasUserAccounts: z.boolean().optional(),
        hasNewsletter: z.boolean().optional(),
        usesAnalytics: z.boolean().optional(),
        analyticsTools: z.array(z.string()).optional(),
        hasApiIntegrations: z.boolean().optional(),
        hasGrievanceOfficer: z.boolean().optional(),
        grievanceOfficerEmail: z.string().optional(),
        dataProtectionOfficer: z.boolean().optional(),
        dpoEmail: z.string().optional(),
        onboardingCompleted: z.boolean().optional(),
        onboardingStep: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const { data: existing } = await ctx.supabase
        .from("BusinessProfile")
        .select("id")
        .eq("id", id)
        .eq("userId", ctx.user.id)
        .single();

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business profile not found" });
      }

      const { data, error } = await ctx.supabase
        .from("BusinessProfile")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("BusinessProfile")
        .delete()
        .eq("id", input.id)
        .eq("userId", ctx.user.id);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { success: true };
    }),

  completeOnboarding: protectedProcedure
    .input(
      z.object({
        businessProfileId: z.string().uuid(),
        answers: z.array(
          z.object({
            questionKey: z.string(),
            question: z.string(),
            answer: z.string(),
            stepNumber: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: profile } = await ctx.supabase
        .from("BusinessProfile")
        .select("id")
        .eq("id", input.businessProfileId)
        .eq("userId", ctx.user.id)
        .single();

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business profile not found" });
      }

      const onboardingData = input.answers.map((a) => ({
        ...a,
        businessProfileId: input.businessProfileId,
      }));

      const { error: answersError } = await ctx.supabase
        .from("OnboardingAnswer")
        .upsert(onboardingData, {
          onConflict: "businessProfileId,questionKey",
        });

      if (answersError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: answersError.message });
      }

      const { data, error } = await ctx.supabase
        .from("BusinessProfile")
        .update({ onboardingCompleted: true })
        .eq("id", input.businessProfileId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),
});
