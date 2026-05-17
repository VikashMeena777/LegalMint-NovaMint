import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
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
        await supabase
          .from("Subscription")
          .update({
            status: "ACTIVE",
            currentPeriodStart: new Date(data.start_time),
            currentPeriodEnd: new Date(data.end_time),
          })
          .eq("cashfreeSubscriptionId", data.subscription_id);
      }
      break;

    case "subscription_cancelled":
      if (data.subscription_id) {
        await supabase
          .from("Subscription")
          .update({
            status: "CANCELLED",
            cancelAtPeriodEnd: true,
          })
          .eq("cashfreeSubscriptionId", data.subscription_id);
      }
      break;

    case "payment_success":
      if (data.customer_id) {
        await supabase
          .from("Subscription")
          .update({
            cashfreeCustomerId: data.customer_id,
          })
          .eq("cashfreeCustomerId", data.customer_id);
      }
      break;

    default:
      console.log("Unhandled Cashfree event:", event);
  }

  return NextResponse.json({ received: true });
}
