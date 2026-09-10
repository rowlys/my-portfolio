import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { ExperienceSection } from "./ExperienceSection";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Experience — ${profile.name}`,
};

export default function ExperiencePage() {
  return (
    <SectionOverlay title="Experience" fillViewport>
      <ExperienceSection experience={experience} />
    </SectionOverlay>
  );
}
