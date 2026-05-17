"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    period: "/month",
    features: ["5 documents/month", "Privacy Policy + ToS", "Basic compliance roadmap", "Email support"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "₹499",
    period: "/month",
    features: ["50 documents/month", "All document types", "Full compliance roadmap", "Regulatory alerts", "Priority support"],
  },
  {
    id: "PROFESSIONAL",
    name: "Pro",
    price: "₹1,499",
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

export default function BillingPage() {
  const supabase = createClient();
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
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
  };

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-600 mt-1">Manage your subscription and payment methods</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Current Plan</h2>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-blue-600">{currentPlan}</span>
          <span className="text-sm text-slate-500">
            {currentPlan === "FREE" ? "Free tier — upgrade for more features" : "Active subscription"}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-xl p-6 ${
                currentPlan === plan.id ? "border-blue-600 shadow-md" : "border-slate-200"
              }`}
            >
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-4">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.id
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {currentPlan === plan.id ? "Current Plan" : plan.id === "ENTERPRISE" ? "Contact Sales" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Payment Methods</h2>
        <p className="text-sm text-slate-600 mb-4">We accept UPI, Credit/Debit Cards, Net Banking, and Wallets via Cashfree.</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="px-3 py-1 bg-slate-100 rounded">UPI</span>
          <span className="px-3 py-1 bg-slate-100 rounded">Visa</span>
          <span className="px-3 py-1 bg-slate-100 rounded">Mastercard</span>
          <span className="px-3 py-1 bg-slate-100 rounded">Net Banking</span>
          <span className="px-3 py-1 bg-slate-100 rounded">Wallets</span>
        </div>
      </div>
    </div>
  );
}
