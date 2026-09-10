import { SkillCategory } from "@/lib/types";

export const skillCategories: SkillCategory[] = [
  {
    id: "programming-languages",
    label: "Programming Languages",
    skills: ["TypeScript", "Python", "C#", "C++", "JavaScript", "SQL", "HTML", "CSS", "Go"],
  },
  {
    id: "frameworks-engines",
    label: "Frameworks & Engines",
    skills: ["Next.js", "React", "Unity", "Godot", "Node.js", "Express.js", "FastAPI", "Gin"],
  },
  {
    id: "infrastructure-tools",
    label: "Infrastructure & Tools",
    skills: ["PostgreSQL", "MongoDB", "Supabase", "Cloudflare R2", "Docker"],
  },
  {
    id: "misc",
    label: "Other Skills",
    skills: ["English", "Writing", "Scientific Writing", "Problem Solving", "System Analysis"],
  },
];
