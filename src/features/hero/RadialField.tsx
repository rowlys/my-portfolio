"use client";

import { motion } from "framer-motion";

const RING_RADII = [10, 18, 27, 37, 48, 60, 73, 88] as const;
const ACCENT_RING_INDEX = 3;
const FOCUS = { x: 50, y: 50 } as const;

export function RadialField() {
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
          const isAccent = index === ACCENT_RING_INDEX;
          const isOutermost = index >= RING_RADII.length - 2;
          return (
            <motion.circle
              key={radius}
              cx={FOCUS.x}
              cy={FOCUS.y}
              r={radius}
              fill="none"
              stroke={isAccent ? "var(--accent)" : "var(--foreground)"}
              strokeWidth={isAccent ? 1.75 : 1}
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={
                isAccent
                  ? { strokeOpacity: [0.16, 0.28, 0.16] }
                  : { strokeOpacity: isOutermost ? 0.05 : 0.08 }
              }
              transition={
                isAccent
                  ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
                  : undefined
              }
            />
          );
        })}
      </svg>
    </div>
  );
}
