import { SkillCategory } from "@/lib/types";

// Add a new category, or push into an existing one's `skills` array.
export const skillCategories: SkillCategory[] = [
  { id: "languages", label: "Languages", skills: ["TypeScript", "Python"] },
  { id: "frameworks", label: "Frameworks", skills: ["Next.js", "React"] },
];
