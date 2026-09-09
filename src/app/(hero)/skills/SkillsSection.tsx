import type { SkillCategory } from "@/lib/types";

export function SkillsSection({ skillCategories }: { skillCategories: SkillCategory[] }) {
  return (
    <div className="flex flex-col gap-6">
      {skillCategories.map((category) => (
        <div key={category.id}>
          <h3 className="mb-2">{category.label}</h3>
          <p className="normal-case tracking-normal">{category.skills.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
