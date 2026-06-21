import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "wordmark-dark" | "wordmark-light";
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
};

const wordmarkWidths = {
  sm: 110,
  md: 140,
  lg: 190,
};

const wordmarkHeights = {
  sm: 28,
  md: 36,
  lg: 48,
};

const textSizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({
  className,
  showText = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  if (variant === "wordmark-dark") {
    return (
      <Link href="/" className={cn("inline-block", className)}>
        <Image
          src="/wordmark-dark.png"
          alt="LegalMint AI Logo"
          width={wordmarkWidths[size]}
          height={wordmarkHeights[size]}
          className="object-contain"
          priority
        />
      </Link>
    );
  }

  if (variant === "wordmark-light") {
    return (
      <Link href="/" className={cn("inline-block", className)}>
        <Image
          src="/wordmark-light.png"
          alt="LegalMint AI Logo"
          width={wordmarkWidths[size]}
          height={wordmarkHeights[size]}
          className="object-contain"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 group-hover:scale-105",
          sizeClasses[size]
        )}
      >
        <Image
          src="/favicon.svg"
          alt="LegalMint AI Icon"
          width={size === "sm" ? 28 : size === "md" ? 36 : 48}
          height={size === "sm" ? 28 : size === "md" ? 36 : 48}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground transition-colors group-hover:text-primary", textSizeClasses[size])}>
          Legal<span className="text-primary">Mint</span> AI
        </span>
      )}
    </Link>
  );
}
