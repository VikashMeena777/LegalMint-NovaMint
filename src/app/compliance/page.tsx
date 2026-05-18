"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ComplianceCalendar } from "@/components/ComplianceCalendar";
import { Skeleton } from "@/components/Skeleton";
import { downloadComplianceReport, ComplianceReportData } from "@/lib/compliance-report";
import { ComplianceHelpTooltip } from "@/components/Tooltip";
import { ClipboardList, AlertTriangle, FileDown, ArrowRight, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, { total: number; compliant: number; inProgress: number }> = {};
    requirements.forEach((req: any) => {
      const cat = req.ComplianceRequirement?.category || "OTHER";
      if (!categories[cat]) categories[cat] = { total: 0, compliant: 0, inProgress: 0 };
      categories[cat].total++;
      if (req.status === "COMPLIANT") categories[cat].compliant++;
      if (req.status === "IN_PROGRESS") categories[cat].inProgress++;
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      ...data,
      score: data.total > 0 ? Math.round(((data.compliant + data.inProgress * 0.5) / data.total) * 100) : 0,
    }));
  }, [requirements]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number): "success" | "warning" | "destructive" => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "destructive";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      PRIVACY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      CONSUMER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      EMPLOYMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      TAX: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      GST: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      CORPORATE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
      LABOUR: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      SECTOR_SPECIFIC: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
      OTHER: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
    };
    return colors[category] || colors.OTHER;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT": return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Compliant</Badge>;
      case "NON_COMPLIANT": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Non-Compliant</Badge>;
      case "IN_PROGRESS": return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "NOT_APPLICABLE": return <Badge variant="default">Not Applicable</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleExportReport = () => {
    const reportData: ComplianceReportData = {
      companyName: "Business Profile",
      generatedAt: new Date().toISOString(),
      overallScore: complianceScore,
      totalRequirements: requirements.length,
      compliantCount: requirements.filter((r: any) => r.status === "COMPLIANT").length,
      nonCompliantCount: requirements.filter((r: any) => r.status === "NON_COMPLIANT").length,
      inProgressCount: requirements.filter((r: any) => r.status === "IN_PROGRESS").length,
      notApplicableCount: requirements.filter((r: any) => r.status === "NOT_APPLICABLE").length,
      categories: categoryBreakdown,
      requirements: requirements.map((r: any) => ({
        name: r.ComplianceRequirement?.name || "Unknown",
        category: r.ComplianceRequirement?.category || "OTHER",
        status: r.status,
        isMandatory: r.ComplianceRequirement?.isMandatory || false,
        description: r.ComplianceRequirement?.description || "",
        lastReviewed: r.lastReviewedAt,
      })),
    };
    downloadComplianceReport(reportData);
    toast.success("Compliance report downloaded");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border bg-card border-border">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-12 w-24 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="p-6 rounded-xl border bg-card border-border">
            <Skeleton className="h-6 w-32 mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1 mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card border-border space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
          <p className="text-muted-foreground mt-1">Track your compliance with Indian regulations</p>
        </div>
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No compliance data yet</h3>
            <p className="text-muted-foreground mb-6">Complete the onboarding process to generate your personalized compliance roadmap.</p>
            <a href="/onboarding">
              <Button>
                Start Onboarding
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
          <p className="text-muted-foreground mt-1">Track your compliance with Indian regulations</p>
        </div>
        <Button onClick={handleExportReport}>
          <FileDown className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Compliance Score</h2>
                  <p className="text-sm text-muted-foreground">
                    {requirements.filter((r: any) => r.status === "COMPLIANT").length} of {requirements.length} requirements met
                  </p>
                </div>
              </div>
              <div className={`text-5xl font-bold ${getScoreColor(complianceScore)}`}>
                {complianceScore}%
              </div>
            </div>
            <Progress value={complianceScore} color={getProgressColor(complianceScore)} size="lg" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">By Category</h2>
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(cat.name)}`}>
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{cat.score}%</span>
                      <span className="text-xs text-muted-foreground">({cat.compliant}/{cat.total})</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(cat.score) === "success" ? "bg-emerald-500" : getProgressColor(cat.score) === "warning" ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Filing Calendar</h2>
          <ComplianceCalendar />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
        {requirements.map((req: any) => {
          const cr = req.ComplianceRequirement;
          return (
            <Card key={req.id} className="border-border/50">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-medium text-foreground">{cr?.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(cr?.category)}`}>
                        {cr?.category}
                      </span>
                      <ComplianceHelpTooltip category={cr?.category} />
                      {cr?.isMandatory && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Mandatory</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cr?.description}</p>
                    {cr?.penaltyDescription && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        Penalty: {cr.penaltyDescription}
                      </p>
                    )}
                  </div>
                  <Select
                    value={req.status}
                    onValueChange={(value) => updateStatus(req.id, value as any)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPLIANT">Compliant</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                      <SelectItem value="NOT_APPLICABLE">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
