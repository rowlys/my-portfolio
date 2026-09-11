"use client";

import { useRef } from "react";
import type { Project } from "@/lib/types";
import { NavArrowButton } from "@/components/ui/NavArrowButton";

const SCROLL_STEP = 220;

function ProjectNavItem({
  project,
  isActive,
  onSelect,
}: {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="shrink-0">
      <button
        type="button"
        aria-pressed={isActive}
        onClick={onSelect}
        className={`group relative flex w-36 flex-col items-center justify-center border-2 px-3 py-2 text-center transition-colors duration-150 focus-visible:outline-none sm:w-44 ${
          isActive
            ? "border-accent bg-accent/10 text-accent"
            : "border-accent/40 bg-panel text-foreground/70 hover:border-accent/70 hover:text-foreground"
        }`}
      >
        <span className="line-clamp-2 font-display text-xl uppercase leading-none tracking-[-0.02em] sm:text-3xl">
          {project.title}
        </span>
      </button>
    </li>
  );
}

export function ProjectNavScroller({
  projects,
  activeSlug,
  onSelect,
}: {
  projects: Project[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  const scrollByStep = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_STEP : SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex w-full max-w-3xl shrink-0 items-center gap-2">
      <NavArrowButton
        direction="left"
        onClick={() => scrollByStep("left")}
        ariaLabel="Scroll projects left"
        size="text-4xl"
      />
      <ul ref={scrollerRef} className="scrollbar-hide flex flex-1 gap-4 overflow-x-auto px-1 pb-2">
        {projects.map((project) => (
          <ProjectNavItem
            key={project.slug}
            project={project}
            isActive={project.slug === activeSlug}
            onSelect={() => onSelect(project.slug)}
          />
        ))}
      </ul>
      <NavArrowButton
        direction="right"
        onClick={() => scrollByStep("right")}
        ariaLabel="Scroll projects right"
        size="text-4xl"
      />
    </div>
  );
}
