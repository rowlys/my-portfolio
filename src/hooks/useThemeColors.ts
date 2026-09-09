"use client";

import { useSyncExternalStore } from "react";

export type ThemeColors = {
  foreground: string;
  accent: string;
  accentStrong: string;
};

const FALLBACK: ThemeColors = {
  foreground: "#111411",
  accent: "#15803d",
  accentStrong: "#166534",
};

function readColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    foreground: read("--foreground", FALLBACK.foreground),
    accent: read("--accent", FALLBACK.accent),
    accentStrong: read("--accent-strong", FALLBACK.accentStrong),
  };
}

let cachedSnapshot: ThemeColors | null = null;

function getSnapshot(): ThemeColors {
  if (!cachedSnapshot) cachedSnapshot = readColors();
  return cachedSnapshot;
}

function getServerSnapshot(): ThemeColors {
  return FALLBACK;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    cachedSnapshot = readColors();
    onChange();
  };
  media.addEventListener("change", handleChange);
  return () => media.removeEventListener("change", handleChange);
}

export function useThemeColors(): ThemeColors {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
