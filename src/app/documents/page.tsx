"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";

const DOCUMENT_TYPES = [
  { type: "PRIVACY_POLICY", label: "Privacy Policy", icon: "🔒", desc: "DPDP Act 2023 compliant" },
  { type: "TERMS_OF_SERVICE", label: "Terms of Service", icon: "📋", desc: "Indian Contract Act compliant" },
  { type: "COOKIE_POLICY", label: "Cookie Policy", icon: "🍪", desc: "IT Rules 2021 compliant" },
  { type: "EMPLOYMENT_AGREEMENT", label: "Employment Agreement", icon: "👤", desc: "Indian labour law compliant" },
  { type: "NDA", label: "Non-Disclosure Agreement", icon: "🤝", desc: "Indian Contract Act compliant" },
  { type: "REFUND_POLICY", label: "Refund & Cancellation Policy", icon: "💰", desc: "Consumer Protection Act compliant" },
  { type: "GRIEVANCE_POLICY", label: "Grievance Redressal Policy", icon: "📢", desc: "IT Rules 2021 + CP Act" },
];

export default function DocumentsPage() {
  const supabase = createClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; content: string } | null>(null);

  const { data: templates } = trpc.compliance.getDocumentTemplates.useQuery();

  const handleGenerate = async (type: string) => {
    setGenerating(true);
    setSelectedType(type);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in");
        setGenerating(false);
        setSelectedType(null);
        return;
      }

      const { data: profile } = await supabase
        .from("BusinessProfile")
        .select("*")
        .eq("userId", user.id)
        .eq("onboardingCompleted", true)
        .single();

      if (!profile) {
        toast.error("Please complete onboarding first");
        setGenerating(false);
        setSelectedType(null);
        return;
      }

      const template = templates?.find((t) => t.name === type);
      if (!template) {
        toast.error("Template not found for this document type");
        setGenerating(false);
        setSelectedType(null);
        return;
      }

      const content = fillTemplate(template.templateContent, profile);

      const { data: doc, error } = await supabase
        .from("Document")
        .insert({
          userId: user.id,
          businessProfileId: profile.id,
          templateId: template.id,
          title: getDocumentTitle(type, profile.companyName),
          content,
          status: "DRAFT",
          generatedByAI: false,
          version: "1.0.0",
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to generate document: " + error.message);
        setGenerating(false);
        setSelectedType(null);
        return;
      }

      setDocuments((prev) => [doc, ...prev]);
      toast.success(`${getDocumentTitle(type, profile.companyName)} generated successfully!`);
    } catch {
      toast.error("Something went wrong");
    }

    setGenerating(false);
    setSelectedType(null);
  };

  const handleExport = async (doc: any, format: "DOCX" | "HTML" | "MARKDOWN" | "PDF") => {
    setExporting(doc.id);

    try {
      const response = await fetch("/api/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: doc.id,
          title: doc.title,
          content: doc.content,
          format,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to export document");
        setExporting(null);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported as ${format}`);
    } catch {
      toast.error("Failed to export document");
    }

    setExporting(null);
  };

  const fillTemplate = (template: string, profile: any): string => {
    let content = template;
    const replacements: Record<string, string> = {
      "{{COMPANY_NAME}}": profile.companyName || "[Company Name]",
      "{{WEBSITE_URL}}": profile.website || "[Website URL]",
      "{{CONTACT_EMAIL}}": "[Contact Email]",
      "{{LAST_UPDATED}}": new Date().toISOString().split("T")[0],
      "{{GOVERNING_JURISDICTION}}": profile.incorporatedState || "India",
      "{{STATE}}": profile.incorporatedState || "[State]",
      "{{GRIEVANCE_OFFICER_EMAIL}}": profile.grievanceOfficerEmail || "[Grievance Email]",
      "{{COMPANY_ADDRESS}}": "[Company Address]",
    };

    for (const [key, value] of Object.entries(replacements)) {
      content = content.replaceAll(key, value);
    }

    return content;
  };

  const getDocumentTitle = (type: string, companyName: string) => {
    const titles: Record<string, string> = {
      PRIVACY_POLICY: "Privacy Policy",
      TERMS_OF_SERVICE: "Terms of Service",
      COOKIE_POLICY: "Cookie Policy",
      EMPLOYMENT_AGREEMENT: "Employment Agreement",
      NDA: "Non-Disclosure Agreement",
      REFUND_POLICY: "Refund & Cancellation Policy",
      GRIEVANCE_POLICY: "Grievance Redressal Policy",
    };
    return `${companyName} — ${titles[type] || type}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-600 mt-1">Generate compliant legal documents for your Indian business</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((doc) => (
          <button
            key={doc.type}
            onClick={() => handleGenerate(doc.type)}
            disabled={generating}
            className="text-left p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-2xl mb-2">{doc.icon}</div>
            <h3 className="font-semibold text-slate-900">{doc.label}</h3>
            <p className="text-sm text-slate-500 mt-1">{doc.desc}</p>
            {generating && selectedType === doc.type && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </div>
            )}
          </button>
        ))}
      </div>

      {documents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{doc.title}</h3>
                    <p className="text-sm text-slate-500">
                      {doc.status} · Created {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === "DRAFT" ? "bg-amber-100 text-amber-700" :
                      doc.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {doc.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewDoc({ title: doc.title, content: doc.content })}
                        className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        Preview
                      </button>
                      <div className="relative group">
                        <button className="text-sm text-blue-600 hover:underline">
                          Export
                        </button>
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                          {(["DOCX", "HTML", "MARKDOWN", "PDF"] as const).map((format) => (
                            <button
                              key={format}
                              onClick={() => handleExport(doc, format)}
                              disabled={exporting === doc.id}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                            >
                              {exporting === doc.id ? "Exporting..." : `Export as ${format}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DocumentPreview
        title={previewDoc?.title || ""}
        content={previewDoc?.content || ""}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
