import type { Era } from "../url.ts";
import { toBlurb } from "utils";
import type { EpochBlurb } from "utils";

type TimescaleJson = {
  records: {
    nam: string;
    eag: number;
    lag: number;
    col: string;
    itp: string;
  }[];
};

let cache: EpochBlurb[] | null = null;

export async function loadBlurbs(): Promise<EpochBlurb[]> {
  if (cache) return cache;

  try {
    const json = await fetch("/data/timescale.json").then(
      (r) => r.json() as Promise<TimescaleJson>,
    );

    cache = json.records.map(toBlurb);

    return cache;
  } catch (error) {
    console.error("Failed to load epoch blurbs:", error);
    return [];
  }
}

export function renderEraStrip(active: Era, dots: Record<Era, string>): HTMLElement {
  const group = document.createElement("div");

  group.setAttribute("role", "radiogroup");

  for (const era of ["Paleozoic", "Mesozoic", "Cenozoic"] as Era[]) {
    const btn = document.createElement("button");
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(era === active));
    btn.textContent = `${era} ${dots[era]}`;
    group.append(btn);
  }

  return group;
}
