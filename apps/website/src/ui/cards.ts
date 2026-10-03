import { page, silhouetteFor, type TaxonCard } from "utils";

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
