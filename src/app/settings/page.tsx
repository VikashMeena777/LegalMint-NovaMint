"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { exportUserData, downloadUserData } from "@/lib/data-export";
import { User, Download, Trash2, Info, Save, Loader2, ShieldAlert, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");
    setName(user.user_metadata?.name || "");

    const { data: profile } = await supabase
      .from("BusinessProfile")
      .select("companyName")
      .eq("userId", user.id)
      .single();

    if (profile) {
      setCompanyName(profile.companyName);
    }
  }, [supabase]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.auth.updateUser({
        data: { name },
      });

      const { data: profile } = await supabase
        .from("BusinessProfile")
        .select("id")
        .eq("userId", user.id)
        .single();

      if (profile) {
        await supabase
          .from("BusinessProfile")
          .update({ companyName })
          .eq("id", profile.id);
      }

      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }

    setLoading(false);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in");
        setExporting(false);
        return;
      }

      const exportData = await exportUserData(user.id);
      downloadUserData(exportData);
      toast.success("Data export downloaded");
    } catch {
      toast.error("Failed to export data");
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will delete your account and all data. This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete account");
      }

      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in font-body">
      <PageHeader
        title="Settings"
        description="Manage your account profile, privacy constraints, and legal configurations."
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 w-full sm:w-[420px] bg-muted/60 p-1 border border-border/50 rounded-xl mb-6">
          <TabsTrigger value="profile" className="rounded-lg text-xs font-semibold uppercase tracking-wider gap-1.5 py-2">
            <User className="w-3.5 h-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg text-xs font-semibold uppercase tracking-wider gap-1.5 py-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg text-xs font-semibold uppercase tracking-wider gap-1.5 py-2">
            <Info className="w-3.5 h-3.5" />
            About
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Profile Parameters</h2>
                    <p className="text-xs text-muted-foreground">Modify your account and corporate identity profile.</p>
                  </div>
                </div>

                <div className="grid gap-5">
                  <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background border-border/60"
                  />
                  <Input
                    label="Email Address"
                    value={email}
                    disabled
                    helperText="Corporate email address cannot be changed."
                    className="bg-background/50 border-border/40"
                  />
                  <Input
                    label="Registered Business Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Pvt Ltd"
                    className="bg-background border-border/60"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <Button onClick={handleSave} disabled={loading} className="font-semibold shadow-sm gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving configurations...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* PRIVACY & COMPLIANCE TAB */}
        <TabsContent value="privacy" className="focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Export data */}
            <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Download className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Right to Portability (DPDP Act)</h2>
                    <p className="text-xs text-muted-foreground">Export your mapped corporate data cleanly.</p>
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Under the Digital Personal Data Protection (DPDP) Act 2023, you retain the legal right to request and export all digitized corporate assets mapped under your entity in a structured format.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    disabled={exporting}
                    className="font-semibold border-border/60 hover:border-primary/50 text-xs py-5"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                        Structuring Portability JSON...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2 text-primary" />
                        Port Data Assets (Structured JSON)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <Trash2 className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground text-destructive">Right to Erasure</h2>
                    <p className="text-xs text-muted-foreground">Irrevocably erase your corporate footprint.</p>
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Requesting erasure will permanently delete your authenticated account profile, compliance matrices, drafts, and business roadmap files. This process is immediate and irreversible.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="font-semibold text-xs py-5"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Request Immediate Erasure (Delete Account)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about" className="focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border/50 bg-card legal-card paper-texture overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Platform Metadata</h2>
                    <p className="text-xs text-muted-foreground">Details about the active compliance core engine.</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  <p>
                    <strong className="text-foreground">LegalMint AI Core</strong> &bull; Version 2.0.0 (Indian Jurisdictions Build)
                  </p>
                  <p>
                    LegalMint is optimized for dynamic compliance management under Indian frameworks, including the IT Act 2000, GST directives, Labour and Employment rules, and compliance boundaries of the DPDP Act 2023.
                  </p>
                  <div className="rounded-lg bg-muted/65 border border-border/30 p-3.5 text-[10px] text-muted-foreground/80 leading-normal">
                    <span className="font-bold text-foreground block mb-1">LEGAL DISCLAIMER & COMPLIANCE STIPULATION:</span>
                    LegalMint AI operates as an automated regulatory drafting tool using vetted open-source matrices. LegalMint AI is not an advocate, legal advisor, or law firm. Use of these materials does not form an attorney-client relationship. Mapped roadmaps are informational; always consult a certified advocate before executing binding documents.
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
