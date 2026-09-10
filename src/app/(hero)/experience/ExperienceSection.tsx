"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import type { ExperienceEntry } from "@/lib/types";
import { Panel, LABEL_CLASS } from "@/components/ui/Panel";
import { CornerTicks } from "@/components/ui/CornerTicks";

const EASE: Easing = [0.16, 1, 0.3, 1];
const PATH_DRAW_DURATION = 1.6;
const CARD_STAGGER = 0.12;
const BOLT_SEGMENTS = 4;
const BOLT_JITTER_RATIO = 0.34;
const BOLT_JITTER_MAX = 110;
const BOLT_MIN_MAGNITUDE = 0.55;

type Point = { x: number; y: number };

function useAnchorPoints(count: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const next: Point[] = [];
      for (const node of nodeRefs.current) {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        next.push({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        });
      }
      setPoints(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    nodeRefs.current.forEach((node) => node && observer.observe(node));
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [count]);

  return { containerRef, nodeRefs, points };
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boltPath(points: Point[]): string {
  if (points.length < 2) return "";
  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const rng = mulberry32(i * 7919 + 13);
    const maxOffset = Math.min(BOLT_JITTER_MAX, length * BOLT_JITTER_RATIO);

    for (let s = 1; s <= BOLT_SEGMENTS; s++) {
      const t = s / (BOLT_SEGMENTS + 1);
      const taper = Math.sin(t * Math.PI);
      const side = s % 2 === 0 ? 1 : -1;
      const magnitude = BOLT_MIN_MAGNITUDE + rng() * (1 - BOLT_MIN_MAGNITUDE);
      const offset = side * magnitude * maxOffset * taper;
      const x = from.x + dx * t + nx * offset;
      const y = from.y + dy * t + ny * offset;
      commands.push(`L ${x} ${y}`);
    }
    commands.push(`L ${to.x} ${to.y}`);
  }

  return commands.join(" ");
}

function ExperienceCard({
  entry,
  index,
  nodeRef,
  prefersReducedMotion,
}: {
  entry: ExperienceEntry;
  index: number;
  nodeRef: (el: HTMLDivElement | null) => void;
  prefersReducedMotion: boolean | null;
}) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      ref={nodeRef}
      className={`relative z-10 flex w-[76%] sm:w-[46%] lg:w-[38%] ${
        isLeft ? "self-start justify-start" : "self-end justify-end"
      }`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: index * CARD_STAGGER, ease: EASE }
      }
    >
      <Panel className={`w-full bg-panel px-5 py-4 sm:px-6 sm:py-5 ${isLeft ? "text-left" : "text-right"}`}>
        <p className={LABEL_CLASS}>
          {entry.start} — {entry.end ?? "Present"}
        </p>
        <h3 className="mt-1 font-display text-xl uppercase leading-none tracking-[-0.02em] text-foreground sm:text-2xl">
          {entry.role}
        </h3>
        <p className={`mt-1 ${LABEL_CLASS} text-accent`}>{entry.organization}</p>
        <p className="mt-3 text-sm normal-case leading-relaxed tracking-normal text-foreground/80 sm:text-base">
          {entry.summary}
        </p>
        {entry.highlights && entry.highlights.length > 0 && (
          <ul
            className={`mt-3 flex flex-col gap-1.5 text-sm normal-case tracking-normal text-foreground/80 ${
              isLeft ? "items-start" : "items-end"
            }`}
          >
            {entry.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-1.5">
                <span aria-hidden className="text-accent">
                  ▸
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </motion.div>
  );
}

export function ExperienceSection({ experience }: { experience: ExperienceEntry[] }) {
  const prefersReducedMotion = useReducedMotion();
  const { containerRef, nodeRefs, points } = useAnchorPoints(experience.length);
  const pathReady = points.length === experience.length && experience.length > 1;
  const pathD = pathReady ? boltPath(points) : undefined;
  const pathTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: PATH_DRAW_DURATION, ease: EASE };

  return (
    <div className="relative mx-auto w-full max-w-7xl flex-1 min-h-0 border border-foreground/25">
      <CornerTicks />
      <div className="h-full w-full overflow-y-auto overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8">
        <div
          ref={containerRef}
          className="relative mx-auto flex w-full max-w-4xl flex-col gap-16 py-4 sm:gap-20 sm:py-6"
        >
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            {pathD && (
              <>
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={56}
                  strokeOpacity={0.12}
                  strokeLinecap="round"
                  initial={prefersReducedMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={pathTransition}
                />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={32}
                  strokeOpacity={0.32}
                  strokeLinecap="round"
                  initial={prefersReducedMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={pathTransition}
                />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={15}
                  strokeLinecap="round"
                  initial={prefersReducedMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={pathTransition}
                />
              </>
            )}
            {pathReady &&
              points.map((point, index) => (
                <motion.circle
                  key={experience[index].id}
                  cx={point.x}
                  cy={point.y}
                  r={10}
                  fill="var(--panel)"
                  stroke="var(--accent)"
                  strokeWidth={4}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.3, delay: index * CARD_STAGGER, ease: EASE }
                  }
                />
              ))}
          </svg>

          {experience.map((entry, index) => (
            <ExperienceCard
              key={entry.id}
              entry={entry}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
              nodeRef={(el) => {
                nodeRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
