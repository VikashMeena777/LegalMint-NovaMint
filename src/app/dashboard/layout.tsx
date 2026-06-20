import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import { DashboardSidebar, DashboardBottomNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userEmail = user.email || "";
  const userName = user.user_metadata?.name as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <div className="flex items-center gap-3">
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
                className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <DashboardSidebar />
          <DashboardBottomNav />

          <main className="min-w-0 flex-1 pb-24 lg:pb-0">
            {children}
          </main>
        </div>
      </div>

      <FeedbackWidget />
    </div>
  );
}
