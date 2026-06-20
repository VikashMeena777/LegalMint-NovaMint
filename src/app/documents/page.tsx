"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Skeleton } from "@/components/Skeleton";
import { Lock, ClipboardList, Cookie, User, Handshake, Wallet, Megaphone, File, Search, Download, Trash2, Loader2, Eye, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  templateId?: string | null;
};

type TemplateProfile = {
  companyName?: string | null;
  website?: string | null;
  incorporatedState?: string | null;
  grievanceOfficerEmail?: string | null;
};

const DOCUMENT_TYPES = [
  { type: "PRIVACY_POLICY", label: "Privacy Policy", icon: Lock, color: "text-sky-600", bgColor: "bg-sky-50 dark:bg-sky-950/20 border-sky-200/50", desc: "DPDP Act 2023 compliant policy builder" },
  { type: "TERMS_OF_SERVICE", label: "Terms of Service", icon: ClipboardList, color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/50", desc: "Indian Contract Act vetted covenants" },
  { type: "COOKIE_POLICY", label: "Cookie Policy", icon: Cookie, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50", desc: "IT Rules 2021 browser tracker statements" },
  { type: "EMPLOYMENT_AGREEMENT", label: "Employment Agreement", icon: User, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/20 border-purple-200/50", desc: "Vetted Indian labour law frameworks" },
  { type: "NDA", label: "Non-Disclosure Agreement", icon: Handshake, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50", desc: "Confidentiality & Contract Act covenants" },
  { type: "REFUND_POLICY", label: "Refund & Cancellation", icon: Wallet, color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/20 border-rose-200/50", desc: "Consumer Protection directives" },
  { type: "GRIEVANCE_POLICY", label: "Grievance Redressal", icon: Megaphone, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/20 border-orange-200/50", desc: "IT Rules 2021 + CP Act officers" },
];

export default function DocumentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; content: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [templates, setTemplates] = useState<any[]>([]);
  const [existingDocs, setExistingDocs] = useState<DocumentRecord[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [templatesRes, docsRes] = await Promise.all([
        supabase.from("DocumentTemplate").select("*").eq("isActive", true).order("name"),
        supabase.from("Document").select("*, DocumentTemplate(name, category)").eq("userId", user.id).order("createdAt", { ascending: false })
      ]);

      if (templatesRes.data) {
        setTemplates(templatesRes.data);
      }
      if (docsRes.data) {
        setExistingDocs(docsRes.data as DocumentRecord[]);
      }
    } catch {
      toast.error("Failed to load document templates or documents");
    } finally {
      setTemplatesLoading(false);
      setDocsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allDocs = useMemo(() => {
    const base = [...((existingDocs || []) as DocumentRecord[]), ...documents];
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

      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfileId: profile.id,
          templateId: template.id,
          title: getDocumentTitle(type, profile.companyName),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate document");
      }

      const doc = await response.json();
      setDocuments((prev) => [doc, ...prev]);
      void loadData();
      toast.success(`${getDocumentTitle(type, profile.companyName)} generated successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate document");
    }

    setGenerating(false);
    setSelectedType(null);
  };

  const handleExport = async (doc: DocumentRecord, format: "DOCX" | "HTML" | "MARKDOWN" | "PDF") => {
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not found");
        return;
      }

      for (const doc of selected) {
        await supabase
          .from("Document")
          .delete()
          .eq("id", doc.id)
          .eq("userId", user.id);
      }

      setDocuments(prev => prev.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      toast.success(`${selected.length} document(s) deleted`);
    } catch {
      toast.error("Failed to delete documents");
    }
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
    return `${companyName} - ${titles[type] || type}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge variant="warning" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Draft</Badge>;
      case "PUBLISHED": return <Badge variant="success" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Published</Badge>;
      case "ARCHIVED": return <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Archived</Badge>;
      default: return <Badge className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</Badge>;
    }
  };

  if (templatesLoading || docsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5">
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
    <div className="space-y-8 animate-fade-in font-body">
      <PageHeader
        title="Document Workspace"
        description="Generate and manage legally compliant documents for Indian jurisdictions."
      />

      {/* Grid of builder document types */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-foreground">Generate New Document</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENT_TYPES.map((doc, index) => (
            <motion.button
              type="button"
              key={doc.type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="group rounded-xl border border-border/50 bg-card p-5 text-left transition-all duration-300 hover-lift hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => handleGenerate(doc.type)}
              disabled={generating}
            >
              <div className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg border ${doc.bgColor}`}>
                {generating && selectedType === doc.type ? (
                  <Loader2 className={`h-5 w-5 ${doc.color} animate-spin`} />
                ) : (
                  <doc.icon className={`h-5 w-5 ${doc.color}`} />
                )}
              </div>
              <h3 className="mb-1 font-heading font-bold text-foreground group-hover:text-primary transition-colors text-base">{doc.label}</h3>
              <p className="text-xs text-muted-foreground leading-normal">{doc.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Document management section */}
      <div className="space-y-4 pt-4 border-t border-border/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Your Documents Directory ({allDocs.length})</h2>
          
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap items-center gap-2"
              >
                <Badge variant="info" className="px-3 py-1 font-bold text-xs">{selectedIds.size} Selected</Badge>
                <Button variant="outline" size="sm" onClick={() => handleBulkExport("PDF")} className="h-9 text-xs font-semibold">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkExport("DOCX")} className="h-9 text-xs font-semibold">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  DOCX
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-9 text-xs font-semibold">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title or contents..."
              leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
              className="bg-card border-border/50 text-sm h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-10 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 text-xs">
              <SelectValue placeholder="All Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templates?.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents list */}
        {allDocs.length === 0 ? (
          <Card className="border-border/50 bg-card legal-card paper-texture">
            <CardContent className="py-16 text-center max-w-sm mx-auto">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center mb-4">
                <File className="w-6 h-6 text-muted-foreground/45" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5">No Documents Found</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try resetting your search query or adjusting your filters."
                  : "Generate your first regulatory document above."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 border border-border/20 text-xs text-muted-foreground">
              <input
                type="checkbox"
                aria-label="Select all documents"
                checked={selectedIds.size === allDocs.length && allDocs.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5"
              />
              <span className="font-semibold uppercase tracking-wider">Select All Documents</span>
            </div>

            <AnimatePresence mode="popLayout">
              {allDocs.map((doc, docIndex) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: Math.min(docIndex * 0.02, 0.25) }}
                  className="rounded-xl border border-border/50 bg-card legal-card hover-lift transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${doc.title}`}
                          checked={selectedIds.has(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                          className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5 flex-shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="truncate font-heading font-bold text-foreground text-base">{doc.title}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <span>Generated:</span>
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        {getStatusBadge(doc.status)}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDoc({ title: doc.title, content: doc.content })}
                          className="h-9 px-3 text-xs font-semibold border border-border/20 group-hover:border-primary/20 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-primary" />
                          Preview
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/20">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs font-medium border border-border/50">
                            <DropdownMenuItem onClick={() => handleExport(doc, "PDF")} className="gap-2">
                              <Download className="w-3.5 h-3.5 text-muted-foreground" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(doc, "DOCX")} className="gap-2">
                              <Download className="w-3.5 h-3.5 text-muted-foreground" />
                              Export DOCX
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(doc, "HTML")} className="gap-2">
                              <Download className="w-3.5 h-3.5 text-muted-foreground" />
                              Export HTML
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(doc, "MARKDOWN")} className="gap-2">
                              <Download className="w-3.5 h-3.5 text-muted-foreground" />
                              Export Markdown
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
