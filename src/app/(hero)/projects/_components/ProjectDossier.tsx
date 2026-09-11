"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { LABEL_CLASS, DIVIDER_CLASS } from "@/components/ui/Panel";
import { GalleryStage } from "@/components/ui/GalleryStage";

const CROSSFADE = { duration: 0.25 };

export function ProjectDossier({
  project,
  rendered,
  position,
  prefersReducedMotion,
}: {
  project: Project;
  rendered: ReactNode;
  position: number;
  prefersReducedMotion: boolean | null;
}) {
  const hasImages = project.images.length > 0;

  return (
    <motion.div
      className={`mx-auto grid w-full max-w-5xl gap-8 sm:gap-10 ${
        hasImages ? "md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start" : ""
      }`}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : CROSSFADE}
    >
      {hasImages && <GalleryStage images={project.images} title={project.title} />}

      <div
        className={`flex flex-col gap-6 text-left ${
          hasImages ? "" : "mx-auto w-full max-w-[65ch] items-center text-center sm:items-start sm:text-left"
        }`}
      >
        <div className={hasImages ? "max-w-[65ch]" : ""}>
          <p className={`${LABEL_CLASS} text-accent`}>
            {String(position).padStart(2, "0")}
            {" // "}
            {project.tags.join(" · ")}
          </p>
          <h3 className="mt-1 font-display text-3xl uppercase leading-none tracking-[-0.02em] sm:text-5xl">
            {project.title}
          </h3>
          <p className="mt-3 text-sm normal-case leading-relaxed tracking-normal text-foreground/80 sm:text-base">
            {project.summary}
          </p>
        </div>

        <div className={hasImages ? `${DIVIDER_CLASS} max-w-[65ch]` : DIVIDER_CLASS} />

        <div className="mdx-dossier max-w-[65ch]">{rendered}</div>

        {project.links && project.links.length > 0 && (
          <ul className="flex max-w-[65ch] flex-wrap gap-2 pt-2">
            {project.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors duration-150 hover:border-accent hover:bg-accent/20 hover:text-accent focus-visible:border-accent focus-visible:bg-accent/20 focus-visible:text-accent focus-visible:outline-none"
                >
                  {link.label}
                  <span aria-hidden className="text-accent">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
