import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateDocument } from "../ai/service";

export const documentRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        businessProfileId: z.string().uuid().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("Document")
        .select("*, DocumentTemplate(name, category)")
        .eq("userId", ctx.user.id)
        .order("createdAt", { ascending: false });

      if (input?.businessProfileId) {
        query = query.eq("businessProfileId", input.businessProfileId);
      }
      if (input?.status) {
        query = query.eq("status", input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("Document")
        .select("*, DocumentTemplate(*), DocumentVersion(*)")
        .eq("id", input.id)
        .eq("userId", ctx.user.id)
        .single();

      if (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      return data;
    }),

  create: protectedProcedure
    .input(
      z.object({
        businessProfileId: z.string().uuid(),
        templateId: z.string().uuid().optional(),
        title: z.string().min(1),
        content: z.string(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
        generatedByAI: z.boolean().default(false),
        aiModel: z.string().optional(),
        customizations: z.record(z.unknown()).default({}),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("Document")
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

  generate: protectedProcedure
    .input(
      z.object({
        businessProfileId: z.string().uuid(),
        templateId: z.string().uuid(),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: template } = await ctx.supabase
        .from("DocumentTemplate")
        .select("*")
        .eq("id", input.templateId)
        .eq("isActive", true)
        .single();

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      const { data: profile } = await ctx.supabase
        .from("BusinessProfile")
        .select("*")
        .eq("id", input.businessProfileId)
        .eq("userId", ctx.user.id)
        .single();

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Business profile not found" });
      }

      const content = await generateDocument({
        templateContent: template.templateContent,
        businessProfile: profile as any,
        documentType: template.name,
        jurisdictions: template.applicableJurisdictions as string[],
      });

      const { data, error } = await ctx.supabase
        .from("Document")
        .insert({
          userId: ctx.user.id,
          businessProfileId: input.businessProfileId,
          templateId: input.templateId,
          title: input.title,
          content,
          generatedByAI: true,
          aiModel: process.env.PRIMARY_LLM_MODEL,
          status: "DRAFT",
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
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        customizations: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const { data: existing } = await ctx.supabase
        .from("Document")
        .select("id, version")
        .eq("id", id)
        .eq("userId", ctx.user.id)
        .single();

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      const { data, error } = await ctx.supabase
        .from("Document")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("Document")
        .update({
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
        })
        .eq("id", input.id)
        .eq("userId", ctx.user.id)
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
        .from("Document")
        .delete()
        .eq("id", input.id)
        .eq("userId", ctx.user.id);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { success: true };
    }),
});
