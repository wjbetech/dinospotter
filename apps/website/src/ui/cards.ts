import { selectFind } from "./selection.ts";
import { page, silhouetteFor, type TaxonCard, type TaxonDetail } from "utils";
import { openTaxon } from "./modal.ts";
import { store } from "../store";
import { serializeUrl } from "../url";
const detailCache = new Map<string, TaxonDetail>();
export async function openCardModal(card: TaxonCard, returnTo: HTMLElement): Promise<void> {
  selectFind(card.tid);
  const cached = detailCache.get(card.tid);
  const dialog = openTaxon(
    card,
    cached ?? {
      tid: card.tid,
      tna: card.tna,
      rank: "Loading taxon details…",
      authority: "",
      parentTid: "",
      occurrenceCount: null,
      pbdbUrl: "",
    },
    returnTo,
  );
  if (!dialog) return;
  history.replaceState(
    null,
    "",
    "?" + serializeUrl(store.getState().countryCode, store.getState().era, card.tid),
  );
  if (cached) return;
  const metadata = dialog.querySelector<HTMLElement>(".taxon-metadata")!;
  try {
    const response = await fetch(`/api/taxon?id=${encodeURIComponent(card.tid)}`);
    if (!response.ok) throw new Error("upstream");
    const detail = (await response.json()) as TaxonDetail;
    detailCache.set(card.tid, detail);
    metadata.textContent =
      [detail.rank, detail.authority].filter(Boolean).join(" · ") || "Taxon details loaded.";
  } catch {
    metadata.textContent =
      "Additional details are unavailable. You can still view the PBDB source.";
  }
}
export function renderCards(wrap: HTMLElement, cards: TaxonCard[]): void {
  let num = 0;
  const sentinel = document.createElement("div");
  sentinel.classList.add("sentinel");
  function appendNext(): void {
    if (!sentinel.isConnected && num > 0) {
      io.disconnect();
      return;
    }
    const next = page(cards, num++);
    if (!next.length) {
      io.disconnect();
      return;
    }
    wrap.append(...next.map(renderCard));
    if (num * 48 >= cards.length) io.disconnect();
  }
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) appendNext();
  });
  appendNext();
  wrap.append(sentinel);
  io.observe(sentinel);
}
export function renderCard(card: TaxonCard): HTMLElement {
  const el = document.createElement("article");
  el.className =
    "card flex min-h-[4.25rem] cursor-pointer items-center gap-3 border-b border-boundary py-2 transition-colors hover:bg-inset focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  el.dataset.tid = card.tid;
  el.addEventListener("mouseenter", () => selectFind(card.tid));
  el.addEventListener("focus", () => selectFind(card.tid));
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", `${card.tna}, ${card.eag} to ${card.lag} million years ago`);
  el.addEventListener("click", () => void openCardModal(card, el));
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openCardModal(card, el);
    }
  });
  const figure = document.createElement("div");
  figure.className =
    "figure flex h-12 w-[3.25rem] shrink-0 items-center justify-center rounded-md border border-boundary bg-inset p-1";
  const art = document.createElement("span");
  const kind = silhouetteFor(card.tna);
  art.className = "taxon-art";
  art.classList.add("h-[2.375rem]", "w-10", "shrink-0");
  art.dataset.kind = kind;
  art.setAttribute("aria-hidden", "true");
  art.style.setProperty("--silhouette", `url('/sprites/${kind}.svg')`);
  figure.append(art);
  const title = document.createElement("h3");
  title.textContent = card.tna;
  title.className = "m-0 text-base font-semibold leading-snug text-ink";
  const caption = document.createElement("div");
  caption.className = "min-w-0 [overflow-wrap:anywhere]";
  caption.append(title);
  if (card.sfm) {
    const formation = document.createElement("small");
    formation.textContent = card.sfm;
    formation.className = "mt-1 block text-[0.8125rem] text-muted";
    caption.append(formation);
  }
  const age = document.createElement("small");
  age.className = "record-age mt-1 block text-xs text-muted";
  age.textContent = `${card.eag}–${card.lag} million years ago`;
  caption.append(age);
  el.append(figure, caption);
  return el;
}
