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
  el.classList.add("card");
  el.dataset.tid = card.tid;
  el.addEventListener("mouseenter", () => selectFind(card.tid));
  el.addEventListener("focus", () => selectFind(card.tid));
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.addEventListener("click", () => void openCardModal(card, el));
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openCardModal(card, el);
    }
  });
  const figure = document.createElement("div");
  figure.className = "figure";
  const art = document.createElement("span");
  const kind = silhouetteFor(card.tna);
  art.className = "taxon-art";
  art.dataset.kind = kind;
  art.setAttribute("aria-hidden", "true");
  art.style.setProperty("--silhouette", `url('/sprites/${kind}.svg')`);
  figure.append(art);
  const title = document.createElement("h3");
  title.textContent = card.tna;
  const caption = document.createElement("div");
  caption.append(title);
  if (card.sfm) {
    const formation = document.createElement("small");
    formation.textContent = card.sfm;
    caption.append(formation);
  }
  const age = document.createElement("small");
  age.className = "record-age";
  age.textContent = `${card.eag}–${card.lag} million years ago`;
  caption.append(age);
  el.append(figure, caption);
  return el;
}
