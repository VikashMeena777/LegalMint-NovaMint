"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given/declined
    const consent = getCookie("cookie_consent");
    if (!consent) {
      // Show banner with a small delay for better visual flow
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === "undefined") return;
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
  };

  const handleAccept = () => {
    setCookie("cookie_consent", "accepted", 365);
    setShowBanner(false);
    // Proactively initialize any consent-required scripts here if needed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    }
  };

  const handleDecline = () => {
    setCookie("cookie_consent", "declined", 365);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-slide-up font-body">
      <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl p-5 relative">
        <button
          onClick={handleDecline}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              DPDP Cookie Compliance
            </h4>
            <p className="mt-1 text-xs text-muted-foreground leading-normal">
              We use cookies to secure session profiles and analyze portal compliance mapping. No tracking is run without consent.
              Read our{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4"
                onClick={handleAccept}
              >
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold px-4 border-border/60"
                onClick={handleDecline}
              >
                Essential Only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
