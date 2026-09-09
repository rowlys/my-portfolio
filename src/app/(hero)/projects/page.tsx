import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { ProjectsSection } from "./ProjectsSection";
import { getAllProjects } from "@/lib/content";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Projects — ${profile.name}`,
};

export default function ProjectsPage() {
  return (
    <SectionOverlay title="Projects">
      <ProjectsSection projects={getAllProjects()} />
    </SectionOverlay>
  );
}
