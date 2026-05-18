"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");

  useEffect(() => {
    const verify = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        setStatus("error");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl text-slate-900">LegalMint AI</span>
        </Link>

        {status === "checking" && (
          <div>
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Verifying your email...</h1>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h1>
            <p className="text-slate-600 mb-6">Your account is ready. Redirecting to dashboard...</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
              Go to Dashboard →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Not Verified</h1>
            <p className="text-slate-600 mb-6">
              Please check your inbox and click the verification link.
              If you didn&apos;t receive it, try signing up again.
            </p>
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Back to Signup →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
