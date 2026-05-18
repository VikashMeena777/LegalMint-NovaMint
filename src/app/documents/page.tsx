"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Skeleton } from "@/components/Skeleton";
import { Lock, ClipboardList, Cookie, User, Handshake, Wallet, Megaphone, File, Search, Download, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DOCUMENT_TYPES = [
  { type: "PRIVACY_POLICY", label: "Privacy Policy", icon: Lock, color: "text-sky-600", bgColor: "bg-sky-100 dark:bg-sky-900/30", desc: "DPDP Act 2023 compliant" },
  { type: "TERMS_OF_SERVICE", label: "Terms of Service", icon: ClipboardList, color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-900/30", desc: "Indian Contract Act compliant" },
  { type: "COOKIE_POLICY", label: "Cookie Policy", icon: Cookie, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", desc: "IT Rules 2021 compliant" },
  { type: "EMPLOYMENT_AGREEMENT", label: "Employment Agreement", icon: User, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30", desc: "Indian labour law compliant" },
  { type: "NDA", label: "Non-Disclosure Agreement", icon: Handshake, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", desc: "Indian Contract Act compliant" },
  { type: "REFUND_POLICY", label: "Refund & Cancellation Policy", icon: Wallet, color: "text-rose-600", bgColor: "bg-rose-100 dark:bg-rose-900/30", desc: "Consumer Protection Act compliant" },
  { type: "GRIEVANCE_POLICY", label: "Grievance Redressal Policy", icon: Megaphone, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", desc: "IT Rules 2021 + CP Act" },
];

export default function DocumentsPage() {
  const supabase = createClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; content: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: templates, isLoading: templatesLoading } = trpc.compliance.getDocumentTemplates.useQuery();
  const { data: existingDocs, isLoading: docsLoading } = trpc.document.list.useQuery();

  const allDocs = useMemo(() => {
    const base = [...(existingDocs || []), ...documents];
    const unique = base.filter((doc, i, arr) => arr.findIndex(d => d.id === doc.id) === i);

    return unique.filter((doc) => {
      const matchesSearch = !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
      const matchesType = typeFilter === "all" || doc.templateId === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [existingDocs, documents, searchQuery, statusFilter, typeFilter]);

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

  const handleBulkExport = async (format: "DOCX" | "HTML" | "MARKDOWN" | "PDF") => {
    const selected = allDocs.filter(d => selectedIds.has(d.id));
    if (selected.length === 0) {
      toast.error("No documents selected");
      return;
    }

    for (const doc of selected) {
      await handleExport(doc, format);
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const selected = allDocs.filter(d => selectedIds.has(d.id));
    if (selected.length === 0) {
      toast.error("No documents selected");
      return;
    }

    if (!confirm(`Delete ${selected.length} document(s)? This cannot be undone.`)) return;

    for (const doc of selected) {
      await supabase.from("Document").delete().eq("id", doc.id);
    }

    setDocuments(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    toast.success(`${selected.length} document(s) deleted`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === allDocs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allDocs.map(d => d.id)));
    }
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

  if (templatesLoading || docsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground mt-1">Generate compliant legal documents for your Indian business</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((doc) => (
          <Card
            key={doc.type}
            className="group cursor-pointer hover-lift border-border/50 hover:border-primary/30 transition-all"
            onClick={() => handleGenerate(doc.type)}
          >
            <CardContent className="p-5">
              <div className={`w-11 h-11 rounded-xl ${doc.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                {generating && selectedType === doc.type ? (
                  <Loader2 className={`w-5 h-5 ${doc.color} animate-spin`} />
                ) : (
                  <doc.icon className={`w-5 h-5 ${doc.color}`} />
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{doc.label}</h3>
              <p className="text-sm text-muted-foreground">{doc.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-foreground">Your Documents ({allDocs.length})</h2>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="info">{selectedIds.size} selected</Badge>
              <Button variant="outline" size="sm" onClick={() => handleBulkExport("PDF")}>
                <Download className="w-4 h-4 mr-1.5" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkExport("DOCX")}>
                <Download className="w-4 h-4 mr-1.5" />
                Export DOCX
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Types</option>
            {templates?.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {allDocs.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <File className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No documents found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Generate your first document above"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-lg text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={selectedIds.size === allDocs.length && allDocs.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-input"
              />
              <span className="font-medium">Select all</span>
            </div>
            {allDocs.map((doc) => (
              <Card key={doc.id} className="border-border/50">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => toggleSelect(doc.id)}
                        className="rounded border-input"
                      />
                      <div>
                        <h3 className="font-medium text-foreground">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(doc.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={doc.status === "DRAFT" ? "warning" : doc.status === "PUBLISHED" ? "success" : "default"}>
                        {doc.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDoc({ title: doc.title, content: doc.content })}
                      >
                        Preview
                      </Button>
                      <div className="relative group">
                        <Button variant="ghost" size="sm">
                          Export
                        </Button>
                        <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-lg shadow-lg hidden group-hover:block z-10">
                          {(["DOCX", "HTML", "MARKDOWN", "PDF"] as const).map((format) => (
                            <button
                              key={format}
                              onClick={() => handleExport(doc, format)}
                              disabled={exporting === doc.id}
                              className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent disabled:opacity-50"
                            >
                              {exporting === doc.id ? "Exporting..." : `Export as ${format}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DocumentPreview
        title={previewDoc?.title || ""}
        content={previewDoc?.content || ""}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
