"use client";
import React, { useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255,255,255,0.06)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const div = ref.current;
    if (!div) return;
    const rect = div.getBoundingClientRect();
    div.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    div.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    div.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-hx-zinc border border-hx-border",
        "transition-all duration-300 hover:border-white/15 hover:shadow-card",
        "before:absolute before:inset-0 before:rounded-[inherit]",
        "before:bg-[radial-gradient(600px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),var(--spotlight-color),transparent_40%)]",
        "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
