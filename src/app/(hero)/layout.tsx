"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Hero } from "@/features/hero/Hero";
import { profile } from "@/content/profile";
import { markWarm } from "@/features/transitions/coldLoad";

export default function HeroLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    markWarm();
  }, []);

  return (
    <>
      <Hero profile={profile} />
      {children}
    </>
  );
}
