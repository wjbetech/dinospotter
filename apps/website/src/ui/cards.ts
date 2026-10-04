import { page, silhouetteFor, type TaxonCard } from "utils";
import { openTaxon } from "./modal.ts";
import type { TaxonDetail } from "utils";

export async function openCardModal(taxonCard: TaxonCard, cardElement: HTMLElement): Promise<void> {
  console.log("openCardModal", taxonCard.tid);
  const response = await fetch(`/api/taxon?id=${taxonCard.tid}`);
  console.log("taxon status: ", response.status);
  if (!response.ok) return;
  const detail = (await response.json()) as TaxonDetail;
  openTaxon(taxonCard, detail, cardElement);
}

export function renderCards(wrap: HTMLElement, cards: TaxonCard[]): void {
  let num = 0;
  const sentinel = document.createElement("div");
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    const next = page(cards, num++);
    if (!next.length) {
      io.disconnect();
      return;
    }
    wrap.append(...next.map(renderCard));
    if (num * 48 >= cards.length) io.disconnect();
  });
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
    }
    void openCardModal(taxonCard, cardEl);
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
