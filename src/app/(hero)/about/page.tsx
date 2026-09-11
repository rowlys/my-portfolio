import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { AboutSection } from "./AboutSection";
import { profile } from "@/content/profile";
import { sectionMetadata } from "@/lib/seo";

export const metadata: Metadata = sectionMetadata(
  "About",
  `Background, education, and contact links for ${profile.name}.`,
  "/about",
);

export default function AboutPage() {
  return (
    <SectionOverlay title="About">
      <AboutSection profile={profile} />
    </SectionOverlay>
  );
}
