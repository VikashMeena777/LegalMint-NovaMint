"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  File,
  CheckCircle,
  CreditCard,
  Settings,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: FileText },
  { href: "/documents", label: "Documents", icon: File },
  { href: "/compliance", label: "Compliance", icon: CheckCircle },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const renderLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
          isActive
            ? "bg-secondary/10 text-secondary border-l-2 border-secondary rounded-l-none"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-secondary" : "text-muted-foreground")} />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-56 flex-shrink-0 lg:block font-body">
      <nav className="sticky top-24 space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.slice(0, 3).map(renderLink)}
        <Separator className="my-4 bg-border/40" />
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-3">
          Account & Compliance
        </p>
        {navItems.slice(3).map(renderLink)}
      </nav>
    </aside>
  );
}

export function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur lg:hidden font-body shadow-lg">
      <nav className="grid grid-cols-5 px-1 py-1.5">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-1 text-[10px] font-semibold transition-colors",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-secondary" : "text-muted-foreground")} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
