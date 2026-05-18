"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Scale, CheckCircle, Hourglass, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground">
            Legal<span className="text-primary">Ease</span> AI
          </span>
        </Link>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-8">
            {status === "checking" && (
              <div className="py-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-foreground">Verifying your email...</h1>
              </div>
            )}

            {status === "success" && (
              <div className="py-4">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">Your account is ready. Redirecting to dashboard...</p>
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="py-4">
                <Hourglass className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Email Not Verified</h1>
                <p className="text-muted-foreground mb-6">
                  Please check your inbox and click the verification link.
                  If you didn&apos;t receive it, try signing up again.
                </p>
                <Link href="/signup">
                  <Button variant="outline">
                    Back to Signup
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
