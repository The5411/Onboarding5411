import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "onboarding_progress";

type ProgressMap = Record<string, boolean>;

let cache: ProgressMap | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): ProgressMap {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function commit(next: ProgressMap) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      cache = readFromStorage();
      listeners.forEach((listener) => listener());
    }
  });
}

function getServerSnapshot(): ProgressMap {
  return {};
}

export function useOnboardingProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleItem = useCallback((itemId: string, value?: boolean) => {
    const current = getSnapshot();
    commit({ ...current, [itemId]: value ?? !current[itemId] });
  }, []);

  const getGroupProgress = useCallback(
    (leafIds: string[]) => {
      const done = leafIds.filter((id) => progress[id]).length;
      return { done, total: leafIds.length };
    },
    [progress],
  );

  return { progress, toggleItem, getGroupProgress };
}
