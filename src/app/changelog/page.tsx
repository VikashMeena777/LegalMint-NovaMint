import Link from "next/link";
import { ArrowLeft, Sparkles, Wrench, Bug, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix" | "security";
  title: string;
  description: string;
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.1.0",
    date: "2026-05-18",
    type: "feature",
    title: "Pre-Launch Feature Complete",
    description: "Added document preview, bulk actions, search & filter, compliance calendar, command palette (Ctrl+K), dark mode, feedback widget, and compliance report export.",
  },
  {
    version: "2.0.0",
    date: "2026-05-17",
    type: "feature",
    title: "Platform Rebuild",
    description: "Flattened monorepo to single Next.js app. Replaced Prisma with direct Supabase client. Implemented tRPC routers, Cashfree payments, Resend emails, and NVIDIA NIM/Groq AI generation.",
  },
  {
    version: "1.0.0",
    date: "2026-05-01",
    type: "feature",
    title: "Initial Release",
    description: "MVP with AI document generation, compliance tracking, and regulatory alerts for Indian businesses.",
  },
];

const TYPE_STYLES: Record<string, { badge: string; icon: React.ElementType; label: string }> = {
  feature: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: Sparkles, label: "Feature" },
  improvement: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Wrench, label: "Improvement" },
  fix: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Bug, label: "Fix" },
  security: { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: Lock, label: "Security" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Badge variant="default" className="mb-4">Updates</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Changelog</h1>
          <p className="text-muted-foreground">What&apos;s new in LegalMint AI</p>
        </div>

        <div className="space-y-8">
          {CHANGELOG.map((entry) => {
            const style = TYPE_STYLES[entry.type];
            return (
              <div key={entry.version} className="relative pl-8 pb-8 last:pb-0">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border">
                  <div className="absolute top-1.5 -left-1.5 w-3 h-3 rounded-full bg-primary" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <style.icon className="w-5 h-5 text-muted-foreground" />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{entry.date}</span>
                  <span className="text-sm font-mono text-muted-foreground">v{entry.version}</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{entry.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{entry.description}</p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 LegalMint AI. Not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
