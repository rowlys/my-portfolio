import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { ProjectsSection } from "./ProjectsSection";
import { getAllProjects } from "@/lib/content";
import { profile } from "@/content/profile";
import { MDXImage } from "@/app/projects/[slug]/MDXImage";

export const metadata: Metadata = {
  title: `Projects — ${profile.name}`,
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const renderedContent = Object.fromEntries(
    projects.map((project) => [
      project.slug,
      <MDXRemote key={project.slug} source={project.content} components={{ img: MDXImage }} />,
    ]),
  );

  return (
    <SectionOverlay title="Projects" fillViewport>
      <ProjectsSection projects={projects} renderedContent={renderedContent} />
    </SectionOverlay>
  );
}
