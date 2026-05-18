import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

const welcomeEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(120),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = welcomeEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await sendWelcomeEmail(parsed.data.email, parsed.data.name);
  return NextResponse.json({ ok: true });
}
