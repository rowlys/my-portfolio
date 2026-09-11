import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { AboutSection } from "./AboutSection";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `About | ${profile.name}`,
  description: profile.tagline,
};

export default function AboutPage() {
  return (
    <SectionOverlay title="About">
      <AboutSection profile={profile} />
    </SectionOverlay>
  );
}
