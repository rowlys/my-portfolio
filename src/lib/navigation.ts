export type Section = "about" | "skills" | "experience" | "projects" | "contact";

export const NAV_ITEMS: { section: Section; label: string }[] = [
  { section: "about", label: "About" },
  { section: "skills", label: "Skills" },
  { section: "experience", label: "Experience" },
  { section: "projects", label: "Projects" },
  { section: "contact", label: "Contact" },
];
