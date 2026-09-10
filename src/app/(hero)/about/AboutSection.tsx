"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";
import type { Profile } from "@/lib/types";

const GPA_SCALE = 4.0;
const BAR_EASE: Easing = [0.16, 1, 0.3, 1];
const BAR_DELAY = 0.5;
const BAR_DURATION = 5;

const LABEL_CLASS = "font-mono text-[0.65rem] uppercase tracking-[0.25em] text-foreground sm:text-xs";
const DIVIDER_CLASS = "h-px w-full max-w-sm bg-foreground/20";

function CornerTicks() {
  return (
    <>
      <span aria-hidden className="absolute -left-px -top-px h-3 w-3 border-l border-t border-foreground" />
      <span aria-hidden className="absolute -right-px -top-px h-3 w-3 border-r border-t border-foreground" />
      <span aria-hidden className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-foreground" />
      <span aria-hidden className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-foreground" />
    </>
  );
}

function NameBanner({ profile }: { profile: Profile }) {
  return (
    <div className="relative border border-foreground/25 px-6 py-4 sm:px-10 sm:py-5">
      <CornerTicks />
      <p className="font-display text-3xl uppercase leading-none tracking-[-0.02em] sm:text-4xl">
        {profile.name}
      </p>
      <p className={`mt-2 ${LABEL_CLASS}`}>
        {profile.education.program} · {profile.education.school}
      </p>
    </div>
  );
}

function ClassLine({ tagline }: { tagline: string }) {
  const classLine = tagline
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" / ");

  return <p className={LABEL_CLASS}>CLASS // {classLine}</p>;
}

function GpaMeter({ gpa }: { gpa: number }) {
  const prefersReducedMotion = useReducedMotion();
  const fraction = Math.min(gpa / GPA_SCALE, 1);
  const fillPercent = `${(fraction * 100).toFixed(1)}%`;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className={`flex items-baseline justify-between ${LABEL_CLASS}`}>
        <span>GPA</span>
        <span>
          {gpa.toFixed(2)} / {GPA_SCALE.toFixed(2)}
        </span>
      </div>
      <div className="h-2 w-full bg-background-deep">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: prefersReducedMotion ? fillPercent : "0%" }}
          animate={{ width: fillPercent }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: BAR_DURATION, delay: BAR_DELAY, ease: BAR_EASE }
          }
        />
      </div>
    </div>
  );
}

function LinkSlots({ links }: { links: Profile["links"] }) {
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap justify-center gap-x-6 gap-y-2 ${LABEL_CLASS}`}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-1.5 py-1 text-foreground transition-colors duration-150 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
          >
            <span aria-hidden className="text-accent">
              ▸
            </span>
            {link.label}
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-200 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function AboutSection({ profile }: { profile: Profile }) {
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <NameBanner profile={profile} />
      <ClassLine tagline={profile.tagline} />

      <div className={DIVIDER_CLASS} />
      <GpaMeter gpa={profile.education.gpa} />
      <div className={DIVIDER_CLASS} />

      <p className="max-w-md text-center font-sans text-sm normal-case leading-relaxed tracking-normal text-foreground sm:text-base">
        {profile.about}
      </p>

      {profile.links.length > 0 && (
        <>
          <div className={DIVIDER_CLASS} />
          <LinkSlots links={profile.links} />
        </>
      )}
    </div>
  );
}
