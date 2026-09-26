export function renderSkeleton(n = 6): HTMLElement {
  const ul = document.createElement("ul");
  ul.setAttribute("aria-label", "Loading fossil records...");

  for (let i = 0; i < n; i++) {
    ul.append(Object.assign(document.createElement("li"), { className: "skeleton-card" }));
  }

  return ul;
}
