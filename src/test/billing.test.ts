import { describe, expect, it } from "vitest";
import { getBillablePlan, resolvePlanAmount } from "@/lib/billing";

describe("billing", () => {
  it("marks only self-serve paid plans as billable", () => {
    expect(getBillablePlan("STARTER")?.amount).toBe(499);
    expect(getBillablePlan("PROFESSIONAL")?.amount).toBe(1499);
    expect(getBillablePlan("FREE")).toBeNull();
    expect(getBillablePlan("ENTERPRISE")).toBeNull();
  });

  it("uses Cashfree amount overrides when they are valid", () => {
    expect(resolvePlanAmount("STARTER", { CASHFREE_PRICE_STARTER: "599" })).toBe(599);
    expect(resolvePlanAmount("PROFESSIONAL", { CASHFREE_PRICE_PROFESSIONAL: "1999.5" })).toBe(1999.5);
  });

  it("falls back to default amounts for invalid overrides", () => {
    expect(resolvePlanAmount("STARTER", { CASHFREE_PRICE_STARTER: "price_123" })).toBe(499);
    expect(resolvePlanAmount("PROFESSIONAL", { CASHFREE_PRICE_PROFESSIONAL: "-1" })).toBe(1499);
  });
});

