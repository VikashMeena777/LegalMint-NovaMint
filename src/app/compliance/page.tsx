"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ComplianceCalendar } from "@/components/ComplianceCalendar";

export default function CompliancePage() {
  const supabase = createClient();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("BusinessProfile")
        .select("id, onboardingCompleted")
        .eq("userId", user.id)
        .single();

      if (!profile?.onboardingCompleted) {
        setLoading(false);
        return;
      }

      const { data: mappings } = await supabase
        .from("ComplianceMapping")
        .select(`
          *,
          ComplianceRequirement!ComplianceMapping_complianceRequirementId_fkey (
            id,
            name,
            category,
            description,
            isMandatory,
            penaltyDescription
          )
        `)
        .eq("businessProfileId", profile.id);

      if (mappings) {
        setRequirements(mappings);

        const total = mappings.length;
        const compliant = mappings.filter((m: any) => m.status === "COMPLIANT").length;
        const inProgress = mappings.filter((m: any) => m.status === "IN_PROGRESS").length;
        const score = total > 0 ? Math.round(((compliant + inProgress * 0.5) / total) * 100) : 0;
        setComplianceScore(score);
      }
    } catch {
      toast.error("Failed to load compliance data");
    }
    setLoading(false);
  };

  const updateStatus = async (mappingId: string, status: "COMPLIANT" | "NON_COMPLIANT" | "IN_PROGRESS" | "NOT_APPLICABLE") => {
    try {
      const { error } = await supabase
        .from("ComplianceMapping")
        .update({ status, lastReviewedAt: new Date().toISOString() })
        .eq("id", mappingId);

      if (error) {
        toast.error("Failed to update status");
        return;
      }

      toast.success("Status updated");
      loadComplianceData();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      PRIVACY: "bg-blue-100 text-blue-700",
      CONSUMER: "bg-green-100 text-green-700",
      EMPLOYMENT: "bg-purple-100 text-purple-700",
      TAX: "bg-amber-100 text-amber-700",
      GST: "bg-orange-100 text-orange-700",
      CORPORATE: "bg-indigo-100 text-indigo-700",
      LABOUR: "bg-pink-100 text-pink-700",
      SECTOR_SPECIFIC: "bg-teal-100 text-teal-700",
      OTHER: "bg-slate-100 text-slate-700",
    };
    return colors[category] || colors.OTHER;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLIANT: "bg-green-100 text-green-700",
      NON_COMPLIANT: "bg-red-100 text-red-700",
      IN_PROGRESS: "bg-amber-100 text-amber-700",
      NOT_APPLICABLE: "bg-slate-100 text-slate-600",
    };
    return colors[status] || colors.NOT_APPLICABLE;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance</h1>
          <p className="text-slate-600 mt-1">Track your compliance with Indian regulations</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No compliance data yet</h3>
          <p className="text-slate-600 mb-4">Complete the onboarding process to generate your personalized compliance roadmap.</p>
          <a href="/onboarding" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance</h1>
        <p className="text-slate-600 mt-1">Track your compliance with Indian regulations</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Compliance Score</h2>
            <p className="text-sm text-slate-500 mt-1">
              {requirements.filter((r: any) => r.status === "COMPLIANT").length} of {requirements.length} requirements met
            </p>
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(complianceScore)}`}>
            {complianceScore}%
          </div>
        </div>
        <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              complianceScore >= 80 ? "bg-green-500" :
              complianceScore >= 50 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${complianceScore}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filing Calendar</h2>
        <ComplianceCalendar />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
        {requirements.map((req: any) => {
          const cr = req.ComplianceRequirement;
          return (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-slate-900">{cr?.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(cr?.category)}`}>
                      {cr?.category}
                    </span>
                    {cr?.isMandatory && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{cr?.description}</p>
                  {cr?.penaltyDescription && (
                    <p className="text-xs text-red-600 mt-2">
                      ⚠️ Penalty: {cr.penaltyDescription}
                    </p>
                  )}
                </div>
                <select
                  value={req.status}
                  onChange={(e) => updateStatus(req.id, e.target.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ${getStatusColor(req.status)} cursor-pointer`}
                >
                  <option value="COMPLIANT">Compliant</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="NOT_APPLICABLE">Not Applicable</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
