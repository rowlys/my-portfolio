import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { SkillsSection } from "./SkillsSection";
import { skillCategories } from "@/content/skills";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Skills — ${profile.name}`,
};

export default function SkillsPage() {
  return (
    <SectionOverlay title="Skills">
      <SkillsSection skillCategories={skillCategories} />
    </SectionOverlay>
  );
}
