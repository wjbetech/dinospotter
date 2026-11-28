import type { TaxonCard } from "utils";
let active: string | null = null;
const listeners = new Map<HTMLElement, (tid: string | null) => void>();
export const selectedFind = () => active;
export function selectFind(tid: string | null): void {
  active = tid;
  document.querySelectorAll<HTMLElement>(".card[data-tid], .callout[data-tid]").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.tid === tid);
  });
  listeners.forEach((fn) => fn(tid));
}
export function onSelection(owner: HTMLElement, fn: (tid: string | null) => void): void {
  listeners.set(owner, fn);
}
export interface SavedFind {
  card: TaxonCard;
  country: string;
  era: string;
}
const key = "dinospotter:saved:v1";
export function savedFinds(): SavedFind[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? value.filter(
          (item) =>
            item?.card &&
            typeof item.card.tid === "string" &&
            typeof item.card.tna === "string" &&
            Array.isArray(item.card.sites) &&
            typeof item.country === "string" &&
            typeof item.era === "string",
        )
      : [];
  } catch {
    return [];
  }
}
export function toggleSaved(find: SavedFind): boolean {
  const saved = savedFinds();
  const exists = saved.some(
    (item) =>
      item.card.tid === find.card.tid && item.country === find.country && item.era === find.era,
  );
  const next = saved.filter(
    (item) =>
      !(item.card.tid === find.card.tid && item.country === find.country && item.era === find.era),
  );
  if (!exists) next.push(find);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event("saved-finds-change"));
  return true;
}
