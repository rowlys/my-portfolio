import { readFileSync } from "fs";
import path from "path";
import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { SkillsSection } from "./SkillsSection";
import { skillCategories } from "@/content/skills";
import { profile } from "@/content/profile";
import { SKILL_ICON_FILE } from "@/content/skillIcons";

export const metadata: Metadata = {
  title: `Skills — ${profile.name}`,
};

function readSkillIcons(): Record<string, string> {
  const iconsDir = path.join(process.cwd(), "public", "icons", "skills");
  return Object.fromEntries(
    Object.entries(SKILL_ICON_FILE).map(([skill, file]) => [
      skill,
      readFileSync(path.join(iconsDir, file), "utf-8"),
    ]),
  );
}

export default function SkillsPage() {
  const skillIcons = readSkillIcons();

  return (
    <SectionOverlay title="Skills" fillViewport>
      <SkillsSection skillCategories={skillCategories} skillIcons={skillIcons} />
    </SectionOverlay>
  );
}
