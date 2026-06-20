"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Sparkles, ArrowUpRight, Loader2, Award, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { BILLING_PLANS } from "@/lib/billing";
import { motion } from "framer-motion";

const paymentMethods = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Wallets"];

export default function BillingPage() {
  const supabase = useMemo(() => createClient(), []);
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [loading, setLoading] = useState(false);

  const loadSubscription = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("Subscription")
      .select("plan")
      .eq("userId", user.id)
      .single();

    if (data) {
      setCurrentPlan(data.plan);
    }
  }, [supabase]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const handleUpgrade = async (planId: string) => {
    if (planId === "FREE") {
      toast.info("You're already on the Free plan");
      return;
    }

    if (planId === "ENTERPRISE") {
      window.location.href = "mailto:sales@legalmint.ai?subject=LegalMint%20AI%20Enterprise%20Plan";
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/billing/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          customerEmail: user.email,
          customerName: user.user_metadata?.name,
          customerPhone: user.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create payment link");
        setLoading(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      toast.error("Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-body">
      <PageHeader
        title="Subscription & Billing"
        description="Manage your platform subscription plan and payment methods."
      />

      {/* Current plan card */}
      <Card className="border-border/50 bg-card gold-accent-card overflow-hidden paper-texture">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Active Subscription</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold font-heading text-primary flex items-center gap-2">
                  {currentPlan}
                  {currentPlan !== "FREE" ? <Award className="w-6 h-6 text-secondary" /> : <Zap className="w-6 h-6 text-muted-foreground" />}
                </span>
                <Badge variant={currentPlan === "FREE" ? "secondary" : "success"} className="font-semibold">
                  {currentPlan === "FREE" ? "Standard Free Tier" : "Premium Active"}
                </Badge>
              </div>
            </div>
            {currentPlan === "FREE" ? (
              <div className="text-sm text-muted-foreground max-w-sm sm:text-right">
                You are currently utilizing the standard Free tier. Upgrade to a paid plan below to unlock automated regulatory monitoring and priority compliance support.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground max-w-sm sm:text-right">
                Your premium subscription is active. Thank you for partnering with LegalMint AI for your business compliance requirements.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available plans */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Available Tiers</h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BILLING_PLANS.map((plan, index) => {
            const isCurrent = currentPlan === plan.id;
            const isEnterprise = plan.id === "ENTERPRISE";
            const isPro = plan.id === "PROFESSIONAL";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className={`flex flex-col justify-between rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 ${
                  isCurrent 
                    ? "ring-1 ring-primary border-primary shadow-md"
                    : "hover-lift hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-heading text-xl font-bold text-foreground">{plan.name}</h3>
                    {isPro && (
                      <span className="bg-secondary/15 text-secondary-text border border-secondary/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-1 mb-5">
                    <span className="text-3xl font-bold font-heading text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
                  </div>
                  
                  <ul className="space-y-3 mb-8 border-t border-border/20 pt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-normal">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading || isCurrent}
                  variant={isCurrent ? "outline" : isEnterprise || isCurrent ? "outline" : "default"}
                  className={`w-full font-semibold ${isPro && !isCurrent ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 border-transparent shadow-sm" : ""}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    "Current Active Plan"
                  ) : isEnterprise ? (
                    <>
                      Contact Sales
                      <ArrowUpRight className="w-4 h-4 ml-1.5" />
                    </>
                  ) : (
                    <>
                      Upgrade Plan
                      <Sparkles className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Payment methods */}
      <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground">Supported Payment Gateways</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                We support instant online settlement via Cashfree payments. Securely pay with major Indian cards, popular mobile UPI apps, digital wallets, or direct Net Banking.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap pt-2 sm:pt-0">
              {paymentMethods.map((method) => (
                <Badge key={method} variant="secondary" className="font-semibold text-xs py-1 px-3">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
