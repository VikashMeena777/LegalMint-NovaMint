import Link from "next/link";
import { ArrowLeft, Globe, Key, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  auth: boolean;
  params?: string[];
  body?: Record<string, string>;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/email/welcome",
    description: "Send a welcome email after signing up",
    auth: false,
    body: { email: "string", name: "string" },
  },
  {
    method: "POST",
    path: "/api/auth/delete-account",
    description: "Delete user profile and user auth account along with all associated data",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/auth/logout",
    description: "Sign out the authenticated user and redirect to login",
    auth: false,
  },
  {
    method: "POST",
    path: "/api/documents/generate",
    description: "Generate a new legal document using NVIDIA NIM / Groq AI models",
    auth: true,
    body: { businessProfileId: "uuid", templateId: "uuid", title: "string" },
  },
  {
    method: "POST",
    path: "/api/documents/export",
    description: "Export an existing legal document to PDF, DOCX, HTML, or Markdown",
    auth: true,
    body: { documentId: "uuid", title: "string", content: "string", format: "DOCX|HTML|MARKDOWN|PDF" },
  },
  {
    method: "POST",
    path: "/api/billing/create-payment-link",
    description: "Create a Cashfree payment link for subscription plan upgrades",
    auth: true,
    body: { planId: "string", customerEmail: "string", customerPhone: "string (optional)", customerName: "string (optional)" },
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  PATCH: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background font-body">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Badge variant="default" className="mb-4">API</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 font-heading">API Documentation</h1>
          <p className="text-muted-foreground font-body">REST-based API for LegalMint AI platform</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Base URL</span>
            </div>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">/api</code>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Authentication</span>
            </div>
            <p className="text-xs text-muted-foreground">Supabase Auth cookies</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Content-Type</span>
            </div>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">application/json</code>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground font-heading">Endpoints</h2>
          {ENDPOINTS.map((endpoint, i) => (
            <div key={i} className="border border-border/50 rounded-xl p-5 bg-card legal-card">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm text-foreground font-mono">{endpoint.path}</code>
                {endpoint.auth && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0 bg-yellow-100 text-yellow-800 border-none">Auth Required</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
              {endpoint.params && endpoint.params.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Query Parameters:</p>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {endpoint.params.map((param) => (
                      <li key={param}><code className="bg-muted px-1 rounded text-xs">{param}</code></li>
                    ))}
                  </ul>
                </div>
              )}
              {endpoint.body && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Request Body:</p>
                  <pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-x-auto text-muted-foreground font-mono">
                    {JSON.stringify(endpoint.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">Webhooks</h2>
          <div className="border border-border/50 rounded-xl p-5 bg-card legal-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">POST</span>
              <code className="text-sm text-foreground font-mono">/api/webhooks/cashfree</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Receives payment and subscription events from Cashfree. Validates HMAC-SHA256 signature using `CASHFREE_WEBHOOK_SECRET`.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 LegalMint AI. API v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
