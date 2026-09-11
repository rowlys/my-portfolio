import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Project } from "./types";

const projectsDirectory = path.join(process.cwd(), "src/content/projects");

export function getAllProjects(): Project[] {
  const files = fs
    .readdirSync(projectsDirectory)
    .filter((file) => file.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(projectsDirectory, filename), "utf8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: data.title,
        summary: data.summary,
        tags: data.tags ?? [],
        date: data.date,
        images: data.images ?? [],
        links: data.links ?? [],
        content,
      } satisfies Project;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
