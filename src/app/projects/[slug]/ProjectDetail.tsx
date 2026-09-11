import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Project } from "@/lib/types";
import { MDXImage } from "./MDXImage";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <article className="flex flex-col gap-6 text-left normal-case tracking-normal">
      {project.images[0] && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm">
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            sizes="(min-width: 768px) 700px, 100vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      )}

      <header>
        <h1 className="font-display text-4xl uppercase tracking-[-0.025em]">{project.title}</h1>
        <p className="mt-2 opacity-70">{project.summary}</p>
        {project.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] opacity-70">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={project.content} components={{ img: MDXImage }} />
      </div>

      {project.links && project.links.length > 0 && (
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-[0.2em]">
          {project.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
