import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const complianceRouter = router({
  getJurisdictions: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("Jurisdiction")
      .select("*")
      .order("name");

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }

    return data;
  }),

  getComplianceRequirements: protectedProcedure
    .input(
      z.object({
        jurisdictionId: z.string().uuid().optional(),
        category: z.enum([
          "PRIVACY",
          "CONSUMER",
          "EMPLOYMENT",
          "TAX",
          "GST",
          "CORPORATE",
          "LABOUR",
          "SECTOR_SPECIFIC",
          "ENVIRONMENT",
          "IP",
          "OTHER",
        ]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("ComplianceRequirement")
        .select("*, Jurisdiction(*)")
        .order("name");

      if (input?.jurisdictionId) {
        query = query.eq("jurisdictionId", input.jurisdictionId);
      }
      if (input?.category) {
        query = query.eq("category", input.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  getDocumentTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isActive: z.boolean().default(true),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("DocumentTemplate")
        .select("*")
        .order("name");

      if (input?.category) {
        query = query.eq("category", input.category);
      }
      if (input?.isActive !== undefined) {
        query = query.eq("isActive", input.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  getComplianceMappings: protectedProcedure
    .input(z.object({ businessProfileId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("ComplianceMapping")
        .select("*, ComplianceRequirement(*, Jurisdiction(*))")
        .eq("businessProfileId", input.businessProfileId)
        .order("createdAt", { ascending: false });

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  updateComplianceStatus: protectedProcedure
    .input(
      z.object({
        businessProfileId: z.string().uuid(),
        complianceRequirementId: z.string().uuid(),
        status: z.enum(["COMPLIANT", "NON_COMPLIANT", "IN_PROGRESS", "NOT_APPLICABLE"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("ComplianceMapping")
        .upsert({
          businessProfileId: input.businessProfileId,
          complianceRequirementId: input.complianceRequirementId,
          status: input.status,
          notes: input.notes,
          lastReviewedAt: new Date().toISOString(),
        }, {
          onConflict: "businessProfileId,complianceRequirementId",
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  getAlerts: protectedProcedure
    .input(
      z.object({
        isRead: z.boolean().optional(),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("ComplianceAlert")
        .select("*")
        .eq("userId", ctx.user.id)
        .order("createdAt", { ascending: false })
        .limit(input?.limit ?? 50);

      if (input?.isRead !== undefined) {
        query = query.eq("isRead", input.isRead);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  markAlertRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("ComplianceAlert")
        .update({ isRead: true })
        .eq("id", input.id)
        .eq("userId", ctx.user.id);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { success: true };
    }),

  dismissAlert: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("ComplianceAlert")
        .update({ dismissedAt: new Date().toISOString() })
        .eq("id", input.id)
        .eq("userId", ctx.user.id);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { success: true };
    }),

  getComplianceScore: protectedProcedure
    .input(z.object({ businessProfileId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: mappings, error } = await ctx.supabase
        .from("ComplianceMapping")
        .select("status, ComplianceRequirement(isMandatory)")
        .eq("businessProfileId", input.businessProfileId);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (!mappings || mappings.length === 0) {
        return {
          score: 0,
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          inProgress: 0,
          notApplicable: 0,
        };
      }

      const total = mappings.length;
      const compliant = mappings.filter((m) => m.status === "COMPLIANT").length;
      const nonCompliant = mappings.filter((m) => m.status === "NON_COMPLIANT").length;
      const inProgress = mappings.filter((m) => m.status === "IN_PROGRESS").length;
      const notApplicable = mappings.filter((m) => m.status === "NOT_APPLICABLE").length;

      const score = Math.round((compliant / (total - notApplicable || 1)) * 100);

      return {
        score,
        total,
        compliant,
        nonCompliant,
        inProgress,
        notApplicable,
      };
    }),
});
