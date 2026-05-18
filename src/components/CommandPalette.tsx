"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void | Promise<void>;
  category: string;
}

export function CommandPalette() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch("");
    }
  }, [isOpen]);

  const commands: Command[] = [
    { id: "dashboard", label: "Go to Dashboard", shortcut: "G D", action: () => router.push("/dashboard"), category: "Navigation" },
    { id: "documents", label: "Go to Documents", shortcut: "G O", action: () => router.push("/documents"), category: "Navigation" },
    { id: "compliance", label: "Go to Compliance", shortcut: "G C", action: () => router.push("/compliance"), category: "Navigation" },
    { id: "billing", label: "Go to Billing", shortcut: "G B", action: () => router.push("/billing"), category: "Navigation" },
    { id: "settings", label: "Go to Settings", shortcut: "G S", action: () => router.push("/settings"), category: "Navigation" },
    { id: "onboarding", label: "Complete Onboarding", action: () => router.push("/onboarding"), category: "Navigation" },
    { id: "privacy-policy", label: "Generate Privacy Policy", action: () => router.push("/documents"), category: "Documents" },
    { id: "terms", label: "Generate Terms of Service", action: () => router.push("/documents"), category: "Documents" },
    { id: "nda", label: "Generate NDA", action: () => router.push("/documents"), category: "Documents" },
    { id: "employment", label: "Generate Employment Agreement", action: () => router.push("/documents"), category: "Documents" },
    {
      id: "signout",
      label: "Sign Out",
      shortcut: "Ctrl Q",
      action: async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      },
      category: "Account",
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/35 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category} className="mb-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{category}</p>
              {cmds.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    void cmd.action();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span>{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No commands found</p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>Press <kbd className="rounded border border-border bg-muted px-1">Ctrl+K</kbd> to toggle</span>
          <span>Press <kbd className="rounded border border-border bg-muted px-1">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
