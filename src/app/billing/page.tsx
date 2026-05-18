"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "Rs. 0",
    period: "/month",
    features: ["5 documents/month", "Privacy Policy + ToS", "Basic compliance roadmap", "Email support"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "Rs. 499",
    period: "/month",
    features: ["50 documents/month", "All document types", "Full compliance roadmap", "Regulatory alerts", "Priority support"],
  },
  {
    id: "PROFESSIONAL",
    name: "Pro",
    price: "Rs. 1,499",
    period: "/month",
    features: ["200 documents/month", "All document types", "API access", "HTML embed snippets", "Team collaboration", "Dedicated support"],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited documents", "Custom integrations", "White-label options", "SLA guarantee", "Dedicated account manager"],
  },
];

const paymentMethods = ["UPI", "Visa", "Mastercard", "Net Banking", "Wallets"];

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
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment methods."
      />

      <Card className="border-border bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Current Plan</h2>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{currentPlan}</span>
                <Badge variant={currentPlan === "FREE" ? "default" : "success"}>
                  {currentPlan === "FREE" ? "Free Tier" : "Active"}
                </Badge>
              </div>
            </div>
            {currentPlan === "FREE" && (
              <p className="text-sm text-muted-foreground">Free tier - upgrade for more features</p>
            )}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isEnterprise = plan.id === "ENTERPRISE";
            return (
              <Card
                key={plan.id}
                className={`relative border-border ${isCurrent ? "border-primary ring-1 ring-primary" : ""}`}
              >
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading || isCurrent}
                    variant={isCurrent ? "outline" : isEnterprise ? "outline" : "default"}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : isEnterprise ? (
                      <>
                        Contact Sales
                        <ArrowUpRight className="w-4 h-4 ml-1.5" />
                      </>
                    ) : (
                      <>
                        Upgrade
                        <Sparkles className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Payment Methods</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            We accept UPI, Credit/Debit Cards, Net Banking, and Wallets via Cashfree.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {paymentMethods.map((method) => (
              <Badge key={method} variant="default">{method}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
