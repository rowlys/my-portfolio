"use client";

import { useSyncExternalStore } from "react";

let closing = false;
const listeners = new Set<() => void>();

export function beginSectionExit() {
  if (closing) return;
  closing = true;
  listeners.forEach((listener) => listener());
}

export function resetSectionExit() {
  if (!closing) return;
  closing = false;
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot() {
  return closing;
}

function getServerSnapshot() {
  return false;
}

export function useSectionExiting() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
