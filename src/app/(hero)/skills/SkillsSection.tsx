"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Easing } from "framer-motion";
import type { SkillCategory } from "@/lib/types";

const EASE: Easing = [0.16, 1, 0.3, 1];
const GRID_SIZE = 5;
const NEIGHBORS_PER_NODE = 2;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
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

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type GridNode = { skill: string; x: number; y: number };

function gridNodesFor(category: SkillCategory): GridNode[] {
  const cellCount = GRID_SIZE * GRID_SIZE;
  const cells = seededShuffle(
    Array.from({ length: cellCount }, (_, i) => i),
    hashString(category.id),
  );

  return category.skills.map((skill, index) => {
    const cell = cells[index % cellCount];
    const row = Math.floor(cell / GRID_SIZE);
    const col = cell % GRID_SIZE;
    return {
      skill,
      x: ((col + 0.5) / GRID_SIZE) * 100,
      y: ((row + 0.5) / GRID_SIZE) * 100,
    };
  });
}

function nearestNeighborEdges(nodes: GridNode[]) {
  const edges = new Set<string>();
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({ j, d: i === j ? Infinity : Math.hypot(other.x - node.x, other.y - node.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, NEIGHBORS_PER_NODE);
    nearest.forEach(({ j }) => edges.add(i < j ? `${i}:${j}` : `${j}:${i}`));
  });
  return Array.from(edges, (key) => {
    const [a, b] = key.split(":").map(Number);
    return { a, b };
  });
}

function useSquareSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize(Math.max(0, Math.min(rect.width, rect.height)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: SkillCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="group" aria-label="Skill categories" className="flex flex-wrap justify-center gap-2 px-4 sm:gap-3">
      {categories.map((category) => {
        const isActive = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(category.id)}
            className={`border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] transition-colors duration-150 focus-visible:outline-none sm:px-4 sm:py-2 sm:text-[0.65rem] ${
              isActive
                ? "border-accent bg-accent/10 text-accent"
                : "border-foreground/25 text-foreground/70 hover:border-foreground/50 hover:text-foreground focus-visible:border-foreground/60 focus-visible:text-foreground"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

function SkillNode({
  skill,
  iconMarkup,
  size,
  isActive,
  onToggle,
}: {
  skill: string;
  iconMarkup?: string;
  size: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onToggle}
      className="group relative flex flex-col items-center focus:outline-none"
      aria-label={iconMarkup ? skill : undefined}
      aria-pressed={iconMarkup ? isActive : undefined}
    >
      <motion.div
        className={`relative flex origin-bottom items-center justify-center border bg-panel transition-[border-color] duration-150 ${
          iconMarkup ? "" : "px-1"
        } ${
          isActive
            ? "border-accent"
            : "border-foreground/25 group-hover:border-accent group-focus-visible:border-accent"
        }`}
        style={{ width: size, height: size }}
        animate={{ scale: isActive ? 1.25 : 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: EASE }}
      >
        {iconMarkup ? (
          <div
            aria-hidden
            className={`h-full w-full p-2 transition-colors duration-150 [&>svg]:h-full [&>svg]:w-full ${
              isActive ? "text-accent" : "text-foreground group-hover:text-accent group-focus-visible:text-accent"
            }`}
            dangerouslySetInnerHTML={{ __html: iconMarkup }}
          />
        ) : (
          <span className="break-words text-center font-mono text-[0.4rem] uppercase leading-[1.2] tracking-[0.03em] text-foreground sm:text-[0.48rem]">
            {skill}
          </span>
        )}
      </motion.div>
      {iconMarkup && (
        <motion.span
          className="pointer-events-none absolute top-full z-10 mt-1.5 whitespace-nowrap border border-foreground/20 bg-panel px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-foreground sm:text-[0.6rem]"
          initial={false}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -4 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: EASE }}
        >
          {skill}
        </motion.span>
      )}
    </button>
  );
}

function SkillMap({
  category,
  skillIcons,
  squareSize,
  prefersReducedMotion,
}: {
  category: SkillCategory;
  skillIcons: Record<string, string>;
  squareSize: number;
  prefersReducedMotion: boolean | null;
}) {
  const nodes = gridNodesFor(category);
  const edges = nearestNeighborEdges(nodes);
  const cell = squareSize / GRID_SIZE;
  const tileSize = Math.max(30, Math.min(68, cell * 0.72));
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  return (
    <motion.div
      className="absolute inset-0"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {edges.map(({ a, b }, index) => (
          <motion.line
            key={`${a}:${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            vectorEffect="non-scaling-stroke"
            stroke="var(--accent)"
            strokeWidth={1.5}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.04, ease: EASE }
            }
          />
        ))}
      </svg>

      {nodes.map(({ skill, x, y }, index) => (
        <motion.div
          key={skill}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${x}%`, top: `${y}%`, zIndex: activeSkill === skill ? 50 : undefined }}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 + index * 0.04, ease: EASE }
          }
        >
          <SkillNode
            skill={skill}
            iconMarkup={skillIcons[skill]}
            size={tileSize}
            isActive={activeSkill === skill}
            onToggle={() => setActiveSkill((current) => (current === skill ? null : skill))}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function SkillsSection({
  skillCategories,
  skillIcons,
}: {
  skillCategories: SkillCategory[];
  skillIcons: Record<string, string>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(skillCategories[0]?.id ?? "");
  const activeCategory = skillCategories.find((category) => category.id === activeId) ?? skillCategories[0];
  const { ref: stageRef, size: squareSize } = useSquareSize();

  if (!activeCategory) return null;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center gap-4 sm:gap-6">
      <CategoryTabs categories={skillCategories} activeId={activeCategory.id} onSelect={setActiveId} />
      <div className="min-h-0 w-full flex-1 px-3 pb-8 pt-2 sm:px-4">
        <div ref={stageRef} className="flex h-full w-full items-center justify-center">
          <div className="relative" style={{ width: squareSize, height: squareSize }}>
            <AnimatePresence initial={false}>
              {squareSize > 0 && (
                <SkillMap
                  key={activeCategory.id}
                  category={activeCategory}
                  skillIcons={skillIcons}
                  squareSize={squareSize}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
