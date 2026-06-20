export type BillingPlanId = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  price: string;
  period: string;
  amount: number | null;
  features: string[];
  billable: boolean;
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "Rs. 0",
    period: "/month",
    amount: 0,
    billable: false,
    features: ["5 documents/month", "Privacy Policy + ToS", "Basic compliance roadmap", "Email support"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "Rs. 499",
    period: "/month",
    amount: 499,
    billable: true,
    features: ["50 documents/month", "All document types", "Full compliance roadmap", "Regulatory alerts", "Priority support"],
  },
  {
    id: "PROFESSIONAL",
    name: "Pro",
    price: "Rs. 1,499",
    period: "/month",
    amount: 1499,
    billable: true,
    features: ["200 documents/month", "All document types", "API access", "HTML embed snippets", "Team collaboration", "Dedicated support"],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    amount: null,
    billable: false,
    features: ["Unlimited documents", "Custom integrations", "White-label options", "SLA guarantee", "Dedicated account manager"],
  },
];

export function getBillingPlan(planId: string) {
  return BILLING_PLANS.find((plan) => plan.id === planId);
}

export function getBillablePlan(planId: string) {
  const plan = getBillingPlan(planId);
  if (!plan || !plan.billable || plan.amount === null) return null;
  return plan;
}

export function resolvePlanAmount(planId: string, env: Record<string, string | undefined> = process.env) {
  const plan = getBillablePlan(planId);
  if (!plan) return null;

  const overrideKey = `CASHFREE_PRICE_${plan.id}`;
  const override = env[overrideKey];
  if (!override) return plan.amount;

  const amount = Number.parseFloat(override);
  return Number.isFinite(amount) && amount > 0 ? amount : plan.amount;
}

