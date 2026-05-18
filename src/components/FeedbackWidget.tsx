"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackWidget() {
  const supabase = useMemo(() => createClient(), []);
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
        className="fixed bottom-5 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 lg:bottom-6"
        title="Send feedback"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-border bg-card text-card-foreground shadow-xl lg:bottom-6">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold">Send feedback</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close feedback"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        <div className="flex gap-2">
          {(["bug", "feature", "general"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-md border py-1.5 text-xs font-medium capitalize transition-colors ${
                type === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what you think..."
          className="h-24 resize-none"
          maxLength={1000}
          showCount
          required
        />
        <Button
          type="submit"
          disabled={submitting || !feedback.trim()}
          className="w-full"
        >
          {submitting ? "Sending..." : "Send Feedback"}
        </Button>
      </form>
    </div>
  );
}
