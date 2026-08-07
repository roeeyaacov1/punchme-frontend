import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-[0_1px_2px_rgba(14,17,32,0.06),0_8px_24px_rgba(14,17,32,0.08)] p-6 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(14,17,32,0.08),0_16px_36px_rgba(14,17,32,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
