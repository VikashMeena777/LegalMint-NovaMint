import Link from "next/link";

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

const TYPE_STYLES: Record<string, { badge: string; icon: string }> = {
  feature: { badge: "bg-green-100 text-green-700", icon: "✨" },
  improvement: { badge: "bg-blue-100 text-blue-700", icon: "🔧" },
  fix: { badge: "bg-amber-100 text-amber-700", icon: "🐛" },
  security: { badge: "bg-red-100 text-red-700", icon: "🔒" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-slate-900">LegalMint AI</span>
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Changelog</h1>
        <p className="text-slate-600 mb-12">What&apos;s new in LegalMint AI</p>

        <div className="space-y-8">
          {CHANGELOG.map((entry) => {
            const style = TYPE_STYLES[entry.type];
            return (
              <div key={entry.version} className="border-l-2 border-slate-200 pl-6 pb-8 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{style.icon}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                    {entry.type}
                  </span>
                  <span className="text-sm text-slate-500">{entry.date}</span>
                  <span className="text-sm font-mono text-slate-400">v{entry.version}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{entry.title}</h2>
                <p className="text-slate-600">{entry.description}</p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 text-center">
            © 2026 LegalMint AI. Not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
