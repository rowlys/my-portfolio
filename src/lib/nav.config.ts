import { NavItem } from "./types";

// Single source of truth for the main menu. Add a section by adding an
// entry here — the main menu renders this list directly.
export const navItems: NavItem[] = [
  { label: "Projects", href: "/projects", description: "Things I've built." },
  { label: "Experience", href: "/experience", description: "Where I've worked." },
  { label: "Skills", href: "/skills", description: "Tools and technologies I use." },
  { label: "About", href: "/about", description: "Who I am." },
  { label: "Contact", href: "/contact", description: "Get in touch." },
];
