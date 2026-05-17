"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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
  };

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and business profile</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Your Company Pvt Ltd"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Data & Privacy</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-900">Export My Data</h3>
            <p className="text-sm text-slate-600 mt-1">Download all your data in a machine-readable format (DPDP Act right).</p>
            <button className="mt-2 text-sm text-blue-600 hover:underline">
              Request Data Export
            </button>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium text-red-600">Delete My Account</h3>
            <p className="text-sm text-slate-600 mt-1">Permanently delete your account and all associated data.</p>
            <button
              onClick={handleDeleteAccount}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p><strong>LegalEase AI</strong> v2.0 (India Edition)</p>
          <p>Built for Indian businesses. Compliant with DPDP Act 2023.</p>
          <p className="text-slate-500">LegalEase AI is not a law firm and does not provide legal advice. Consult a qualified advocate for legal matters.</p>
        </div>
      </div>
    </div>
  );
}
