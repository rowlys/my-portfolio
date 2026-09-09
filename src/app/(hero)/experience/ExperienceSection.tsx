import type { ExperienceEntry } from "@/lib/types";

export function ExperienceSection({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <div className="flex flex-col gap-8">
      {experience.map((entry) => (
        <div key={entry.id}>
          <h3>
            {entry.role} · {entry.organization}
          </h3>
          <p className="mt-1 normal-case tracking-normal opacity-70">
            {entry.start} — {entry.end ?? "Present"}
          </p>
          <p className="mt-2 normal-case tracking-normal">{entry.summary}</p>
          {entry.highlights && entry.highlights.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-left normal-case tracking-normal">
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
