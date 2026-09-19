import type { Era } from "./url";

export type Status = "idle" | "loading" | "ready" | "empty" | "degraded" | "error";
export type DataSource = "network" | "session" | "seed" | null;

export function createStore(initial: { cc: string | null; era: Era; status: Status }) {
  const cache = new Map<string, unknown>();

  function setCache(key: string, val: unknown) {
    if (cache.has(key)) cache.delete(key);
    cache.set(key, val);
    if (cache.size > 12) cache.delete(cache.keys().next().value!);
  }

  const VERSION = "v1";

  function storageKey(key: string) {
    return `dinospotter:${VERSION}:${key}`;
  }

  function saveSession(key: string, val: unknown) {
    try {
      sessionStorage.setItem(storageKey(key), JSON.stringify(val));
    } catch {}
  }

  function loadSession(key: string): unknown | null {
    try {
      const raw = sessionStorage.getItem(storageKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  let state = initial;
  let sequence = 0;
  const subs = new Set<() => void>();

  function setState(
    par: Partial<typeof state> & {
      sequence?: number;
    },
  ) {
    if (par.sequence !== undefined && par.sequence !== sequence) return;

    state = { ...state, ...par };

    if (par.cc !== undefined || par.era !== undefined) {
      const key = `${state.cc ?? ""}:${state.era}`;
      setCache(key, state);
      saveSession(key, state);
    }
    subs.forEach((f) => f());
  }

  return {
    getState: () => state,
    setState,
    subscribe: (fn: () => void) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    nextSeq: () => ++sequence,
    loadSession,
  };
}
