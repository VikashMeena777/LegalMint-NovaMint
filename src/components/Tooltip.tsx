"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg pointer-events-none`}
          role="tooltip"
        >
          {content}
          <div className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
            position === "top" ? "bottom-[-4px] left-1/2 -translate-x-1/2" :
            position === "bottom" ? "top-[-4px] left-1/2 -translate-x-1/2" :
            position === "left" ? "right-[-4px] top-1/2 -translate-y-1/2" :
            "left-[-4px] top-1/2 -translate-y-1/2"
          }`} />
        </div>
      )}
    </div>
  );
}

const COMPLIANCE_HELP: Record<string, string> = {
  PRIVACY: "Privacy regulations under the DPDP Act 2023, IT Act 2000, and SPDI Rules 2011. Covers data collection, consent, storage, and Data Principal rights.",
  CONSUMER: "Consumer Protection Act 2019 and E-Commerce Rules 2020. Covers refund policies, grievance redressal, unfair trade practices, and consumer rights.",
  EMPLOYMENT: "Indian labour laws including Industrial Employment (Standing Orders) Act 1946, Payment of Wages Act 1936, and new Labour Codes.",
  TAX: "Income Tax Act 1961 provisions including TDS, advance tax, and business income tax compliance.",
  GST: "GST Act 2017 covering GSTR-1, GSTR-3B, GSTR-9 filings, input tax credit, and e-invoicing requirements.",
  CORPORATE: "Companies Act 2013 provisions including annual filings (AOC-4, MGT-7), board resolutions, and statutory registers.",
  LABOUR: "Provident Fund (EPF), ESI, gratuity, minimum wages, and workplace harassment (POSH) compliance.",
  SECTOR_SPECIFIC: "Industry-specific regulations such as RBI guidelines for fintech, IRDAI for insurance, or FSSAI for food businesses.",
};

export function ComplianceHelpTooltip({ category }: { category: string }) {
  const helpText = COMPLIANCE_HELP[category];
  if (!helpText) return null;

  return (
    <Tooltip content={helpText}>
      <button
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-600 hover:bg-blue-200 hover:text-blue-700 transition-colors text-xs font-bold"
        aria-label={`Help: ${category} compliance`}
        tabIndex={0}
      >
        ?
      </button>
    </Tooltip>
  );
}
