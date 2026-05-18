"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const router = useRouter();
  const supabase = createClient();
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
    { id: "signout", label: "Sign Out", shortcut: "⌘ Q", action: async () => { await supabase.auth.signOut(); window.location.href = "/"; }, category: "Account" },
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
      className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[20vh]"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category} className="mb-2">
              <p className="text-xs font-medium text-slate-500 px-2 py-1">{category}</p>
              {cmds.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                >
                  <span className="text-slate-700">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">No commands found</p>
          )}
        </div>
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-slate-500">
          <span>Press <kbd className="bg-slate-100 px-1 rounded">Ctrl+K</kbd> to toggle</span>
          <span>Press <kbd className="bg-slate-100 px-1 rounded">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
