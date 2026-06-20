type JsonishArray = string[] | string | null | undefined;

export type BusinessProfileForCompliance = {
  id?: string;
  businessType?: string | null;
  businessEntity?: string | null;
  targetAudience?: string | null;
  collectsPersonalData?: boolean | null;
  usesThirdPartyServices?: boolean | null;
  hasPaymentProcessing?: boolean | null;
  usesCookies?: boolean | null;
  hasUserAccounts?: boolean | null;
  usesAnalytics?: boolean | null;
  employeeCount?: number | null;
  annualRevenue?: number | null;
};

export type ComplianceRequirementForMapping = {
  id: string;
  category?: string | null;
  isMandatory?: boolean | null;
  applicableToBusinessTypes?: JsonishArray;
  applicableToEntityTypes?: JsonishArray;
};

export type ComplianceMappingRow = {
  businessProfileId: string;
  complianceRequirementId: string;
  status: "NON_COMPLIANT";
  updatedAt: string;
};

function normalizeArray(value: JsonishArray) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function matchesFilter(value: string | null | undefined, filters: string[]) {
  return filters.length === 0 || (!!value && filters.includes(value));
}

function isCategoryTriggered(profile: BusinessProfileForCompliance, category?: string | null) {
  switch (category) {
    case "PRIVACY":
      return !!(
        profile.collectsPersonalData ||
        profile.hasUserAccounts ||
        profile.usesAnalytics ||
        profile.usesThirdPartyServices
      );
    case "CONSUMER":
      return !!(
        profile.targetAudience === "B2C" ||
        profile.targetAudience === "BOTH" ||
        profile.hasPaymentProcessing ||
        ["ECOMMERCE", "MARKETPLACE", "RETAIL"].includes(profile.businessType ?? "")
      );
    case "EMPLOYMENT":
      return (profile.employeeCount ?? 0) > 0;
    case "LABOUR":
      return (profile.employeeCount ?? 0) >= 10;
    case "GST":
    case "TAX":
      return !!(profile.hasPaymentProcessing || (profile.annualRevenue ?? 0) >= 2000000);
    case "CORPORATE":
      return ["LLP", "PRIVATE_LIMITED", "PUBLIC_LIMITED", "OPC", "SECTION_8"].includes(
        profile.businessEntity ?? ""
      );
    case "SECTOR_SPECIFIC":
      return ["FINTECH", "HEALTHCARE", "EDTECH"].includes(profile.businessType ?? "");
    default:
      return true;
  }
}

export function getApplicableComplianceRequirements(
  profile: BusinessProfileForCompliance,
  requirements: ComplianceRequirementForMapping[]
) {
  const applicable = requirements.filter((requirement) => {
    const businessTypes = normalizeArray(requirement.applicableToBusinessTypes);
    const entityTypes = normalizeArray(requirement.applicableToEntityTypes);

    if (!matchesFilter(profile.businessType, businessTypes)) return false;
    if (!matchesFilter(profile.businessEntity, entityTypes)) return false;

    return requirement.isMandatory || isCategoryTriggered(profile, requirement.category);
  });

  return applicable.filter(
    (requirement, index, all) => all.findIndex((item) => item.id === requirement.id) === index
  );
}

export function buildComplianceMappingRows(
  businessProfileId: string,
  requirements: ComplianceRequirementForMapping[],
  now = new Date()
): ComplianceMappingRow[] {
  const updatedAt = now.toISOString();

  return requirements.map((requirement) => ({
    businessProfileId,
    complianceRequirementId: requirement.id,
    status: "NON_COMPLIANT",
    updatedAt,
  }));
}

