const navLink =
  "rounded-full px-4 py-2 text-[0.9375rem] font-medium text-muted no-underline transition-colors hover:bg-surface hover:text-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[current=page]:bg-surface aria-[current=page]:text-moss aria-[current=page]:shadow-sm";

export function renderHeader(isHome: boolean): void {
  const mount = document.querySelector("#header-mount");
  if (!mount) return;

  const header = document.createElement("header");
  header.className =
    "relative z-10 grid min-h-[4.75rem] grid-cols-2 items-center gap-x-4 gap-y-2 border-b border-boundary bg-surface/95 px-4 py-3 shadow-sm md:grid-cols-[1fr_auto_1fr] md:px-10";
  header.innerHTML = `
    <a class="justify-self-start font-[var(--font-display)] text-[1.6875rem] font-bold leading-none tracking-[-0.04em] text-ink no-underline" href="/">DinoSpotter</a>
    <nav class="col-span-2 row-start-2 flex justify-center gap-1 rounded-full border border-boundary bg-paper p-1 md:col-span-1 md:row-auto" aria-label="Main navigation">
      <a class="${navLink}" href="/explore">Explore</a>
      <a class="${navLink}" href="/explore#field-guide">Field guide</a>
      <a class="${navLink}" href="/explore#saved-finds">Saved finds</a>
    </nav>
    ${isHome ? "" : '<button id="share-view-button" class="justify-self-end rounded-[var(--radius-control)]! border-moss! bg-moss! px-4! py-2! text-sm font-semibold text-white! shadow-sm transition-colors hover:bg-moss-hover! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50" type="button">Share view</button>'}
  `;
  mount.replaceWith(header);
}
