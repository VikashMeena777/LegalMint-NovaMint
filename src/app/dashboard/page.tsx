"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/Skeleton";
import { AlertTriangle, ArrowRight, CheckCircle, CreditCard, File, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";

export default function DashboardPage() {
  const { data: session, isLoading: sessionLoading } = trpc.auth.getSession.useQuery();
  const { data: businesses, isLoading: businessesLoading } = trpc.business.list.useQuery();
  const { data: documents, isLoading: documentsLoading } = trpc.document.list.useQuery();
  const { data: alerts, isLoading: alertsLoading } = trpc.compliance.getAlerts.useQuery({ isRead: false, limit: 5 });

  const activeBusiness = businesses?.[0];

  const { data: complianceScore } = trpc.compliance.getComplianceScore.useQuery(
    { businessProfileId: activeBusiness?.id ?? "" },
    { enabled: !!activeBusiness?.id }
  );

  const userName = session?.user?.user_metadata?.name as string | undefined;
  const isLoading = sessionLoading || businessesLoading || documentsLoading || alertsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div>
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-5">
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
  const scoreColor = scoreValue >= 80 ? "text-emerald-600" : scoreValue >= 50 ? "text-secondary" : "text-red-600";
  const progressColor = scoreValue >= 80 ? "success" : scoreValue >= 50 ? "warning" : "destructive";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${userName ? `, ${userName}` : ""}`}
        description="Here is your compliance overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Compliance Score"
          value={complianceScore ? `${complianceScore.score}%` : "--"}
          helper={complianceScore
            ? `${complianceScore.compliant}/${complianceScore.total - complianceScore.notApplicable} compliant`
            : "Complete onboarding"}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          valueClassName={scoreColor}
        />
        <MetricCard
          label="Documents"
          value={String(documents?.length ?? 0)}
          helper={documents?.length
            ? `${documents.filter((d) => d.status === "PUBLISHED").length} published`
            : "No documents yet"}
          icon={<FileText className="h-5 w-5 text-emerald-600" />}
        />
        <MetricCard
          label="Active Alerts"
          value={String(alerts?.length ?? 0)}
          helper={alerts?.length ? "Needs attention" : "All clear"}
          icon={<AlertTriangle className="h-5 w-5 text-secondary" />}
        />
        <MetricCard
          label="Plan"
          value="Free"
          helper={<Link href="/billing" className="text-primary hover:underline">Upgrade for more</Link>}
          icon={<CreditCard className="h-5 w-5 text-rose-600" />}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
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
            icon={<CheckCircle className="h-6 w-6 text-secondary" />}
          />
        </div>
      </section>

      {activeBusiness && complianceScore && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Compliance Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {complianceScore.compliant} of {complianceScore.total - complianceScore.notApplicable} requirements met
              </span>
              <span className={`text-2xl font-semibold ${scoreColor}`}>{complianceScore.score}%</span>
            </div>
            <Progress value={complianceScore.score} color={progressColor} size="lg" />
          </CardContent>
        </Card>
      )}

      {alerts && alerts.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-lg border border-secondary/25 bg-secondary/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                    <div>
                      <p className="font-medium text-foreground">{alert.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!activeBusiness && (
        <Card className="border-primary/25 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <GettingStartedStep number={1}>
                Complete the <Link href="/onboarding" className="font-medium text-primary underline">business onboarding</Link> to identify your compliance requirements.
              </GettingStartedStep>
              <GettingStartedStep number={2}>
                Review your personalized <Link href="/compliance" className="font-medium text-primary underline">compliance roadmap</Link> with prioritized action items.
              </GettingStartedStep>
              <GettingStartedStep number={3}>
                Generate your first legal document: <Link href="/documents" className="font-medium text-primary underline">Privacy Policy</Link> or <Link href="/documents" className="font-medium text-primary underline">Terms of Service</Link>.
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
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`mt-1 truncate text-3xl font-semibold ${valueClassName}`}>{value}</p>
          </div>
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="mb-3">{icon}</div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </Link>
  );
}

function GettingStartedStep({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        {number}
      </span>
      <span className="text-sm leading-6 text-muted-foreground">{children}</span>
    </li>
  );
}
