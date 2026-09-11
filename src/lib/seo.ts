import type { Metadata } from "next";
import { profile } from "@/content/profile";

export const SITE_URL = "https://itsrowly.com";

export function sectionMetadata(title: string, description: string, path: string): Metadata {
  const ogTitle = `${title} | ${profile.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
    },
    twitter: {
      title: ogTitle,
      description,
    },
  };
}
