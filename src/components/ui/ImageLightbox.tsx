"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Panel, LABEL_CLASS } from "./Panel";
import { ZoomableImage } from "./ZoomableImage";
import { NavArrowButton } from "./NavArrowButton";

const CROSSFADE = { duration: 0.25 };

export function ImageLightbox({
  images,
  title,
  index,
  onStep,
  onClose,
}: {
  images: string[];
  title: string;
  index: number;
  onStep: (direction: 1 | -1) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      } else if (event.key === "ArrowLeft" && hasMultiple) {
        event.stopPropagation();
        onStep(-1);
      } else if (event.key === "ArrowRight" && hasMultiple) {
        event.stopPropagation();
        onStep(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose, onStep, hasMultiple]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 overflow-y-auto overscroll-contain bg-background/95 p-2 sm:gap-3 sm:p-3"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="group absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 border border-foreground/25 bg-background px-2.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.3em] text-foreground transition-colors duration-150 hover:border-accent/60 hover:text-accent focus-visible:text-accent focus-visible:outline-none sm:right-5 sm:top-5"
      >
        <span aria-hidden>✕</span>
        Close
      </button>

      <span
        aria-hidden
        className="absolute left-3 top-3 hidden font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground/60 sm:left-5 sm:top-5 sm:block"
      >
        Scroll or pinch to zoom · drag to pan
      </span>

      <div
        className="relative flex w-full min-h-0 flex-1 items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <Panel className="relative h-full w-full overflow-hidden bg-panel">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={images[index]}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={CROSSFADE}
            >
              <ZoomableImage
                src={images[index]}
                alt={`${title} screenshot ${index + 1} of ${images.length}, enlarged`}
              />
            </motion.div>
          </AnimatePresence>
        </Panel>
      </div>

      {hasMultiple && (
        <div
          className="flex shrink-0 items-center justify-center gap-4"
          onClick={(event) => event.stopPropagation()}
        >
          <NavArrowButton direction="left" onClick={() => onStep(-1)} ariaLabel="Previous image" size="text-3xl" />
          <span className={LABEL_CLASS} aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          <NavArrowButton direction="right" onClick={() => onStep(1)} ariaLabel="Next image" size="text-3xl" />
        </div>
      )}
    </div>
  );
}
