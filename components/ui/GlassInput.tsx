"use client";
import React from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="relative group w-full">
      {label && (
        <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl px-4 py-3.5 text-sm text-white/90",
            "bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] outline-none",
            "transition-all duration-300 focus:bg-white/[0.05] focus:border-white/20",
            "focus:ring-2 focus:ring-white/10 focus:ring-offset-0 placeholder:text-white/20",
            icon && "pl-12",
            error && "border-red-500/50 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  ),
);
GlassInput.displayName = "GlassInput";
