"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Easing } from "framer-motion";
import type { SkillCategory } from "@/lib/types";

const EASE: Easing = [0.16, 1, 0.3, 1];
const GRID_SIZE = 5;

type GridPosition = { row: number; col: number };

const SKILL_LAYOUTS: Record<string, Record<string, GridPosition>> = {
  "programming-languages": {
  
    TypeScript: { row: 0, col: 0 },
    CSS: { row: 0, col: 1 },
    Python: { row: 0, col: 3 },
    JavaScript: { row: 1, col: 0 },
    HTML: { row: 1, col: 1 },
    SQL: { row: 2, col: 2 },
    "C#": { row: 3, col: 1 },
    Go: { row: 3, col: 3 },
    "C++": { row: 4, col: 1 },
  },
  "frameworks-engines": {
  
    React: { row: 0, col: 0 },
    "Next.js": { row: 0, col: 1 },
    "Node.js": { row: 2, col: 0 },
    "Express.js": { row: 2, col: 1 },
    FastAPI: { row: 2, col: 3 },
    Gin: { row: 3, col: 4 },
    Unity: { row: 4, col: 0 },
    Godot: { row: 4, col: 1 },
  },
  "infrastructure-tools": {
  
    Docker: { row: 2, col: 2 },
    PostgreSQL: { row: 1, col: 1 },
    Supabase: { row: 1, col: 3 },
    MongoDB: { row: 3, col: 1 },
    "Cloudflare R2": { row: 3, col: 3 },
  },
  misc: {
  
    English: { row: 1, col: 1 },
    Writing: { row: 2, col: 1 },
    "Scientific Writing": { row: 2, col: 2 },
    "System Analysis": { row: 2, col: 3 },
    "Problem Solving": { row: 3, col: 3 },
  },
};

const SKILL_CONNECTIONS: Record<string, [string, string][]> = {
  "programming-languages": [
    ["TypeScript", "CSS"],
    ["TypeScript", "JavaScript"],
    ["CSS", "HTML"],
    ["JavaScript", "HTML"],
    ["HTML", "SQL"],
    ["Python", "SQL"],
    ["SQL", "C#"],
    ["SQL", "Go"],
    ["C#", "C++"],
  ],
  "frameworks-engines": [
    ["React", "Next.js"],
    ["Node.js", "Express.js"],
    ["React", "Node.js"],
    ["Express.js", "FastAPI"],
    ["FastAPI", "Gin"],
    ["Node.js", "Unity"],
    ["Unity", "Godot"],
  ],
  "infrastructure-tools": [
    ["Docker", "PostgreSQL"],
    ["Docker", "Supabase"],
    ["Docker", "MongoDB"],
    ["Docker", "Cloudflare R2"],
    ["PostgreSQL", "Supabase"],
  ],
  misc: [
    ["English", "Writing"],
    ["Writing", "Scientific Writing"],
    ["Scientific Writing", "System Analysis"],
    ["System Analysis", "Problem Solving"],
  ],
};

type GridNode = { skill: string; x: number; y: number };

function nodesFor(category: SkillCategory): GridNode[] {
  const layout = SKILL_LAYOUTS[category.id] ?? {};
  return category.skills.map((skill) => {
    const position = layout[skill];
    if (!position && process.env.NODE_ENV !== "production") {
      console.warn(`SkillsSection: no grid position defined for "${skill}" in "${category.id}"`);
    }
    return {
      skill,
      x: ((position?.col ?? 0) + 0.5) * (100 / GRID_SIZE),
      y: ((position?.row ?? 0) + 0.5) * (100 / GRID_SIZE),
    };
  });
}

function edgesFor(category: SkillCategory, nodes: GridNode[]) {
  const indexBySkill = new Map(nodes.map((node, index) => [node.skill, index]));
  const pairs = SKILL_CONNECTIONS[category.id] ?? [];
  return pairs.flatMap(([a, b]) => {
    const i = indexBySkill.get(a);
    const j = indexBySkill.get(b);
    if (i === undefined || j === undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`SkillsSection: connection references unknown skill in "${category.id}": ${a} <-> ${b}`);
      }
      return [];
    }
    return [{ a: i, b: j }];
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
  const nodes = nodesFor(category);
  const edges = edgesFor(category, nodes);
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
