import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitMiddleware } from "@/lib/rate-limit";

export async function middleware(req: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              res.cookies.set(name, value, options);
            } else {
              res.cookies.set(name, value);
            }
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/reset-password") ||
    req.nextUrl.pathname.startsWith("/verify-email");

  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/onboarding") ||
    req.nextUrl.pathname.startsWith("/documents") ||
    req.nextUrl.pathname.startsWith("/compliance") ||
    req.nextUrl.pathname.startsWith("/settings") ||
    req.nextUrl.pathname.startsWith("/billing");

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.cashfree.com https://api.resend.com https://integrate.api.nvidia.com https://api.groq.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
  ],
};
