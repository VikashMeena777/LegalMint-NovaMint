import { describe, expect, it } from "vitest";
import {
  buildComplianceMappingRows,
  getApplicableComplianceRequirements,
} from "@/lib/compliance-mapping";

const baseProfile = {
  businessType: "SAAS",
  businessEntity: "PRIVATE_LIMITED",
  targetAudience: "B2B",
  collectsPersonalData: true,
  hasPaymentProcessing: false,
  employeeCount: 8,
  annualRevenue: 1000000,
};

describe("getApplicableComplianceRequirements", () => {
  it("matches requirements by business type, entity type, and category triggers", () => {
    const requirements = [
      {
        id: "dpdp",
        category: "PRIVACY",
        isMandatory: false,
        applicableToBusinessTypes: ["SAAS"],
        applicableToEntityTypes: ["PRIVATE_LIMITED"],
      },
      {
        id: "gst",
        category: "GST",
        isMandatory: false,
      },
      {
        id: "company-law",
        category: "CORPORATE",
        isMandatory: false,
      },
      {
        id: "retail-only",
        category: "CONSUMER",
        isMandatory: true,
        applicableToBusinessTypes: ["RETAIL"],
      },
    ];

    const applicable = getApplicableComplianceRequirements(baseProfile, requirements);

    expect(applicable.map((requirement) => requirement.id)).toEqual(["dpdp", "company-law"]);
  });

  it("supports JSON string applicability filters from Supabase", () => {
    const applicable = getApplicableComplianceRequirements(baseProfile, [
      {
        id: "json-filter",
        category: "PRIVACY",
        isMandatory: true,
        applicableToBusinessTypes: "[\"SAAS\", \"ECOMMERCE\"]",
        applicableToEntityTypes: "[\"PRIVATE_LIMITED\"]",
      },
    ]);

    expect(applicable).toHaveLength(1);
  });
});

describe("buildComplianceMappingRows", () => {
  it("creates non-compliant mapping rows with a stable timestamp", () => {
    const rows = buildComplianceMappingRows(
      "profile-1",
      [{ id: "req-1" }, { id: "req-2" }],
      new Date("2026-05-26T00:00:00.000Z")
    );

    expect(rows).toEqual([
      {
        businessProfileId: "profile-1",
        complianceRequirementId: "req-1",
        status: "NON_COMPLIANT",
        updatedAt: "2026-05-26T00:00:00.000Z",
      },
      {
        businessProfileId: "profile-1",
        complianceRequirementId: "req-2",
        status: "NON_COMPLIANT",
        updatedAt: "2026-05-26T00:00:00.000Z",
      },
    ]);
  });
});

