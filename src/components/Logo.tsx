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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Shield body */}
          <path d="M32 4L8 14v18c0 14.4 10.24 27.2 24 32 13.76-4.8 24-17.6 24-32V14L32 4z" fill="#0B1120"/>
          {/* Inner shield border */}
          <path d="M32 8L12 16.5v14.5c0 12.4 8.64 23.4 20 27.5 11.36-4.1 20-15.1 20-27.5V16.5L32 8z" fill="#0F1729"/>
          {/* Gold accent line */}
          <path d="M32 12L16 19v12c0 10.8 7.2 20.4 16 24 8.8-3.6 16-13.2 16-24V19L32 12z" stroke="#C4A265" stroke-width="1.5" fill="none"/>
          {/* Mint leaf */}
          <path d="M32 22c-6 4-10 10-10 16 2-2 5-3.5 8-3.5V22z" fill="#C4A265" opacity="0.9"/>
          <path d="M32 22c6 4 10 10 10 16-2-2-5-3.5-8-3.5V22z" fill="#C4A265" opacity="0.7"/>
          {/* Leaf vein */}
          <line x1="32" y1="22" x2="32" y2="38" stroke="#0B1120" stroke-width="1" opacity="0.5"/>
          {/* Small gold dot */}
          <circle cx="32" cy="44" r="2" fill="#C4A265"/>
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground transition-colors group-hover:text-primary", textSizeClasses[size])}>
          Legal<span className="text-primary">Mint</span> AI
        </span>
      )}
    </Link>
  );
}
