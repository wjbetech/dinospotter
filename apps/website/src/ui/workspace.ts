import { artworkFor, type TaxonCard } from "utils";
import { renderCards } from "./cards.ts";
import { savedFinds } from "./selection.ts";
import { store } from "../store.ts";
import { serializeUrl } from "../url.ts";
import { createSearchControls } from "./search-controls.ts";

export function mountWorkspace(drawer: HTMLElement) {
  const { controls, input, category, reset, summary } = createSearchControls();
  const results = document.createElement("div");
  results.className = "workspace-results";
  drawer.append(controls, results);
  let cards: TaxonCard[] = [];
  const render = (next = cards) => {
    cards = next;
    const query = input.value.trim().toLowerCase();
    const filtered = cards.filter((card) => {
      const kind = artworkFor(card.tna, card);
      const dinosaur = ["theropod", "sauropod", "ornithischian"].includes(kind);
      const plant = ["plant", "fern", "leaf"].includes(kind);
      const shell = ["invertebrate", "ammonite", "bivalve", "gastropod"].includes(kind);
      const group = plant
        ? "plant"
        : shell
          ? "invertebrate"
          : dinosaur
            ? "dinosaur"
            : ["invertebrate", "plant", "trace"].includes(kind)
              ? kind
              : "other";
      return (
        `${card.tna} ${card.sfm}`.toLowerCase().includes(query) &&
        (category.value === "all" || category.value === group)
      );
    });
    results.replaceChildren();
    summary.textContent = `${filtered.length} of ${cards.length} featured groups · ranked by findsites`;
    if (filtered.length) renderCards(results, filtered);
    else if (cards.length) {
      const empty = document.createElement("p");
      empty.textContent = "No featured groups match. Try another name or reset your filters.";
      results.append(empty);
    }
  };
  input.addEventListener("input", () => render());
  category.addEventListener("change", () => render());
  reset.addEventListener("click", () => {
    input.value = "";
    category.value = "all";
    render();
    input.focus();
  });

  const library = document.createElement("section");
  library.id = "field-guide";
  library.className = "atlas-library";
  library.innerHTML = `<div><p class="eyebrow">The field guide</p><h2>Read the landscape through time</h2><p>DinoSpotter explores dinosaurs and other ancient life. Marine shells, plants and fossil tracks tell different parts of the story.</p><dl><dt>Paleozoic · 539–252 million years ago</dt><dd>Early animal diversity, ancient seas and the spread of life onto land.</dd><dt>Mesozoic · 252–66 million years ago</dt><dd>Dinosaurs on land, alongside diverse marine life and changing plant communities.</dd><dt>Cenozoic · 66 million years ago–present</dt><dd>The diversification of mammals and birds, and the development of modern ecosystems.</dd></dl><p class="source-note">Map positions use modern coordinates. Featured groups are ranked by recorded findsites; they are not a complete inventory. Categories are illustrative name-based matches, and some groups remain unclassified.</p></div><div id="saved-finds"><p class="eyebrow">Your collection</p><h2>Saved finds</h2><p>Stored in this browser. Open a fossil to save it.</p><div class="saved-list"></div><p class="saved-context" role="status"></p></div>`;
  document.querySelector("#app")!.append(library);
  const updateSaved = () => {
    const list = library.querySelector(".saved-list")!;
    list.replaceChildren();
    for (const find of savedFinds()) {
      const link = document.createElement("a");
      link.href = `?${serializeUrl(find.country, find.era as ReturnType<typeof store.getState>["era"], find.card.tid)}`;
      link.textContent = `${find.card.tna} · ${find.country} · ${find.era}`;
      list.append(link);
    }
    library.querySelector(".saved-context")!.textContent = savedFinds().length
      ? `${savedFinds().length} saved finds`
      : "Your collection is empty. Start with a fossil on the map.";
  };
  updateSaved();
  window.addEventListener("saved-finds-change", updateSaved);
  window.addEventListener("storage", updateSaved);
  return {
    render,
    reset() {
      input.value = "";
      category.value = "all";
      results.replaceChildren();
      summary.textContent = "";
    },
  };
}
