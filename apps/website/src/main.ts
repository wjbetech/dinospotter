// styles
import "./styles/tokens.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";

// utils
import { store } from "./store.ts";
import { parseUrl } from "./url.ts";
import { serializeUrl } from "./url.ts";
import { COUNTRIES, filterBySfm } from "utils";

// components
import { renderCards, openCardModal } from "./ui/cards.ts";
import { renderSkeleton } from "./ui/skeleton.ts";
import { renderCountryListBox } from "./ui/country-listbox.ts";
import { renderEraStrip } from "./ui/era-strip.ts";
import { renderBadge } from "./ui/badge.ts";
import { selectEra } from "./ui/era-strip.ts";
import { copyFor } from "./ui/states.ts";

const app = document.querySelector("#app")!;
if (!app.querySelector("#drawer")) {
  app.insertAdjacentHTML("beforeend", `<aside id="drawer"></aside>`);
}

const globeEl = document.querySelector("#globe");
const loadBtn = document.querySelector("#load-globe");
const drawer = document.querySelector("#drawer");

function loadGlobe(): void {
  if (globeEl instanceof HTMLElement) {
    void import("./components/globe/index.ts").then((m) => m.initGlobe(globeEl));
    loadBtn?.remove();
  }
}

if (parseUrl(location.search).countryCode) {
  loadGlobe();
} else {
  loadBtn?.addEventListener("click", loadGlobe, {
    once: true,
  });
}

if (drawer instanceof HTMLElement) {
  drawer.append(
    renderCountryListBox([...COUNTRIES], (c) => {
      const era = store.getState().era;
      history.pushState(null, "", "?" + serializeUrl(c.countryCode, era));
      store.setState({
        countryCode: c.countryCode,
      });
      void selectEra(era);
    }),
  );

  drawer.append(
    renderEraStrip(store.getState().era, {
      Paleozoic: "#2F7D62",
      Mesozoic: "#D9A441",
      Cenozoic: "#DCEBF5",
    }),
  );

  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Filter by formation";
  input.setAttribute("aria-label", "Filter by formation");
  input.addEventListener("input", () => {
    const { payload } = store.getState();
    if (!payload) return;
    drawer.querySelectorAll(".card").forEach((el) => el.remove());
    renderCards(drawer, filterBySfm(payload.cards, input.value));
  });

  drawer.append(input);

  store.subscribe(() => {
    const { payload, status, countryCode, era } = store.getState();

    drawer.querySelectorAll(".skeleton, .card").forEach((el) => el.remove());

    if (status === "loading") {
      const s = renderSkeleton();
      s.classList.add("skeleton");
      drawer.append(s);
    } else if (status === "empty") {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = copyFor("empty", countryCode, era);
      drawer.append(emptyMessage);
    } else if (status === "degraded" || status === "error") {
      const badge = renderBadge(status, () => void selectEra(store.getState().era));
      if (badge) {
        drawer.append(badge);
      }
      if (payload) renderCards(drawer, payload.cards);
    } else if (payload) {
      renderCards(drawer, payload.cards);
    }

    const txn = parseUrl(location.search).txn;

    if (txn && payload) {
      const hit = payload.cards.find((c) => c.tid === txn || c.tid === `txn:${txn}`);
      if (hit) void openCardModal(hit, document.body);
    }
  });
}

const init = parseUrl(location.search);

if (init.countryCode) {
  store.setState({ countryCode: init.countryCode, era: init.era });
  void selectEra(init.era);
}
