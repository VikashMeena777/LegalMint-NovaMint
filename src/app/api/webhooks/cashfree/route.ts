import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { logActivity } from "@/lib/activity-logger";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: Request) {
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  const body = await req.json();
  const signature = req.headers.get("x-webhook-signature");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET || "")
    .update(JSON.stringify(body))
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, data } = body;

  switch (event) {
    case "subscription_paid":
      if (data.subscription_id) {
        // Retrieve the subscription first to get the associated userId
        const { data: sub } = await supabase
          .from("Subscription")
          .select("id, userId")
          .eq("cashfreeSubscriptionId", data.subscription_id)
          .maybeSingle();

        if (sub) {
          await supabase
            .from("Subscription")
            .update({
              status: "ACTIVE",
              currentPeriodStart: new Date(data.start_time).toISOString(),
              currentPeriodEnd: new Date(data.end_time).toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .eq("id", sub.id);

          await logActivity({
            userId: sub.userId,
            action: "billing.subscription-paid",
            resourceId: sub.id,
            resourceType: "Subscription",
            metadata: { subscriptionId: data.subscription_id, plan: data.plan_id },
          }).catch((err) => console.error("Logging subscription paid failed:", err));
        }
      }
      break;

    case "subscription_cancelled":
      if (data.subscription_id) {
        const { data: sub } = await supabase
          .from("Subscription")
          .select("id, userId")
          .eq("cashfreeSubscriptionId", data.subscription_id)
          .maybeSingle();

        if (sub) {
          await supabase
            .from("Subscription")
            .update({
              status: "CANCELLED",
              cancelAtPeriodEnd: true,
              updatedAt: new Date().toISOString(),
            })
            .eq("id", sub.id);

          await logActivity({
            userId: sub.userId,
            action: "billing.subscription-cancelled",
            resourceId: sub.id,
            resourceType: "Subscription",
            metadata: { subscriptionId: data.subscription_id },
          }).catch((err) => console.error("Logging subscription cancelled failed:", err));
        }
      }
      break;

    case "payment_success":
      // Safe fallback for logging payment success
      if (data.customer_id) {
        const { data: sub } = await supabase
          .from("Subscription")
          .select("id, userId")
          .eq("cashfreeCustomerId", data.customer_id)
          .maybeSingle();

        if (sub) {
          await logActivity({
            userId: sub.userId,
            action: "billing.payment-success",
            resourceId: sub.id,
            resourceType: "Subscription",
            metadata: { customerId: data.customer_id, orderId: data.order_id },
          }).catch((err) => console.error("Logging payment success failed:", err));
        }
      }
      break;

    default:
      console.log("Unhandled Cashfree event:", event);
  }

  return NextResponse.json({ received: true });
}
