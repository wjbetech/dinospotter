// styles
import "./styles/tokens.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/atkinson-hyperlegible-next/latin-400.css";
import "@fontsource/atkinson-hyperlegible-next/latin-500.css";

// utils
import { mountWorkspace } from "./ui/workspace.ts";
import { store } from "./store.ts";
import { parseUrl } from "./url.ts";
import { COUNTRIES } from "utils";

// components
import { openCardModal } from "./ui/cards.ts";
import { renderSkeleton } from "./ui/skeleton.ts";
import { renderCountryListBox } from "./ui/country-listbox.ts";
import { renderEraStrip } from "./ui/era-strip.ts";
import { renderBadge } from "./ui/badge.ts";
import { selectEra } from "./ui/era-strip.ts";
import { copyFor } from "./ui/states.ts";

const navLinks = document.querySelectorAll<HTMLAnchorElement>(".site-header nav a");
function syncNavigation(): void {
  const current =
    location.hash === "#field-guide" || location.hash === "#saved-finds"
      ? location.hash
      : "#map-panel";
  navLinks.forEach((link) => {
    if (link.hash === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("hashchange", syncNavigation);
syncNavigation();
const shareButton = document.querySelector<HTMLButtonElement>("#share-view");
shareButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    shareButton.textContent = "Link copied";
    window.setTimeout(() => {
      shareButton.textContent = "Share view";
    }, 2200);
  } catch {
    shareButton.textContent = "Copy unavailable";
  }
});
const app = document.querySelector("#app")!;
if (!app.querySelector("#drawer")) {
  app.insertAdjacentHTML("beforeend", `<aside id="drawer"></aside>`);
}

const globeEl = document.querySelector("#globe");
const loadBtn = document.querySelector("#load-globe");
const drawer = document.querySelector("#drawer");
let globeLoaded = false;

function loadGlobe(): void {
  if (globeEl instanceof HTMLElement && !globeLoaded) {
    globeLoaded = true;
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
      loadGlobe();
      store.setState({
        countryCode: c.countryCode,
        payload: null,
        status: "loading",
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

  const workspace = mountWorkspace(drawer);

  store.subscribe(() => {
    const { payload, status, countryCode, era } = store.getState();

    drawer
      .querySelectorAll(".skeleton, .card, .empty-message, .badge, .sentinel")
      .forEach((el) => el.remove());

    workspace.reset();

    if (status === "loading") {
      const s = renderSkeleton(15);
      s.classList.add("skeleton");
      drawer.append(s);
    } else if (status === "empty") {
      const emptyMessage = document.createElement("p");
      emptyMessage.classList.add("empty-message");
      emptyMessage.textContent = copyFor("empty", countryCode, era);
      drawer.append(emptyMessage);
    } else if (status === "degraded" || status === "error") {
      const badge = renderBadge(status, () => void selectEra(store.getState().era));
      if (badge) {
        drawer.append(badge);
      }
      if (payload) workspace.render(payload.cards);
    } else if (payload) {
      workspace.render(payload.cards);
    }

    drawer.querySelectorAll('[role="radio"]').forEach((btn) => {
      btn.setAttribute("aria-checked", String(!!btn.textContent?.startsWith(era)));
    });

    const picker = drawer.querySelector('select[aria-label="Country"]') as HTMLSelectElement | null;

    if (picker) picker.value = countryCode ?? "";
    const heading = drawer.querySelector("h1");
    const intro = drawer.querySelector(".drawer-intro");
    if (heading)
      heading.textContent = countryCode
        ? picker?.selectedOptions[0]?.textContent || countryCode
        : "Explore the fossil record";
    if (intro)
      intro.textContent = countryCode
        ? [era, payload && `${payload.cards.length} featured fossil groups`]
            .filter(Boolean)
            .join(" · ")
        : "Choose a country and era to explore its fossil record.";

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
