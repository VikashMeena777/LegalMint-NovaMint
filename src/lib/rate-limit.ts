import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  "/api/billing/create-payment-link": { max: 10, window: 60 },
  "/api/documents/export": { max: 20, window: 60 },
  "/api/documents/generate": { max: 10, window: 60 },
  "/api/auth/logout": { max: 5, window: 60 },
  default: { max: 100, window: 60 },
};

const ipMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(pathname: string) {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return RATE_LIMITS.default;
}

export function rateLimitMiddleware(req: NextRequest): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  const limit = getRateLimit(req.nextUrl.pathname);

  const now = Date.now();

  // Proactive memory leak prevention: clean up expired entries
  if (Math.random() < 0.05) {
    for (const [key, value] of ipMap.entries()) {
      if (now > value.resetTime) {
        ipMap.delete(key);
      }
    }
  }

  const entry = ipMap.get(ip);

  if (entry && now < entry.resetTime) {
    entry.count++;
    if (entry.count > limit.max) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  } else {
    ipMap.set(ip, { count: 1, resetTime: now + limit.window * 1000 });
  }

  return null;
}
