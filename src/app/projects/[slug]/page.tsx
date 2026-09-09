import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
import { ProjectDetail } from "./ProjectDetail";
import { getAllProjects, getProject } from "@/lib/content";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  return { title: project ? project.title : "Project not found" };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-6 py-16 sm:px-10">
      <BackLink href="/projects" className="relative">← Projects</BackLink>
      <ProjectDetail project={project} />
    </main>
  );
}
