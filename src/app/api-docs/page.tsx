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
    path: "/api/trpc/auth.signUp",
    description: "Create a new user account",
    auth: false,
    body: { email: "string", password: "string (min 8)", name: "string (optional)" },
  },
  {
    method: "POST",
    path: "/api/trpc/auth.signIn",
    description: "Authenticate with email and password",
    auth: false,
    body: { email: "string", password: "string" },
  },
  {
    method: "POST",
    path: "/api/trpc/auth.resetPassword",
    description: "Send password reset email",
    auth: false,
    body: { email: "string" },
  },
  {
    method: "GET",
    path: "/api/trpc/business.list",
    description: "List all business profiles for the authenticated user",
    auth: true,
  },
  {
    method: "POST",
    path: "/api/trpc/business.create",
    description: "Create a new business profile",
    auth: true,
    body: { companyName: "string", businessEntity: "enum", businessType: "enum" },
  },
  {
    method: "GET",
    path: "/api/trpc/document.list",
    description: "List all documents for the authenticated user",
    auth: true,
    params: ["businessProfileId (optional)", "status (optional)"],
  },
  {
    method: "POST",
    path: "/api/trpc/document.generate",
    description: "Generate a document using AI (NVIDIA NIM / Groq)",
    auth: true,
    body: { businessProfileId: "uuid", templateId: "uuid", title: "string" },
  },
  {
    method: "POST",
    path: "/api/trpc/document.publish",
    description: "Publish a draft document",
    auth: true,
    body: { id: "uuid" },
  },
  {
    method: "GET",
    path: "/api/trpc/compliance.getComplianceScore",
    description: "Get compliance score for a business profile",
    auth: true,
    params: ["businessProfileId (uuid)"],
  },
  {
    method: "GET",
    path: "/api/trpc/compliance.getAlerts",
    description: "Get compliance alerts for the user",
    auth: true,
    params: ["isRead (optional)", "limit (default 50)"],
  },
  {
    method: "POST",
    path: "/api/billing/create-payment-link",
    description: "Create a Cashfree payment link for subscription upgrade",
    auth: true,
    body: { planId: "string", customerEmail: "string", customerName: "string" },
  },
  {
    method: "POST",
    path: "/api/documents/export",
    description: "Export a document in DOCX, HTML, Markdown, or PDF format",
    auth: true,
    body: { documentId: "uuid", title: "string", content: "string", format: "DOCX|HTML|MARKDOWN|PDF" },
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Badge variant="default" className="mb-4">API</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">API Documentation</h1>
          <p className="text-muted-foreground">tRPC-based API for LegalMint AI platform</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Base URL</span>
            </div>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">/api/trpc</code>
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
          <h2 className="text-xl font-semibold text-foreground">Endpoints</h2>
          {ENDPOINTS.map((endpoint, i) => (
            <div key={i} className="border border-border/50 rounded-xl p-5 bg-card">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm text-foreground font-mono">{endpoint.path}</code>
                {endpoint.auth && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">Auth Required</Badge>
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
                  <pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-x-auto text-muted-foreground">
                    {JSON.stringify(endpoint.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Webhooks</h2>
          <div className="border border-border/50 rounded-xl p-5 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">POST</span>
              <code className="text-sm text-foreground font-mono">/api/webhooks/cashfree</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Receives payment and subscription events from Cashfree. Validates HMAC-SHA256 signature.
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
