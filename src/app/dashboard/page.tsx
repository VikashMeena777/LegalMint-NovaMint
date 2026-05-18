"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/Skeleton";
import { FileText, File, CheckCircle, ArrowRight, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { data: session, isLoading: sessionLoading } = trpc.auth.getSession.useQuery();
  const { data: businesses, isLoading: businessesLoading } = trpc.business.list.useQuery();
  const { data: documents, isLoading: documentsLoading } = trpc.document.list.useQuery();
  const { data: alerts, isLoading: alertsLoading } = trpc.compliance.getAlerts.useQuery({ isRead: false, limit: 5 });

  const activeBusiness = businesses?.[0];

  const { data: complianceScore, isLoading: scoreLoading } = trpc.compliance.getComplianceScore.useQuery(
    { businessProfileId: activeBusiness?.id ?? "" },
    { enabled: !!activeBusiness?.id }
  );

  const userName = session?.user?.user_metadata?.name as string | undefined;
  const isLoading = sessionLoading || businessesLoading || documentsLoading || alertsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 bg-card border border-border rounded-xl space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scoreValue = complianceScore?.score ?? 0;
  const scoreColor = scoreValue >= 80 ? "text-emerald-600" : scoreValue >= 50 ? "text-amber-600" : "text-red-600";
  const progressColor = scoreValue >= 80 ? "success" : scoreValue >= 50 ? "warning" : "destructive";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your compliance overview</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className={`text-3xl font-bold mt-1 ${scoreColor}`}>
                  {complianceScore ? `${complianceScore.score}%` : "--"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {complianceScore
                ? `${complianceScore.compliant}/${complianceScore.total - complianceScore.notApplicable} compliant`
                : "Complete onboarding"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {documents?.length ?? "0"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {documents?.length
                ? `${documents.filter((d) => d.status === "PUBLISHED").length} published`
                : "No documents yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {alerts?.length ?? "0"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {alerts?.length ? "Needs attention" : "All clear"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-3xl font-bold text-foreground mt-1">Free</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Link href="/billing" className="text-primary hover:underline">Upgrade for more</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Start Onboarding"
            description="Tell us about your business to generate a personalized compliance roadmap."
            href="/onboarding"
            icon={<FileText className="w-6 h-6 text-primary" />}
          />
          <QuickActionCard
            title="Generate Document"
            description="Create a Privacy Policy, Terms of Service, or other legal document."
            href="/documents"
            icon={<File className="w-6 h-6 text-emerald-600" />}
          />
          <QuickActionCard
            title="View Compliance"
            description="Check your compliance status across Indian regulations."
            href="/compliance"
            icon={<CheckCircle className="w-6 h-6 text-amber-600" />}
          />
        </div>
      </div>

      {/* Compliance Score Card */}
      {activeBusiness && complianceScore && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Compliance Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {complianceScore.compliant} of {complianceScore.total - complianceScore.notApplicable} requirements met
              </span>
              <span className={`text-2xl font-bold ${scoreColor}`}>{complianceScore.score}%</span>
            </div>
            <Progress value={complianceScore.score} color={progressColor} size="lg" />
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">{alert.title}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {!activeBusiness && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                <span className="text-primary-foreground/80">
                  Complete the <Link href="/onboarding" className="text-primary underline font-medium">business onboarding</Link> to identify your compliance requirements.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                <span className="text-primary-foreground/80">
                  Review your personalized <Link href="/compliance" className="text-primary underline font-medium">compliance roadmap</Link> with prioritized action items.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                <span className="text-primary-foreground/80">
                  Generate your first legal document — <Link href="/documents" className="text-primary underline font-medium">Privacy Policy</Link> or <Link href="/documents" className="text-primary underline font-medium">Terms of Service</Link>.
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block p-5 bg-card border border-border/50 rounded-xl hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className="mb-3">{icon}</div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Link>
  );
}
