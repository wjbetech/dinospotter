import { page, type TaxonCard } from "utils";

export function renderCards(wrap: HTMLElement, cards: TaxonCard[]): void {
  let num = 0;
  const sentinel = document.createElement("div");
  const io = new IntersectionObserver(() => {
    wrap.append(...page(cards, num++).map(renderCard));
  });
  io.observe(sentinel);
  wrap.append(sentinel);
}

export function renderCard(taxonCard: TaxonCard): HTMLElement {
  const cardEl = document.createElement("article");
  cardEl.innerHTML = `
    <div class="figure"></div>
    <h3>${taxonCard.tna}</h3>
    <p>${taxonCard.eag} - ${taxonCard.lag} Ma</p>
    <p>${taxonCard.sfm}</p>
  `;
  return cardEl;
}
