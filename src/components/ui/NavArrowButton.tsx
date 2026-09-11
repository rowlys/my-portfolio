"use client";

export function NavArrowButton({
  direction,
  onClick,
  ariaLabel,
  size = "text-2xl",
}: {
  direction: "left" | "right";
  onClick: () => void;
  ariaLabel: string;
  size?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`shrink-0 px-1 font-display ${size} leading-none text-accent/50 transition-colors duration-150 hover:text-accent focus-visible:text-accent focus-visible:outline-none`}
    >
      {direction === "left" ? "<" : ">"}
    </button>
  );
}
