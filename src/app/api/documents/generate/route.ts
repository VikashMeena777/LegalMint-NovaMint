import { createServerClient } from "@/lib/supabase/server";
import { generateDocument } from "@/server/ai/service";
import { logActivity } from "@/lib/activity-logger";
import { sendDocumentReadyEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessProfileId, templateId, title } = await req.json();

    if (!businessProfileId || !templateId || !title) {
      return NextResponse.json(
        { error: "businessProfileId, templateId, and title are required" },
        { status: 400 }
      );
    }

    // ─── Plan Enforcement ──────────────────────────────────────────────
    // 1. Fetch user active subscription
    const { data: subscription } = await supabase
      .from("Subscription")
      .select("*")
      .eq("userId", user.id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    const planId = subscription?.plan || "FREE";

    // 2. Set limits
    const limits: Record<string, number> = {
      FREE: 5,
      STARTER: 50,
      PROFESSIONAL: 200,
      ENTERPRISE: Infinity,
    };
    const limit = limits[planId] || 5;

    // 3. Count documents generated in current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("Document")
      .select("*", { count: "exact", head: true })
      .eq("userId", user.id)
      .gte("createdAt", startOfMonth.toISOString());

    if (countError) {
      console.error("Count documents error:", countError);
    } else if (count !== null && count >= limit) {
      return NextResponse.json(
        {
          error: `Monthly plan limit reached. You have generated ${count} of ${limit} allowed documents on your ${planId} plan this month. Please upgrade your plan to generate more.`,
        },
        { status: 403 }
      );
    }
    // ───────────────────────────────────────────────────────────────────

    // Retrieve and validate template
    const { data: template, error: templateError } = await supabase
      .from("DocumentTemplate")
      .select("*")
      .eq("id", templateId)
      .eq("isActive", true)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Retrieve and validate business profile ownership
    const { data: profile, error: profileError } = await supabase
      .from("BusinessProfile")
      .select("*")
      .eq("id", businessProfileId)
      .eq("userId", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Business profile not found or access denied" },
        { status: 404 }
      );
    }

    // Call AI generation service
    const content = await generateDocument({
      templateContent: template.templateContent,
      businessProfile: profile as any,
      documentType: template.name,
      jurisdictions: (template.applicableJurisdictions as string[]) || ["India"],
    });

    // Save document to DB
    const { data: doc, error: insertError } = await supabase
      .from("Document")
      .insert({
        userId: user.id,
        businessProfileId,
        templateId,
        title,
        content,
        generatedByAI: true,
        aiModel: process.env.PRIMARY_LLM_MODEL || "meta/llama-3.1-70b-instruct",
        status: "DRAFT",
        version: "1.0.0",
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert generated document error:", insertError);
      return NextResponse.json(
        { error: "Failed to save generated document to database" },
        { status: 500 }
      );
    }

    // Fire-and-forget log activity (non-blocking)
    logActivity({
      userId: user.id,
      action: "document.generate",
      resourceId: doc.id,
      resourceType: "Document",
      metadata: { title: doc.title, templateId: doc.templateId, planId },
    }).catch((err) => console.error("Logging document generation failed:", err));

    // Send email notification (non-blocking)
    if (user.email) {
      sendDocumentReadyEmail(user.email, doc.title).catch((err) =>
        console.error("Sending document ready email failed:", err)
      );
    }

    return NextResponse.json(doc);
  } catch (error: any) {
    console.error("Document generation route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
