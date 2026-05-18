import { AlertTriangle } from "lucide-react";

export function LegalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 p-3 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> LegalMint AI is not a law firm and does not provide legal advice.
          Generated documents are templates and should be reviewed by a qualified advocate before use.
          Compliance requirements may change; verify with current Indian regulations.
        </p>
      </div>
    </div>
  );
}
