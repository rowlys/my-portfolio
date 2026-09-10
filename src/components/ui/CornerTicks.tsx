export function CornerTicks() {
  return (
    <>
      <span aria-hidden className="absolute -left-px -top-px h-3 w-3 border-l border-t border-foreground" />
      <span aria-hidden className="absolute -right-px -top-px h-3 w-3 border-r border-t border-foreground" />
      <span aria-hidden className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-foreground" />
      <span aria-hidden className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-foreground" />
    </>
  );
}
