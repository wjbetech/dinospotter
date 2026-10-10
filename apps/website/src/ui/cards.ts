import { page, silhouetteFor, type TaxonCard } from "utils";
import { openTaxon } from "./modal.ts";
import type { TaxonDetail } from "utils";
import { store } from "../store";
import { serializeUrl } from "../url";

const pending = new Set<string>();
const detailCache = new Map<string, TaxonDetail>();

export async function openCardModal(taxonCard: TaxonCard, cardEl: HTMLElement): Promise<void> {
  if (pending.has(taxonCard.tid)) return;
  const cached = detailCache.get(taxonCard.tid);
  if (cached) {
    openTaxon(taxonCard, cached, cardEl);
    return;
  }
  pending.add(taxonCard.tid);
  openTaxon(
    taxonCard,
    {
      tid: taxonCard.tid,
      tna: taxonCard.tna,
      rank: "Loading...",
      authority: "",
      parentTid: "",
      occurrenceCount: null,
      pbdbUrl: "#",
    },
    cardEl,
  );

  history.replaceState(
    null,
    "",
    "?" + serializeUrl(store.getState().countryCode, store.getState().era, taxonCard.tid),
  );

  try {
    const response = await fetch(`/api/taxon?id=${encodeURIComponent(taxonCard.tid)}`);
    if (!response.ok) return;
    detailCache.set(taxonCard.tid, (await response.json()) as TaxonDetail);
  } finally {
    pending.delete(taxonCard.tid);
  }
}

export function renderCards(wrap: HTMLElement, cards: TaxonCard[]): void {
  let num = 0;
  const sentinel = document.createElement("div");

  function appendNext(): void {
    const next = page(cards, num++);
    if (!next.length) {
      io.disconnect();
      return;
    }

    wrap.append(...next.map(renderCard));
    if (num * 48 >= cards.length) io.disconnect();
  }

  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    appendNext();
  });

  appendNext();
  io.observe(sentinel);
  wrap.append(sentinel);
}

export function renderCard(taxonCard: TaxonCard): HTMLElement {
  const cardEl = document.createElement("article");
  cardEl.setAttribute("tabindex", "0");
  cardEl.setAttribute("role", "button");
  cardEl.addEventListener("click", () => void openCardModal(taxonCard, cardEl));
  cardEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openCardModal(taxonCard, cardEl);
    }
  });

  cardEl.innerHTML = `
    <div class="figure"></div>
    <h3>${taxonCard.tna}</h3>
  `;

  const figureEl = cardEl.querySelector(".figure");
  const silhouetteImage = document.createElement("img");

  silhouetteImage.loading = "lazy";
  silhouetteImage.src = `/sprites/${silhouetteFor(taxonCard.tna)}.svg`;

  if (figureEl) {
    figureEl.append(silhouetteImage, renderTickBar());
  }

  return cardEl;
}

export function renderTickBar(): HTMLElement {
  const tickBar = document.createElement("div");
  tickBar.className = "tick-bar";
  tickBar.textContent = "1.8m";
  return tickBar;
}
