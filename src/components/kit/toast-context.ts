import { createContext, useContext } from "react";

export type ToastTone = "neutral" | "ok" | "danger";

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

export interface ToastApi {
  show: (toast: ToastInput) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Confirms what the owner just did. Needs a <ToastProvider> above it. */
export function useToast(): ToastApi {
  const toasts = useContext(ToastContext);
  if (!toasts) throw new Error("useToast needs a <ToastProvider> above it.");
  return toasts;
}
