import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy/90 shadow-[0_0_0_0_rgba(240,180,41,0.35)] hover:shadow-[0_0_0_6px_rgba(240,180,41,0.2)]",
  secondary:
    "border border-navy text-navy hover:bg-navy hover:text-white bg-transparent",
  ghost: "text-navy hover:bg-navy/5 bg-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-5 py-2.5",
  lg: "text-lg px-7 py-3.5",
};

/** Shared class builder so non-<button> elements (e.g. router <Link>) can look identical to a Button. */
export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-body font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props} />
  );
}
