"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Shield, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    } catch {
      // Welcome email failure shouldn't block user signup flow
    }

    toast.success("Account created! Check your email to verify your subscription.");
    setLoading(false);
    window.location.href = "/login";
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen font-body bg-background">
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        {/* Left panel - Branding and info (Hidden on mobile) */}
        <div className="relative hidden flex-col justify-between brand-panel p-12 lg:flex overflow-hidden">
          {/* Subtle gold/amber glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(40_50%_50%),transparent_60%)] opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(40_55%_93%_/_0.05)] rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <Logo variant="wordmark-dark" size="lg" />
          </div>

          <div className="relative z-10 space-y-8 my-auto max-w-lg">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              India&apos;s AI-Powered{" "}
              <span className="italic font-semibold text-[hsl(40,55%,60%)]">Legal Tech</span>{" "}
              Platform
            </h2>
            <p className="text-sm text-white/75 leading-relaxed">
              Generate DPDP-compliant policies, draft robust contracts, and map your regulatory roadmap dynamically.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[hsl(40,55%,60%)]">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-medium text-white/90">DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[hsl(40,55%,60%)]">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-medium text-white/90"> Vetted Legal Templates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[hsl(40,55%,60%)]">
                  <CheckCircle className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-medium text-white/90">Automated Active Notifications</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/40 border-t border-white/5 pt-6 flex justify-between">
            <span>&copy; 2026 LegalMint AI</span>
            <span>Made for Indian Businesses</span>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Logo shown on mobile only */}
            <div className="lg:hidden mb-8 text-center">
              <Logo size="md" className="justify-center" />
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Start your free compliance journey today
              </p>
            </div>

            <Card className="border-border/50 bg-card legal-card p-6">
              <CardContent className="p-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <Input
                    id="name"
                    type="text"
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Sharma"
                    required
                  />
                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    helperText="Password must be at least 8 characters"
                  />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 font-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-semibold">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full py-5 border-border/50 font-medium flex items-center justify-center gap-2"
                  onClick={handleGoogleSignup}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </CardContent>
            </Card>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                Sign in
              </Link>
            </p>

            <div className="mt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to landing page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
