"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Panel, LABEL_CLASS } from "./Panel";
import { NavArrowButton } from "./NavArrowButton";
import { ImageLightbox } from "./ImageLightbox";

const CROSSFADE = { duration: 0.25 };

export function GalleryStage({ images, title }: { images: string[]; title: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = images.length > 1;

  const step = (direction: 1 | -1) => setIndex((current) => (current + direction + images.length) % images.length);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`View ${title} screenshots enlarged`}
        className="group relative block w-full focus-visible:outline-none"
      >
        <Panel className="relative h-[440px] w-full overflow-hidden bg-panel transition-colors duration-150 group-hover:border-accent/60 group-focus-visible:border-accent sm:h-[560px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={images[index]}
              className="absolute inset-0"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : CROSSFADE}
            >
              <Image
                src={images[index]}
                alt={`${title} screenshot ${index + 1} of ${images.length}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                style={{ objectFit: "contain" }}
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-3 border border-foreground/20 bg-panel px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
          >
            Enlarge
          </span>
        </Panel>
      </button>

      {hasMultiple && (
        <div className="flex items-center justify-center gap-4">
          <NavArrowButton direction="left" onClick={() => step(-1)} ariaLabel="Previous image" />
          <span className={LABEL_CLASS} aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          <NavArrowButton direction="right" onClick={() => step(1)} ariaLabel="Next image" />
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          title={title}
          index={index}
          onStep={step}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
