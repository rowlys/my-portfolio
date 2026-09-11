"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/types";
import { ProjectNavScroller } from "./_components/ProjectNavScroller";
import { ProjectDossier } from "./_components/ProjectDossier";

export function ProjectsSection({
  projects,
  renderedContent,
}: {
  projects: Project[];
  renderedContent: Record<string, ReactNode>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");
  const activeProject = projects.find((project) => project.slug === activeSlug) ?? projects[0];

  if (projects.length === 0) {
    return <p className="normal-case tracking-normal">Projects are on their way.</p>;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center gap-6">
      <ProjectNavScroller
        projects={projects}
        activeSlug={activeProject?.slug ?? ""}
        onSelect={setActiveSlug}
      />

      <div className="min-h-0 w-full flex-1 overflow-y-auto px-2 pb-8">
        <AnimatePresence initial={false} mode="wait">
          {activeProject && (
            <ProjectDossier
              key={activeProject.slug}
              project={activeProject}
              rendered={renderedContent[activeProject.slug]}
              position={projects.indexOf(activeProject) + 1}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
