"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-teal-500",
  ];

  const colorIndex = name
    ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const bgColor = colors[colorIndex % colors.length];

  if (src && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white",
        bgColor,
        sizeClasses[size],
        className
      )}
      role="img"
      aria-label={alt || name}
    >
      {initials}
    </div>
  );
}

export { Avatar };
