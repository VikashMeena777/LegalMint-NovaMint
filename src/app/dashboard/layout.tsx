import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { BarChart3, FileText, File, CheckCircle, CreditCard, Settings, LayoutDashboard } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: FileText },
  { href: "/documents", label: "Documents", icon: File },
  { href: "/compliance", label: "Compliance", icon: CheckCircle },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userEmail = session.user.email || "";
  const userName = session.user.user_metadata?.name as string | undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block">
                Legal<span className="text-primary">Mint</span> AI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <CommandPalette />
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-3">
                <Avatar name={userName || userEmail} size="sm" />
                <span className="text-sm text-muted-foreground max-w-[150px] truncate">
                  {userEmail}
                </span>
              </div>
              <Link
                href="/api/auth/logout"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <nav className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Navigation
              </p>
              {navItems.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              ))}
              <Separator className="my-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Account
              </p>
              {navItems.slice(3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-border z-40 safe-area-bottom">
            <nav className="flex justify-around py-2">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <main className="flex-1 min-w-0 pb-24 lg:pb-0">
            {children}
          </main>
        </div>
      </div>

      <FeedbackWidget />
      <Toaster position="top-right" richColors />
    </div>
  );
}
