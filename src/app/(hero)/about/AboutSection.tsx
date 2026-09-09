import type { Profile } from "@/lib/types";

export function AboutSection({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="normal-case tracking-normal">{profile.about}</p>
      {profile.links.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {profile.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
