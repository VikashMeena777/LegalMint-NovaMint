"use client";

import { useState } from "react";

interface FilingDeadline {
  name: string;
  description: string;
  frequency: "monthly" | "quarterly" | "annual";
  months: number[];
  dayOfMonth: number;
  category: "GST" | "TDS" | "ROC" | "PF" | "ESI" | "PT" | "Income Tax";
}

const FILING_DEADLINES: FilingDeadline[] = [
  { name: "GSTR-1", description: "Outward supplies return", frequency: "monthly", months: [0,1,2,3,4,5,6,7,8,9,10,11], dayOfMonth: 11, category: "GST" },
  { name: "GSTR-3B", description: "Summary return + tax payment", frequency: "monthly", months: [0,1,2,3,4,5,6,7,8,9,10,11], dayOfMonth: 20, category: "GST" },
  { name: "GSTR-9", description: "Annual return", frequency: "annual", months: [2], dayOfMonth: 31, category: "GST" },
  { name: "TDS Payment", description: "Tax deducted at source deposit", frequency: "monthly", months: [0,1,2,3,4,5,6,7,8,9,10,11], dayOfMonth: 7, category: "TDS" },
  { name: "TDS Return (Q)", description: "Quarterly TDS return (24Q/26Q)", frequency: "quarterly", months: [0,3,6,9], dayOfMonth: 31, category: "TDS" },
  { name: "PF/ESI Payment", description: "Provident Fund + ESI contribution", frequency: "monthly", months: [0,1,2,3,4,5,6,7,8,9,10,11], dayOfMonth: 15, category: "PF" },
  { name: "ROC Annual Filing", description: "AOC-4 + MGT-7 annual filing", frequency: "annual", months: [8], dayOfMonth: 30, category: "ROC" },
  { name: "Income Tax Return", description: "ITR filing for businesses", frequency: "annual", months: [6], dayOfMonth: 31, category: "Income Tax" },
  { name: "Advance Tax", description: "Quarterly advance tax payment", frequency: "quarterly", months: [2,5,8,11], dayOfMonth: 15, category: "Income Tax" },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CATEGORY_COLORS: Record<string, string> = {
  GST: "bg-blue-100 text-blue-700 border-blue-200",
  TDS: "bg-purple-100 text-purple-700 border-purple-200",
  ROC: "bg-indigo-100 text-indigo-700 border-indigo-200",
  PF: "bg-green-100 text-green-700 border-green-200",
  ESI: "bg-teal-100 text-teal-700 border-teal-200",
  PT: "bg-amber-100 text-amber-700 border-amber-200",
  "Income Tax": "bg-red-100 text-red-700 border-red-200",
};

export function ComplianceCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const deadlines = FILING_DEADLINES.filter((d) =>
    d.months.includes(selectedMonth) &&
    (selectedCategory === "all" || d.category === selectedCategory)
  ).sort((a, b) => a.dayOfMonth - b.dayOfMonth);

  const categories = ["all", ...Object.keys(CATEGORY_COLORS)];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i}>{name}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? cat === "all"
                    ? "bg-slate-800 text-white border-slate-800"
                    : CATEGORY_COLORS[cat]
                  : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {deadlines.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No filing deadlines for this month and category.
        </div>
      ) : (
        <div className="space-y-2">
          {deadlines.map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-slate-900">{d.dayOfMonth}</span>
                <span className="text-xs text-slate-500">{MONTH_NAMES[selectedMonth].slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900">{d.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${CATEGORY_COLORS[d.category]}`}>
                    {d.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">{d.description}</p>
              </div>
              <span className="text-xs text-slate-500 capitalize">{d.frequency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
