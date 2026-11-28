export function renderSkeleton(n = 6): HTMLElement {
  const ul = document.createElement("ul");
  ul.setAttribute("aria-busy", "true");
  ul.setAttribute("aria-label", "Loading fossil records...");
  ul.className = "my-3 grid list-none gap-2 p-0";

  for (let i = 0; i < n; i++) {
    const item = document.createElement("li");
    item.className = "h-16 animate-pulse rounded-xl bg-inset";
    ul.append(item);
  }

  return ul;
}
