"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function FeedbackWidget() {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [type, setType] = useState<"bug" | "feature" | "general">("general");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("AuditLog").insert({
        userId: user?.id || "anonymous",
        action: "feedback_submitted",
        resourceType: "feedback",
        metadata: { type, feedback: feedback.slice(0, 1000) },
      });

      if (error) throw error;

      toast.success("Thank you for your feedback!");
      setFeedback("");
      setIsOpen(false);
    } catch {
      toast.error("Failed to submit feedback");
    }

    setSubmitting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Send feedback"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-8 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Send Feedback</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div className="flex gap-2">
          {(["bug", "feature", "general"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                type === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
              }`}
            >
              {t === "bug" ? "🐛 Bug" : t === "feature" ? "💡 Feature" : "💬 General"}
            </button>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what you think..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24 text-sm"
          maxLength={1000}
          required
        />
        <p className="text-xs text-slate-500 text-right">{feedback.length}/1000</p>
        <button
          type="submit"
          disabled={submitting || !feedback.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {submitting ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </div>
  );
}
