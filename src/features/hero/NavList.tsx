"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { NAV_ITEMS, type Section } from "@/lib/navigation";
import { ZOOM_NAV_EXIT_DURATION } from "../transitions/menuTiming";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EXIT_TRANSITION = { duration: ZOOM_NAV_EXIT_DURATION, ease: [0.32, 0, 0.2, 1] as Easing };

function NavLink({
  label,
  section,
  index,
}: {
  label: string;
  section: Section;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE_OUT_EXPO }}
    >
      <Link
        href={`/${section}`}
        aria-controls="section-panel"
        className="group relative inline-block origin-center py-1 text-center font-display leading-[0.85] text-[clamp(2.75rem,7vw,6rem)] uppercase tracking-[-0.025em] text-foreground transition-[color,transform] duration-200 hover:text-accent focus-visible:text-accent focus-visible:outline-none md:origin-right md:text-right"
      >
        <motion.span
          className="relative z-10 inline-block origin-center md:origin-right"
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
        >
          {label}
        </motion.span>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-1 h-[0.14em] origin-center scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 md:origin-right"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-3 -inset-y-1 rounded-sm opacity-0 ring-2 ring-accent transition-opacity duration-150 group-focus-visible:opacity-100"
        />
      </Link>
    </motion.li>
  );
}

export function NavList({ isActive }: { isActive: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.ul
      aria-hidden={isActive}
      inert={isActive || undefined}
      className={`flex origin-center flex-col items-center gap-y-4 sm:gap-y-6 md:origin-right md:items-end md:gap-y-8 ${isActive ? "pointer-events-none" : ""}`}
      animate={{
        x: prefersReducedMotion || !isActive ? "0vw" : "14vw",
        scale: prefersReducedMotion || !isActive ? 1 : 0.94,
        opacity: prefersReducedMotion || !isActive ? 1 : 0,
      }}
      transition={prefersReducedMotion || !isActive ? { duration: 0 } : EXIT_TRANSITION}
    >
      {NAV_ITEMS.map((item, index) => (
        <NavLink
          key={item.section}
          index={index}
          section={item.section}
          label={item.label}
        />
      ))}
    </motion.ul>
  );
}
