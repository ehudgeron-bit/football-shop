"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#333333] text-white border border-[#333333] hover:bg-[#4F4F4F] hover:border-[#4F4F4F] disabled:bg-surface-tertiary disabled:border-surface-tertiary disabled:text-text-muted",
  secondary:
    "bg-white text-[#333333] border border-[#333333] hover:bg-surface-secondary disabled:border-surface-tertiary disabled:text-text-muted",
  ghost:
    "bg-transparent text-[#333333] border border-transparent hover:bg-surface-secondary disabled:text-text-muted",
  danger:
    "bg-[#cf2e2e] text-white border border-[#cf2e2e] hover:bg-red-700 disabled:bg-surface-tertiary disabled:text-text-muted",
  accent:
    "bg-[#E69900] text-white border border-[#E69900] hover:bg-[#cc8800] disabled:bg-surface-tertiary disabled:text-text-muted",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{ borderRadius: "var(--rounded-corners-radius)" }}
        className={[
          "inline-flex items-center justify-center gap-2 font-semibold",
          "transition-colors duration-150",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
