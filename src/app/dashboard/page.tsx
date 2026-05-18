"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/Skeleton";
import { FileText, File, CheckCircle } from "lucide-react";

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
            <div key={i} className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2">
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
              <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="text-slate-600 mt-1">Here&apos;s your compliance overview</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Compliance Score"
          value={complianceScore ? `${complianceScore.score}%` : "--"}
          subtext={complianceScore ? `${complianceScore.compliant}/${complianceScore.total - complianceScore.notApplicable} compliant` : "Complete onboarding"}
          color="blue"
        />
        <StatCard
          label="Documents"
          value={documents?.length?.toString() ?? "0"}
          subtext={documents?.length ? `${documents.filter((d) => d.status === "PUBLISHED").length} published` : "No documents yet"}
          color="green"
        />
        <StatCard
          label="Active Alerts"
          value={alerts?.length?.toString() ?? "0"}
          subtext={alerts?.length ? "Needs attention" : "All clear"}
          color="amber"
        />
        <StatCard
          label="Plan"
          value="Free"
          subtext="Upgrade for more"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Start Onboarding"
            description="Tell us about your business to generate a personalized compliance roadmap."
            href="/onboarding"
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <QuickActionCard
            title="Generate Document"
            description="Create a Privacy Policy, Terms of Service, or other legal document."
            href="/documents"
            icon={<File className="w-6 h-6 text-emerald-600" />}
            color="green"
          />
          <QuickActionCard
            title="View Compliance"
            description="Check your compliance status across Indian regulations."
            href="/compliance"
            icon={<CheckCircle className="w-6 h-6 text-amber-600" />}
            color="amber"
          />
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts && alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="font-medium text-amber-900">{alert.title}</p>
                <p className="text-sm text-amber-700 mt-1">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {!activeBusiness && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h2>
          <ol className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
              <span>Complete the <Link href="/onboarding" className="underline font-medium">business onboarding</Link> to identify your compliance requirements.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
              <span>Review your personalized <Link href="/compliance" className="underline font-medium">compliance roadmap</Link> with prioritized action items.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
              <span>Generate your first legal document — <Link href="/documents" className="underline font-medium">Privacy Policy</Link> or <Link href="/documents" className="underline font-medium">Terms of Service</Link>.</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subtext, color }: { label: string; value: string; subtext: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    amber: "bg-amber-50 border-amber-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color] || "bg-slate-50 border-slate-200"}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtext}</p>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon, color }: { title: string; description: string; href: string; icon: React.ReactNode; color: string }) {
  const borderColors: Record<string, string> = {
    blue: "hover:border-blue-300",
    green: "hover:border-green-300",
    amber: "hover:border-amber-300",
  };

  return (
    <Link
      href={href}
      className={`block p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all ${borderColors[color] || ""}`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </Link>
  );
}
