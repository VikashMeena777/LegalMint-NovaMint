import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  color?: "default" | "success" | "warning" | "destructive";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color = "default", showLabel = false, size = "md", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colorClasses = {
      default: "bg-primary",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      destructive: "bg-red-500",
    };

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {Math.round(value)}%
            </span>
          </div>
        )}
        <div className={cn("w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700", sizeClasses[size])}>
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClasses[color])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
