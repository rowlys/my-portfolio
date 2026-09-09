import type { Profile } from "@/lib/types";

export function ContactSection({ profile }: { profile: Profile }) {
  if (profile.links.length === 0) {
    return <p className="normal-case tracking-normal">Contact details are on their way.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {profile.links.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
