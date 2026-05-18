"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, CheckCircle, Hourglass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
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

    void verify();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md text-center">
        <Logo size="md" className="mb-8 justify-center" />

        <Card className="border-border">
          <CardContent className="p-6">
            {status === "checking" && (
              <div className="py-4">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Verifying your email...</h1>
              </div>
            )}

            {status === "success" && (
              <div className="py-4">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
                <h1 className="mb-2 text-2xl font-semibold text-foreground">Email Verified</h1>
                <p className="mb-6 text-muted-foreground">Your account is ready. Redirecting to dashboard...</p>
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="py-4">
                <Hourglass className="mx-auto mb-4 h-16 w-16 text-secondary" />
                <h1 className="mb-2 text-2xl font-semibold text-foreground">Email Not Verified</h1>
                <p className="mb-6 text-muted-foreground">
                  Please check your inbox and click the verification link.
                  If you didn&apos;t receive it, try signing up again.
                </p>
                <Link href="/signup">
                  <Button variant="outline">
                    Back to Signup
                    <ArrowRight className="ml-2 h-4 w-4" />
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
