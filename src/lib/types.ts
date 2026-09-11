export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
  images: string[];
  links?: { label: string; href: string }[];
  content: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  organization: string;
  start: string;
  end?: string;
  summary: string;
  highlights?: string[];
};

export type SkillCategory = {
  id: string;
  label: string;
  skills: string[];
};

export type Profile = {
  name: string;
  tagline: string;
  about: string;
  education: {
    school: string;
    program: string;
    gpa: number;
  };
  links: { label: string; href: string }[];
};
