import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getBillablePlan, resolvePlanAmount } from "@/lib/billing";
import { createServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-logger";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

const createPaymentLinkSchema = z.object({
  planId: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
});

function getHeaders(idempotencyKey: string): Record<string, string> {
  const appId = process.env.CASHFREE_APP_ID || "";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "";

  return {
    "Content-Type": "application/json",
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": "2023-08-01",
    "x-idempotency-key": idempotencyKey,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createPaymentLinkSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment request" },
        { status: 400 }
      );
    }

    const { planId, customerEmail, customerPhone, customerName } = parsed.data;
    
    // Log checkout initiation (non-blocking)
    logActivity({
      userId: user.id,
      action: "billing.checkout-initiated",
      metadata: { planId, customerEmail },
    }).catch((err) => console.error("Logging checkout initiation failed:", err));

    const plan = getBillablePlan(planId);
    const amount = resolvePlanAmount(planId);

    if (!plan || !amount) {
      return NextResponse.json(
        { error: "This plan is not available for online checkout" },
        { status: 400 }
      );
    }

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Cashfree is not configured" },
        { status: 500 }
      );
    }

    const linkId = `lm_${plan.id.toLowerCase()}_${crypto.randomBytes(8).toString("hex")}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing?link_id={link_id}`;
    const customerDetails: {
      customer_email: string;
      customer_name: string;
      customer_phone?: string;
    } = {
      customer_email: customerEmail,
      customer_name: customerName || "",
    };

    if (customerPhone) {
      customerDetails.customer_phone = customerPhone;
    }

    const linkPayload = {
      link_id: linkId,
      link_amount: amount,
      link_currency: "INR",
      link_purpose: `LegalMint AI ${plan.name} plan subscription`,
      customer_details: customerDetails,
      link_meta: {
        return_url: returnUrl,
      },
      link_notify: {
        send_email: true,
        send_sms: !!customerPhone,
      },
      link_auto_reminders: !!customerPhone,
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/pg/links`, {
      method: "POST",
      headers: getHeaders(crypto.randomUUID()),
      body: JSON.stringify(linkPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create payment link" },
        { status: response.status }
      );
    }

    if (!data.link_url) {
      return NextResponse.json(
        { error: "Cashfree did not return a payment link" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      paymentUrl: data.link_url,
      linkId: data.link_id,
      planId: plan.id,
      amount,
    });
  } catch (error) {
    console.error("Cashfree payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
