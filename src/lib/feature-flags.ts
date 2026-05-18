export type FeatureFlag =
  | "ai_document_generation"
  | "compliance_calendar"
  | "bulk_document_actions"
  | "team_collaboration"
  | "api_access"
  | "multi_language"
  | "export_compliance_report"
  | "command_palette"
  | "dark_mode"
  | "feedback_widget";

const FLAGS: Record<FeatureFlag, boolean> = {
  ai_document_generation: true,
  compliance_calendar: true,
  bulk_document_actions: true,
  team_collaboration: false,
  api_access: false,
  multi_language: false,
  export_compliance_report: true,
  command_palette: true,
  dark_mode: true,
  feedback_widget: true,
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envFlag = process.env[`NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`];
  if (envFlag !== undefined) {
    return envFlag === "true";
  }
  return FLAGS[flag] ?? false;
}

export function getAllFlags(): Record<FeatureFlag, boolean> {
  return FLAGS;
}
