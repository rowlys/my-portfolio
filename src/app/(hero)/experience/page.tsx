import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { ExperienceSection } from "./ExperienceSection";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { sectionMetadata } from "@/lib/seo";

export const metadata: Metadata = sectionMetadata(
  "Experience",
  `Work and research experience of ${profile.name}.`,
  "/experience",
);

export default function ExperiencePage() {
  return (
    <SectionOverlay title="Experience" fillViewport>
      <ExperienceSection experience={experience} />
    </SectionOverlay>
  );
}
