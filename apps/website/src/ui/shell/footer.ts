const footerLink =
  "text-sm text-muted no-underline hover:text-moss hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function renderFooter(isHome: boolean): void {
  const mount = document.querySelector("#footer-mount");
  if (!mount) return;

  const footer = document.createElement("footer");
  footer.id = "about";
  footer.className =
    "mt-auto flex flex-col gap-4 border-t border-boundary bg-[#e6e7da] px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10";
  footer.innerHTML = `
    <strong class="font-[var(--font-display)] text-lg text-ink">DinoSpotter</strong>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <a class="${footerLink}" href="https://paleobiodb.org/">Paleobiology Database</a>
      <a class="${footerLink}" href="/geo/ATTRIBUTION.md">Map sources</a>
      ${isHome ? "" : `<a class="${footerLink}" href="#map-panel">Back to map <i class="inline-block size-4 align-[-0.15em]" data-lucide="arrow-up" aria-hidden="true"></i></a>`}
    </div>
  `;
  mount.replaceWith(footer);
}
