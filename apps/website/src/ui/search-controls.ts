const fieldClass =
  "min-h-11 w-full rounded-[var(--radius-control)]! border-boundary! bg-surface! px-3! py-2! text-ink shadow-inner focus-visible:border-moss! focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus";
const labelClass = "mb-2 block text-[0.8125rem] font-semibold text-muted";

export function createSearchControls() {
  const controls = document.createElement("section");
  controls.className = "mt-5 border-t border-boundary pt-5";
  controls.innerHTML = `
    <label class="${labelClass}" for="find-search">Find ancient life</label>
    <div class="flex gap-2">
      <input class="${fieldClass} min-w-0 flex-1" id="find-search" type="search" placeholder="Name or formation" />
      <button class="shrink-0 rounded-[var(--radius-control)]! border-boundary! bg-surface! px-3! py-2! text-sm! text-ink hover:border-moss! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button">Reset</button>
    </div>
    <label class="${labelClass} mt-4" for="find-category">Fossil category</label>
    <select class="${fieldClass}" id="find-category">
      <option value="all">All fossil groups</option>
      <option value="dinosaur">Dinosaurs</option>
      <option value="invertebrate">Invertebrates</option>
      <option value="plant">Plants</option>
      <option value="trace">Tracks and traces</option>
      <option value="other">Other / unclassified</option>
    </select>
    <p class="results-summary mt-3 text-[0.8125rem] leading-relaxed text-muted" role="status"></p>
  `;
  return {
    controls,
    input: controls.querySelector<HTMLInputElement>("#find-search")!,
    category: controls.querySelector<HTMLSelectElement>("#find-category")!,
    reset: controls.querySelector<HTMLButtonElement>("button")!,
    summary: controls.querySelector<HTMLElement>(".results-summary")!,
  };
}
