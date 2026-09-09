export function GlassesGlyph() {
  return (
    <svg
      viewBox="0 0 200 100"
      className="h-full w-full max-h-64 max-w-64 text-foreground"
      role="img"
      aria-label="Stylized illustration of a pair of glasses"
    >
      <g
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="52" cy="52" r="38" className="text-accent" fill="currentColor" fillOpacity="0.16" stroke="currentColor" />
        <circle cx="148" cy="52" r="38" className="text-accent" fill="currentColor" fillOpacity="0.16" stroke="currentColor" />
        <path d="M90 48c6-10 14-10 20 0" stroke="currentColor" />
        <path d="M14 46 2 40" stroke="currentColor" />
        <path d="M186 46 198 40" stroke="currentColor" />
      </g>
    </svg>
  );
}
