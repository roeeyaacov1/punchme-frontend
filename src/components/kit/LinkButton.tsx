import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "../../lib/cn";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";
import { useReducedMotion } from "./motion";

interface Look {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  /** An icon after the label. A directional one carries `rtl:-scale-x-100`. */
  iconEnd?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ToProps = Look & Omit<LinkProps, "className" | "children"> & { href?: never };
type HrefProps = Look &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
    to?: never;
  };

/**
 * A link that looks like a button: a route inside the app (`to`), or a page
 * outside it (`href`). It goes somewhere, so it's a link to a screen reader
 * and opens in a new tab on a middle click, the way a button can't.
 */
export function LinkButton(props: ToProps | HrefProps) {
  const reduced = useReducedMotion();
  const { variant = "primary", size = "md", icon, iconEnd, className, children, ...rest } = props;
  const classes = cn(buttonClasses(variant, size, reduced), className);
  const content = (
    <>
      {icon}
      {children}
      {iconEnd}
    </>
  );
  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as Omit<HrefProps, keyof Look>;
    return (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    );
  }
  return (
    <Link className={classes} {...(rest as Omit<ToProps, keyof Look>)}>
      {content}
    </Link>
  );
}
