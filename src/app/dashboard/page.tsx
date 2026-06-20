import type { ReactNode } from "react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle, CreditCard, File, FileText, TrendingUp, ChevronRight, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";

export const revalidate = 0; // Disable caching to fetch fresh dashboard data on every load

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    "document.generate": "Generated legal document",
    "document.delete": "Deleted document draft",
    "document.publish": "Published document",
    "auth.signup": "Created account",
    "auth.login": "Signed in",
    "billing.checkout": "Initiated billing checkout",
    "billing.success": "Upgraded subscription plan",
    "compliance.update": "Updated requirement status",
    "feedback.submit": "Submitted feedback form",
  };
  return labels[action] || action.replace(/\./g, " ");
}

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch business profiles, documents, alerts, and audit logs in parallel
  const [businessesResult, documentsResult, alertsResult, logsResult] = await Promise.all([
    supabase
      .from("BusinessProfile")
      .select("*")
      .eq("userId", user.id)
      .order("companyName"),
    supabase
      .from("Document")
      .select("*, DocumentTemplate(name, category)")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false }),
    supabase
      .from("ComplianceAlert")
      .select("*")
      .eq("userId", user.id)
      .eq("isRead", false)
      .order("createdAt", { ascending: false })
      .limit(5),
    supabase
      .from("AuditLog")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(5),
  ]);

  const businesses = businessesResult.data || [];
  const documents = documentsResult.data || [];
  const alerts = alertsResult.data || [];
  const logs = logsResult.data || [];

  const activeBusiness = businesses[0];
  let complianceScore = null;

  if (activeBusiness?.id) {
    const { data: mappings } = await supabase
      .from("ComplianceMapping")
      .select("status, ComplianceRequirement(isMandatory)")
      .eq("businessProfileId", activeBusiness.id);

    if (mappings && mappings.length > 0) {
      const total = mappings.length;
      const compliant = mappings.filter((m) => m.status === "COMPLIANT").length;
      const nonCompliant = mappings.filter((m) => m.status === "NON_COMPLIANT").length;
      const inProgress = mappings.filter((m) => m.status === "IN_PROGRESS").length;
      const notApplicable = mappings.filter((m) => m.status === "NOT_APPLICABLE").length;

      const score = Math.round((compliant / (total - notApplicable || 1)) * 100);

      complianceScore = {
        score,
        total,
        compliant,
        nonCompliant,
        inProgress,
        notApplicable,
      };
    }
  }

  const userName = user.user_metadata?.name as string | undefined;
  const scoreValue = complianceScore?.score ?? 0;
  const scoreColor = scoreValue >= 80 ? "text-emerald-600 dark:text-emerald-400" : scoreValue >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  const scoreBadgeColor = scoreValue >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : scoreValue >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreValue / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in font-body">
      <PageHeader
        title={`Welcome back${userName ? `, ${userName}` : ""}`}
        description="Here is your active compliance standing and recent system logs."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Compliance Score"
          value={complianceScore ? `${complianceScore.score}%` : "--"}
          helper={
            complianceScore
              ? `${complianceScore.compliant}/${complianceScore.total - complianceScore.notApplicable} compliant`
              : "Complete onboarding"
          }
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          valueClassName={scoreColor}
        />
        <MetricCard
          label="Documents"
          value={String(documents.length)}
          helper={
            documents.length
              ? `${documents.filter((d) => d.status === "PUBLISHED").length} published`
              : "No documents yet"
          }
          icon={<FileText className="h-5 w-5 text-emerald-600" />}
        />
        <MetricCard
          label="Active Alerts"
          value={String(alerts.length)}
          helper={alerts.length ? "Needs attention" : "All clear"}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
        />
        <MetricCard
          label="Plan"
          value="Free"
          helper={
            <Link href="/billing" className="text-primary hover:underline font-semibold flex items-center gap-0.5">
              Upgrade for more <ChevronRight className="w-3 h-3" />
            </Link>
          }
          icon={<CreditCard className="h-5 w-5 text-indigo-600" />}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Start Onboarding"
            description="Tell us about your business to generate a personalized compliance roadmap."
            href="/onboarding"
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <QuickActionCard
            title="Generate Document"
            description="Create a Privacy Policy, Terms of Service, or other legal document."
            href="/documents"
            icon={<File className="h-6 w-6 text-emerald-600" />}
          />
          <QuickActionCard
            title="View Compliance"
            description="Check your compliance status across Indian regulations."
            href="/compliance"
            icon={<CheckCircle className="h-6 w-6 text-amber-500" />}
          />
        </div>
      </section>

      {/* Main split grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Compliance Standing & Alerts */}
        <div className="space-y-6">
          {activeBusiness && complianceScore && (
            <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
              <CardHeader className="border-b border-border/10 pb-4">
                <CardTitle className="font-heading text-lg font-bold text-foreground">Compliance Standings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${scoreBadgeColor}`}>
                        {scoreValue >= 80 ? "Strong" : scoreValue >= 50 ? "Needs Review" : "Critical"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your business satisfies <span className="font-semibold text-foreground">{complianceScore.compliant}</span> of <span className="font-semibold text-foreground">{complianceScore.total - complianceScore.notApplicable}</span> requirements. Complete pending items to raise your overall score.
                    </p>
                    <Link href="/compliance" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1">
                      Check roadmap requirements <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* SVG Compliance Gauge */}
                  <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="stroke-muted fill-transparent"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          stroke: scoreValue >= 80 ? "hsl(var(--success))" : scoreValue >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                          transition: "stroke-dashoffset 1s ease-in-out",
                        }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-bold font-heading text-foreground">{scoreValue}%</span>
                      <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">Score</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Alerts */}
          <Card className="border-border/50 bg-card legal-card">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="font-heading text-lg font-bold text-foreground">Pending Compliance Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-amber-500" />
                        <div>
                          <p className="font-semibold text-foreground text-xs">{alert.title}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-normal">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  All clear! No active compliance alerts at this time.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Recent Activity Feed */}
        <Card className="border-border/50 bg-card legal-card paper-texture">
          <CardHeader className="border-b border-border/10 pb-4 flex flex-row items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading text-lg font-bold text-foreground">Recent Activity Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {logs && logs.length > 0 ? (
              <div className="relative border-l border-border/70 pl-4.5 ml-1.5 space-y-6 text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Circle marker on timeline */}
                    <span className="absolute -left-[24.5px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border/80 text-[8px]">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {log.metadata && typeof log.metadata === "object" && (log.metadata as Record<string, any>).title && (
                        <p className="text-muted-foreground">
                          Document: <span className="font-medium text-foreground">{(log.metadata as Record<string, any>).title}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                No activity logs recorded yet. Begin onboarding to start tracking audits.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!activeBusiness && (
        <Card className="border-secondary/20 bg-secondary/5 paper-texture">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-primary">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <GettingStartedStep number={1}>
                Complete the{" "}
                <Link href="/onboarding" className="font-semibold text-primary underline hover:text-primary/80">
                  business onboarding
                </Link>{" "}
                to identify your compliance requirements.
              </GettingStartedStep>
              <GettingStartedStep number={2}>
                Review your personalized{" "}
                <Link href="/compliance" className="font-semibold text-primary underline hover:text-primary/80">
                  compliance roadmap
                </Link>{" "}
                with prioritized action items.
              </GettingStartedStep>
              <GettingStartedStep number={3}>
                Generate your first legal document:{" "}
                <Link href="/documents" className="font-semibold text-primary underline hover:text-primary/80">
                  Privacy Policy
                </Link>{" "}
                or{" "}
                <Link href="/documents" className="font-semibold text-primary underline hover:text-primary/80">
                  Terms of Service
                </Link>
                .
              </GettingStartedStep>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  valueClassName = "text-foreground",
}: {
  label: string;
  value: string;
  helper: ReactNode;
  icon: ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card className="border-border/50 bg-card legal-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`mt-2 truncate text-3xl font-bold font-heading ${valueClassName}`}>{value}</p>
          </div>
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border/40">
            {icon}
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground border-t border-border/20 pt-2.5">{helper}</div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-secondary/40 hover:shadow-md"
    >
      <div className="mb-4 w-10 h-10 rounded-lg bg-muted border border-border/40 flex items-center justify-center">{icon}</div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-foreground text-base group-hover:text-secondary transition-colors">{title}</h3>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-secondary group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 text-xs leading-normal text-muted-foreground">{description}</p>
    </Link>
  );
}

function GettingStartedStep({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground shadow-sm">
        {number}
      </span>
      <span className="text-sm leading-normal text-muted-foreground">{children}</span>
    </li>
  );
}
