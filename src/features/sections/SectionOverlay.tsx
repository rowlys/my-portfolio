"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { BackLink } from "@/components/ui/BackLink";
import { COLD_LOAD_RIPPLE_DELAY, EXIT_RIPPLE_DURATION, RIPPLE_DELAY, RIPPLE_DURATION } from "../hero/menuTiming";
import { isColdLoad } from "../hero/coldLoad";
import { beginSectionExit, resetSectionExit } from "../hero/sectionExit";

const RIPPLE_ORIGIN = { xPct: 0, yPct: 100 } as const;
const RIPPLE_EASE = [0.16, 1, 0.3, 1] as const;
const RING_OFFSET_FRACTIONS = [0, 0.035, 0.075, 0.12, 0.175, 0.24] as const;
const RING_OPACITIES = [1, 0.8, 0.6, 0.45, 0.3, 0.15] as const;
const RING_WIDTHS = [18, 15, 12, 9, 6, 4] as const;

export function SectionOverlay({ title, children }: { title: string; children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const backRef = useRef<HTMLAnchorElement>(null);

  const [rippleDelay] = useState(() => (isColdLoad ? COLD_LOAD_RIPPLE_DELAY : RIPPLE_DELAY));

  useEffect(() => {
    resetSectionExit();
  }, []);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const diagonal = Math.hypot(viewport.width, viewport.height);
  const originX = (RIPPLE_ORIGIN.xPct / 100) * viewport.width;
  const originY = (RIPPLE_ORIGIN.yPct / 100) * viewport.height;

  const radiusPx = useMotionValue(0);
  const openControlsRef = useRef<AnimationPlaybackControls | null>(null);
  useEffect(() => {
    if (diagonal === 0) {
      radiusPx.set(0);
      return;
    }
    if (prefersReducedMotion) {
      radiusPx.set(diagonal);
      return;
    }
    const controls = animate(radiusPx, diagonal, {
      delay: rippleDelay,
      duration: RIPPLE_DURATION,
      ease: RIPPLE_EASE,
    });
    openControlsRef.current = controls;
    return () => controls.stop();
  }, [diagonal, prefersReducedMotion, radiusPx, rippleDelay]);

  const clipPath = useTransform(radiusPx, (r) => `circle(${Math.max(0, r)}px at 0% 100%)`);
  const ringGroupOpacity = useTransform(
    radiusPx,
    diagonal > 0 ? [diagonal * 0.85, diagonal] : [0, 1],
    [1, 0],
  );

  useEffect(() => {
    const delay = prefersReducedMotion ? 0 : (rippleDelay + RIPPLE_DURATION) * 1000;
    const timer = window.setTimeout(() => backRef.current?.focus(), delay);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, rippleDelay]);

  const isClosingRef = useRef(false);
  const closeAndReturn = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    beginSectionExit();
    openControlsRef.current?.stop();
    if (prefersReducedMotion) {
      radiusPx.set(0);
      router.push("/");
      return;
    }
    animate(radiusPx, 0, {
      duration: EXIT_RIPPLE_DURATION,
      ease: RIPPLE_EASE,
      onComplete: () => router.push("/"),
    });
  }, [prefersReducedMotion, radiusPx, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndReturn();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAndReturn]);

  const handleBackLinkNavigate = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    closeAndReturn();
  };

  return (
    <motion.div
      id="section-panel"
      role="region"
      aria-label={title || undefined}
      className="fixed inset-0 z-30 overflow-hidden"
      initial={false}
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto bg-accent"
        style={prefersReducedMotion ? undefined : { clipPath }}
      >
        <BackLink
          ref={backRef}
          href="/"
          variant="light"
          className="absolute left-5 top-5 sm:left-8 sm:top-8"
          onNavigate={handleBackLinkNavigate}
        >
          ← Menu
        </BackLink>

        <div className="flex flex-col items-center">
          <h2 className="px-6 text-center font-display text-[clamp(3rem,14vw,10rem)] uppercase leading-[0.85] tracking-[-0.025em] text-background">
            {title}
          </h2>
          <div className="mt-6 w-full max-w-2xl px-6 text-center font-sans text-sm uppercase tracking-[0.2em] text-background">
            {children}
          </div>
        </div>
      </motion.div>

      {!prefersReducedMotion && diagonal > 0 && (
        <motion.svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: ringGroupOpacity }}
        >
          {RING_OFFSET_FRACTIONS.map((fraction, index) => (
            <RippleRing
              key={fraction}
              cx={originX}
              cy={originY}
              radiusPx={radiusPx}
              offsetPx={diagonal * fraction}
              strokeOpacity={RING_OPACITIES[index]}
              strokeWidth={RING_WIDTHS[index]}
            />
          ))}
        </motion.svg>
      )}
    </motion.div>
  );
}

function RippleRing({
  cx,
  cy,
  radiusPx,
  offsetPx,
  strokeOpacity,
  strokeWidth,
}: {
  cx: number;
  cy: number;
  radiusPx: MotionValue<number>;
  offsetPx: number;
  strokeOpacity: number;
  strokeWidth: number;
}) {
  const r = useTransform(radiusPx, (value) => Math.max(0, value - offsetPx));
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="var(--foreground)"
      strokeOpacity={strokeOpacity}
      strokeWidth={strokeWidth}
    />
  );
}
