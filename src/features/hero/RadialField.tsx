"use client";

import { motion, useReducedMotion } from "framer-motion";

const RING_RADII = [10, 18, 27, 37, 48, 60, 73, 88] as const;
const ACCENT_RING_INDEX = 3;
const ACCENT_PULSE_OPACITY: number[] = [0.16, 0.28, 0.16];
const ACCENT_STATIC_OPACITY = 0.22;
const FOCUS = { x: 50, y: 50 } as const;

export function RadialField() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 120% at ${FOCUS.x}% ${FOCUS.y}%, var(--background) 45%, var(--background-deep) 100%)`,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {RING_RADII.map((radius, index) => {
          if (index === ACCENT_RING_INDEX) {
            return (
              <motion.circle
                key={radius}
                cx={FOCUS.x}
                cy={FOCUS.y}
                r={radius}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={1.75}
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{
                  strokeOpacity: prefersReducedMotion ? ACCENT_STATIC_OPACITY : ACCENT_PULSE_OPACITY,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 7, repeat: Infinity, ease: "easeInOut" }
                }
              />
            );
          }

          const isOutermost = index >= RING_RADII.length - 2;
          return (
            <circle
              key={radius}
              cx={FOCUS.x}
              cy={FOCUS.y}
              r={radius}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={1}
              strokeOpacity={isOutermost ? 0.05 : 0.08}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    </div>
  );
}
