"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

function ResetForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");

  useEffect(() => {
    // 1. Listen for PASSWORD_RECOVERY auth state change from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep("reset");
      }
    });

    // 2. Check url hash directly (sometimes onAuthStateChange event is skipped)
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const query = window.location.search;
      if (hash.includes("type=recovery") || query.includes("code=")) {
        setStep("reset");
      }
    }

    // 3. Fallback: Check if there is an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStep("reset");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent. Check your inbox.");
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        {step === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              id="password"
              type="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              helperText="Must be at least 8 characters"
            />
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="md" className="mb-6 justify-center" />
          <h1 className="text-2xl font-semibold text-foreground">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email to receive a reset link</p>
        </div>

        <Suspense fallback={<div className="rounded-lg border border-border bg-card p-6 text-center">Loading...</div>}>
          <ResetForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
