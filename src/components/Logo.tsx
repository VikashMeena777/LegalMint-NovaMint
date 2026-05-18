import Link from "next/link";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
};

const textSizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div
        className={cn(
          "gradient-primary rounded-lg flex items-center justify-center transition-colors",
          sizeClasses[size]
        )}
      >
        <Scale className="w-1/2 h-1/2 text-white" />
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground", textSizeClasses[size])}>
          Legal<span className="text-primary">Mint</span> AI
        </span>
      )}
    </Link>
  );
}
