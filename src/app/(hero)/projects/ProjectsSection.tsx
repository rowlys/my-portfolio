import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="normal-case tracking-normal">Projects are on their way.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {projects.map((project) => (
        <li key={project.slug}>
          {project.coverImage && (
            <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-sm">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                sizes="(min-width: 768px) 400px, 100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <Link href={`/projects/${project.slug}`} className="underline underline-offset-4">
            {project.title}
          </Link>
          <p className="mt-1 normal-case tracking-normal opacity-70">{project.summary}</p>
        </li>
      ))}
    </ul>
  );
}
