import type { Era } from "../url.ts";

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
