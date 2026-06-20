"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ComplianceCalendar } from "@/components/ComplianceCalendar";
import { Skeleton } from "@/components/Skeleton";
import { downloadComplianceReport, ComplianceReportData } from "@/lib/compliance-report";
import { ComplianceHelpTooltip } from "@/components/Tooltip";
import { ClipboardList, AlertTriangle, FileDown, ArrowRight, TrendingUp, CheckCircle, Clock, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

type ComplianceStatus = "COMPLIANT" | "NON_COMPLIANT" | "IN_PROGRESS" | "NOT_APPLICABLE";

interface ComplianceRequirement {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isMandatory: boolean;
  penaltyDescription: string | null;
}

interface ComplianceMapping {
  id: string;
  status: ComplianceStatus;
  lastReviewedAt: string | null;
  ComplianceRequirement?: ComplianceRequirement | null;
}

export default function CompliancePage() {
  const supabase = useMemo(() => createClient(), []);
  const [requirements, setRequirements] = useState<ComplianceMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [complianceScore, setComplianceScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "MANDATORY" | ComplianceStatus>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const loadComplianceData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

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
        const typedMappings = mappings as ComplianceMapping[];
        setRequirements(typedMappings);

        const total = typedMappings.length;
        const compliant = typedMappings.filter((m) => m.status === "COMPLIANT").length;
        const inProgress = typedMappings.filter((m) => m.status === "IN_PROGRESS").length;
        const score = total > 0 ? Math.round(((compliant + inProgress * 0.5) / total) * 100) : 0;
        setComplianceScore(score);
      }
    } catch {
      toast.error("Failed to load compliance data");
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadComplianceData();
  }, [loadComplianceData]);

  const updateStatus = async (mappingId: string, status: ComplianceStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in");
        return;
      }

      const { data: profile } = await supabase
        .from("BusinessProfile")
        .select("id")
        .eq("userId", user.id)
        .single();

      if (!profile) {
        toast.error("Business profile not found");
        return;
      }

      const { error } = await supabase
        .from("ComplianceMapping")
        .update({ status, lastReviewedAt: new Date().toISOString() })
        .eq("id", mappingId)
        .eq("businessProfileId", profile.id);

      if (error) {
        toast.error("Failed to update status");
        return;
      }

      toast.success("Status updated");
      void loadComplianceData();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, { total: number; compliant: number; inProgress: number }> = {};
    requirements.forEach((req) => {
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
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getProgressColor = (score: number): "success" | "warning" | "destructive" => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "destructive";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      PRIVACY: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30",
      CONSUMER: "bg-green-50 text-green-700 border-green-200/50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30",
      EMPLOYMENT: "bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30",
      TAX: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30",
      GST: "bg-orange-50 text-orange-700 border-orange-200/50 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30",
      CORPORATE: "bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30",
      LABOUR: "bg-pink-50 text-pink-700 border-pink-200/50 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30",
      SECTOR_SPECIFIC: "bg-teal-50 text-teal-700 border-teal-200/50 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/30",
      OTHER: "bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800/30",
    };
    return colors[category] || colors.OTHER;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3.5 h-3.5" />Compliant</Badge>;
      case "NON_COMPLIANT":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3.5 h-3.5" />Non-Compliant</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="warning" className="gap-1"><Clock className="w-3.5 h-3.5" />In Progress</Badge>;
      case "NOT_APPLICABLE":
        return <Badge variant="outline">Not Applicable</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleExportReport = () => {
    const reportData: ComplianceReportData = {
      companyName: "Business Profile",
      generatedAt: new Date().toISOString(),
      overallScore: complianceScore,
      totalRequirements: requirements.length,
      compliantCount: requirements.filter((r) => r.status === "COMPLIANT").length,
      nonCompliantCount: requirements.filter((r) => r.status === "NON_COMPLIANT").length,
      inProgressCount: requirements.filter((r) => r.status === "IN_PROGRESS").length,
      notApplicableCount: requirements.filter((r) => r.status === "NOT_APPLICABLE").length,
      categories: categoryBreakdown,
      requirements: requirements.map((r) => ({
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

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const cr = req.ComplianceRequirement;
      if (!cr) return false;

      const matchesSearch =
        cr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cr.description && cr.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filterCategory === "all" || cr.category === filterCategory;

      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "MANDATORY" && cr.isMandatory) ||
        req.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [requirements, searchQuery, filterStatus, filterCategory]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(requirements.map((r) => r.ComplianceRequirement?.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [requirements]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-12 w-24 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
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
            <div key={i} className="space-y-2 rounded-xl border border-border bg-card p-4">
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
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Compliance Roadmap"
          description="Track your business compliance against Indian regulatory frameworks."
        />
        <Card className="border-border/60 bg-card legal-card paper-texture overflow-hidden">
          <CardContent className="py-16 text-center max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">No Compliance Roadmap Yet</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Complete the onboarding process to identify your applicable regulatory obligations (DPDP Act, GST, Income Tax, etc.) and generate a personalized checklist.
            </p>
            <Link href="/onboarding">
              <Button className="font-semibold shadow-sm gap-2">
                Start Onboarding
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-body">
      <PageHeader
        title="Compliance Roadmap"
        description="Track your business compliance against Indian regulatory frameworks."
        actions={(
          <Button onClick={handleExportReport} className="font-semibold gap-2">
            <FileDown className="h-4 w-4" />
            Export Compliance Report
          </Button>
        )}
      />

      {/* Overview Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card gold-accent-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Compliance Rating</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your business satisfies <span className="font-bold text-foreground">{requirements.filter((r) => r.status === "COMPLIANT").length}</span> of <span className="font-bold text-foreground">{requirements.length}</span> mapped regulatory requirements.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{requirements.filter((r) => r.status === "COMPLIANT").length} Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{requirements.filter((r) => r.status === "IN_PROGRESS").length} In Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>{requirements.filter((r) => r.status === "NON_COMPLIANT").length} Pending</span>
                  </div>
                </div>
              </div>

              {/* Animated Progress Gauge */}
              <div className="relative flex items-center justify-center w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    className="stroke-muted fill-transparent"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="36"
                    className="stroke-emerald-500 fill-transparent"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 226, strokeDashoffset: 226 }}
                    animate={{ strokeDashoffset: 226 - (complianceScore / 100) * 226 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-heading text-foreground">{complianceScore}%</span>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Score</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="border-border/50 bg-card legal-card overflow-hidden">
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-bold text-foreground mb-4">Breakdown by Segment</h2>
            <div className="space-y-4 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold tracking-wide uppercase ${getCategoryColor(cat.name)}`}>
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2 font-medium">
                      <span className={getScoreColor(cat.score)}>{cat.score}%</span>
                      <span className="text-muted-foreground text-[10px]">({cat.compliant}/{cat.total})</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          getProgressColor(cat.score) === "success"
                            ? "hsl(var(--success))"
                            : getProgressColor(cat.score) === "warning"
                            ? "hsl(var(--warning))"
                            : "hsl(var(--destructive))",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filing calendar */}
      <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
        <CardHeader className="border-b border-border/20 bg-muted/10">
          <CardTitle className="font-heading text-lg font-bold text-foreground">Filing & Compliance Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ComplianceCalendar />
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Detailed Checklist</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Select */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.filter(c => c !== "all").map((cat) => (
                  <SelectItem key={cat} value={cat || "OTHER"}>
                    <span className="capitalize">{cat?.toLowerCase().replace(/_/g, " ")}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="MANDATORY">Mandatory Requirements</SelectItem>
                <SelectItem value="COMPLIANT">Compliant</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                <SelectItem value="NOT_APPLICABLE">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search regulations, penal provisions, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-card border-border/50 text-sm focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Requirements List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRequirements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-12 text-center rounded-xl border border-dashed border-border/60 bg-card"
              >
                <AlertTriangle className="w-8 h-8 text-muted-foreground/45 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No matching compliance requirements found.</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search keywords.</p>
              </motion.div>
            ) : (
              filteredRequirements.map((req, index) => {
                const cr = req.ComplianceRequirement;
                const category = cr?.category || "OTHER";
                return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                    className="group rounded-xl border border-border/50 bg-card p-5 legal-card hover-lift transition-all duration-300"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {cr?.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider ${getCategoryColor(category)}`}>
                            {category}
                          </span>
                          <ComplianceHelpTooltip category={category} />
                          {cr?.isMandatory && (
                            <Badge variant="destructive" className="text-[10px] px-2 py-0 rounded-full font-bold uppercase tracking-wider bg-rose-500">
                              Mandatory
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground/90 font-medium">
                          {cr?.description}
                        </p>

                        {cr?.penaltyDescription && (
                          <div className="flex items-start gap-2 rounded-lg bg-rose-500/5 border border-rose-500/10 p-3 max-w-xl">
                            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-rose-700 dark:text-rose-400 leading-normal">
                              <span className="font-bold">Penal Consequence:</span> {cr.penaltyDescription}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Selector */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:flex-col md:items-end flex-shrink-0">
                        <div className="text-xs font-semibold text-muted-foreground mb-1 md:mb-0">
                          Current Status:
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(req.status)}
                          <Select
                            value={req.status}
                            onValueChange={(value) => updateStatus(req.id, value as ComplianceStatus)}
                          >
                            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                              <SelectValue placeholder="Update Status" />
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
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
