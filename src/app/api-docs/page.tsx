import Link from "next/link";

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
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  PATCH: "bg-purple-100 text-purple-700",
};

export default function ApiDocsPage() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API Documentation</h1>
        <p className="text-slate-600 mb-8">tRPC-based API for LegalMint AI platform</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Base URL:</strong> <code className="bg-blue-100 px-1 rounded">/api/trpc</code>
            <br />
            <strong>Authentication:</strong> Session-based via Supabase Auth cookies
            <br />
            <strong>Content-Type:</strong> <code className="bg-blue-100 px-1 rounded">application/json</code>
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Endpoints</h2>
          {ENDPOINTS.map((endpoint, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm text-slate-900 font-mono">{endpoint.path}</code>
                {endpoint.auth && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                    Auth Required
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3">{endpoint.description}</p>
              {endpoint.params && endpoint.params.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Query Parameters:</p>
                  <ul className="text-sm text-slate-600 space-y-0.5">
                    {endpoint.params.map((param) => (
                      <li key={param}><code className="bg-slate-100 px-1 rounded">{param}</code></li>
                    ))}
                  </ul>
                </div>
              )}
              {endpoint.body && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Request Body:</p>
                  <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(endpoint.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Webhooks</h2>
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">POST</span>
              <code className="text-sm text-slate-900 font-mono">/api/webhooks/cashfree</code>
            </div>
            <p className="text-sm text-slate-600">
              Receives payment and subscription events from Cashfree. Validates HMAC-SHA256 signature.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 text-center">
            © 2026 LegalMint AI. API v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
