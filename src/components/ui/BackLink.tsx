import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";

type BackLinkProps = ComponentProps<typeof Link> & {
  variant?: "light" | "dark";
};

export const BackLink = forwardRef<HTMLAnchorElement, BackLinkProps>(function BackLink(
  { variant = "dark", className = "", children, ...props },
  ref,
) {
  const textColor = variant === "light" ? "text-background" : "text-foreground";
  const lineColor = variant === "light" ? "bg-background" : "bg-foreground";

  return (
    <Link
      ref={ref}
      className={`group inline-block font-sans text-xs font-medium uppercase tracking-[0.3em] ${textColor} focus-visible:outline-none ${className}`}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className={`absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 ${lineColor} transition-transform duration-200 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100`}
      />
    </Link>
  );
});
