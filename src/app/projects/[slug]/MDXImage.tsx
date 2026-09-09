import Image from "next/image";

export function MDXImage({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;

  return (
    <span className="relative my-6 block h-[420px] w-full">
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        sizes="(min-width: 768px) 700px, 100vw"
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
