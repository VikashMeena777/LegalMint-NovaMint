export function LegalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
      <p className="text-xs text-amber-800">
        <strong>Disclaimer:</strong> LegalMint AI is not a law firm and does not provide legal advice.
        Generated documents are templates and should be reviewed by a qualified advocate before use.
        Compliance requirements may change; verify with current Indian regulations.
      </p>
    </div>
  );
}
