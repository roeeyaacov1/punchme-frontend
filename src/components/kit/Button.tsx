import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";
import { useReducedMotion } from "./motion";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Working on it: the button keeps its width and its focus, and ignores presses. */
  busy?: boolean;
  /** An icon before the label, or the whole content of an icon button. */
  icon?: ReactNode;
  /** An icon after the label. A directional one carries `rtl:-scale-x-100`. */
  iconEnd?: ReactNode;
}

/**
 * The kit's button. `primary` is coral and there should be one on a screen;
 * `ink` is the action on a gold surface; `quiet` is a text button.
 *
 * `busy` doesn't disable the button, because disabling it would throw the
 * keyboard's focus back to the top of the page. It marks it `aria-busy`,
 * swaps the icon for a spinner and swallows presses until the work is done.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    busy = false,
    icon,
    iconEnd,
    type = "button",
    className,
    children,
    onClick,
    ...props
  },
  ref,
) {
  const reduced = useReducedMotion();
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      ref={ref}
      type={type}
      aria-busy={busy || undefined}
      onClick={handleClick}
      className={cn(buttonClasses(variant, size, reduced), className)}
      {...props}
    >
      {busy ? (
        <LoaderCircle aria-hidden className={reduced ? undefined : "animate-spin"} />
      ) : (
        icon
      )}
      {children}
      {iconEnd}
    </button>
  );
});
