import type { Metadata } from "next";
import { SectionOverlay } from "@/features/sections/SectionOverlay";
import { ContactSection } from "./ContactSection";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Contact — ${profile.name}`,
};

export default function ContactPage() {
  return (
    <SectionOverlay title="Contact">
      <ContactSection profile={profile} />
    </SectionOverlay>
  );
}
