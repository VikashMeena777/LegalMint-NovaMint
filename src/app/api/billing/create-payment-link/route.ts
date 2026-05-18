import { NextResponse } from "next/server";
import crypto from "crypto";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

function getHeaders(): Record<string, string> {
  const appId = process.env.CASHFREE_APP_ID || "";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "";
  const timestamp = new Date().toISOString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const payload = `${appId}${timestamp}${nonce}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("base64");

  return {
    "Content-Type": "application/json",
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": "2023-08-01",
  };
}

export async function POST(req: Request) {
  try {
    const { planId, amount, customerEmail, customerPhone, customerName } =
      await req.json();

    if (!planId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const planPrices: Record<string, number> = {
      STARTER: 499,
      PROFESSIONAL: 1499,
      ENTERPRISE: 4999,
    };

    const finalAmount = amount || planPrices[planId] || 499;

    const orderId = `order_${crypto.randomBytes(8).toString("hex")}`;

    const orderPayload = {
      order_id: orderId,
      order_amount: finalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${crypto.randomBytes(8).toString("hex")}`,
        customer_email: customerEmail,
        customer_phone: customerPhone || "",
        customer_name: customerName || "",
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?order_id={order_id}`,
      },
      order_note: `LegalMint AI ${planId} plan subscription`,
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create payment link" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      paymentUrl: data.payment_url || data.payment_session_url,
      orderId: data.order_id,
    });
  } catch (error) {
    console.error("Cashfree payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
