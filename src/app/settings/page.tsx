"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { exportUserData, downloadUserData } from "@/lib/data-export";
import { User, Download, Trash2, Info, Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("BusinessProfile")
        .delete()
        .eq("userId", user.id);

      await supabase.auth.admin.deleteUser(user.id);

      toast.success("Account deleted");
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and business profile."
      />

      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-5">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={email}
              disabled
              helperText="Email cannot be changed"
            />
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Pvt Ltd"
            />
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Data & Privacy</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-foreground">Export My Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download all your data in a machine-readable format (DPDP Act right to data portability).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exporting}
                className="mt-3"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing export...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data (JSON)
                  </>
                )}
              </Button>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium text-destructive">Delete My Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                className="mt-3"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">LegalMint AI</strong> v2.0 (India Edition)</p>
            <p>Built for Indian businesses. Compliant with DPDP Act 2023.</p>
            <p className="text-muted-foreground/70">LegalMint AI is not a law firm and does not provide legal advice. Consult a qualified advocate for legal matters.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
