import { createClient } from "@/lib/supabase/client";

export async function exportUserData(userId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("BusinessProfile")
    .select("*")
    .eq("userId", userId)
    .single();

  const { data: documents } = await supabase
    .from("Document")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("Subscription")
    .select("*")
    .eq("userId", userId);

  const { data: auditLogs } = await supabase
    .from("AuditLog")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(100);

  const { data: alerts } = await supabase
    .from("ComplianceAlert")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  const { data: complianceMappings } = await supabase
    .from("ComplianceMapping")
    .select("*")
    .eq("businessProfileId", profile?.id || "");

  const exportData = {
    exportDate: new Date().toISOString(),
    dataSubject: { userId },
    profile: profile || null,
    documents: documents || [],
    subscriptions: subscriptions || [],
    auditLogs: auditLogs || [],
    alerts: alerts || [],
    complianceMappings: complianceMappings || [],
  };

  return exportData;
}

export function downloadUserData(exportData: any) {
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `legalease-data-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
