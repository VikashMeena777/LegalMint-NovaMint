import { AlertTriangle } from "lucide-react";

export function LegalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-secondary/10 border-t border-secondary/25 px-4 py-2.5 ${className}`}>
      <div className="mx-auto flex max-w-7xl items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
        <p className="text-xs leading-5 text-foreground/75">
          <strong>Disclaimer:</strong> LegalMint AI is not a law firm and does not provide legal advice.
          Generated documents are templates and should be reviewed by a qualified advocate before use.
          Compliance requirements may change; verify with current Indian regulations.
        </p>
      </div>
    </div>
  );
}
