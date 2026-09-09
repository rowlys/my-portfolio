"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { RadialField } from "./RadialField";
import { NavList } from "./NavList";
import { GlassesCanvas } from "./glasses/GlassesCanvas";
import { FALL_DURATION, RIPPLE_DELAY, RIPPLE_DURATION, ZOOM_NAV_EXIT_DURATION } from "../transitions/menuTiming";
import { useSectionExiting } from "../transitions/sectionExit";
import { NAV_ITEMS } from "@/lib/navigation";
import type { Profile } from "@/lib/types";

const FALL_Y_KEYFRAMES = ["-120%", "0%"];
const FALL_EASE: Easing = "easeOut";

const STAGE_CLASSES = "pointer-events-none absolute inset-0 z-20 h-full w-full";

function isSectionRoute(pathname: string): boolean {
  const segment = pathname.replace(/^\//, "");
  return NAV_ITEMS.some((item) => item.section === segment);
}

export function Hero({ profile }: { profile: Profile }) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  const isActive = isSectionRoute(pathname);
  const isExiting = useSectionExiting();
  const stageVisible = !isActive || isExiting;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <RadialField />

      <motion.p
        aria-hidden={isActive}
        inert={isActive || undefined}
        className={`absolute left-5 top-5 z-40 font-sans text-xs font-medium uppercase tracking-[0.3em] text-foreground sm:left-8 sm:top-8 ${
          isActive ? "pointer-events-none" : ""
        }`}
        animate={{ opacity: prefersReducedMotion || !isActive ? 1 : 0 }}
        transition={
          prefersReducedMotion || !isActive ? { duration: 0 } : { duration: ZOOM_NAV_EXIT_DURATION }
        }
      >
        { profile.name }
      </motion.p>

      <div className="relative grid flex-1 grid-cols-1 items-center justify-items-center gap-y-10 px-6 py-20 sm:px-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:justify-items-stretch md:gap-x-[6vw] md:pr-[10vw]">
        <nav aria-label="Main menu" className="w-full max-w-xl md:col-start-2">
          <NavList isActive={isActive} />
        </nav>
      </div>

      <motion.div
        aria-hidden
        className={STAGE_CLASSES}
        animate={{ opacity: prefersReducedMotion || stageVisible ? 1 : 0 }}
        transition={
          prefersReducedMotion || stageVisible
            ? { duration: 0 }
            : { delay: RIPPLE_DELAY + RIPPLE_DURATION, duration: 0 }
        }
      >
        <motion.div
          className="h-full w-full"
          initial={{ y: prefersReducedMotion ? "0%" : FALL_Y_KEYFRAMES[0] }}
          animate={{ y: prefersReducedMotion ? "0%" : FALL_Y_KEYFRAMES }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: FALL_DURATION,
                  ease: FALL_EASE,
                }
          }
        >
          <GlassesCanvas active={isActive} />
        </motion.div>
      </motion.div>
    </main>
  );
}
