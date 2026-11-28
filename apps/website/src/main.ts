// styles
import "./styles/theme.css";
import "./styles/tokens.css";
import "./styles/tailwind.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/atkinson-hyperlegible-next/latin-400.css";
import "@fontsource/atkinson-hyperlegible-next/latin-500.css";

// utils
import { mountWorkspace } from "./ui/workspace.ts";
import { store } from "./store.ts";
import { parseUrl } from "./url.ts";
import { COUNTRIES } from "utils";
import { ArrowLeft, ArrowUp, ArrowUpRight, createIcons } from "lucide";

// components
import { openCardModal } from "./ui/cards.ts";
import { renderSkeleton } from "./ui/skeleton.ts";
import { renderCountryListBox } from "./ui/country-listbox.ts";
import { renderEraStrip } from "./ui/era-strip.ts";
import { renderBadge } from "./ui/badge.ts";
import { selectEra } from "./ui/era-strip.ts";
import { copyFor } from "./ui/states.ts";
import { renderHeader } from "./ui/shell/header.ts";
import { renderFooter } from "./ui/shell/footer.ts";

const isHome = location.pathname === "/" && !parseUrl(location.search).countryCode;
renderHeader(isHome);
renderFooter(isHome);
createIcons({ icons: { ArrowLeft, ArrowUp, ArrowUpRight } });

const navLinks = document.querySelectorAll<HTMLAnchorElement>("header nav a");
function syncNavigation(): void {
  const current =
    location.hash === "#field-guide" || location.hash === "#saved-finds" ? location.hash : "";
  navLinks.forEach((link) => {
    if (location.pathname === "/explore" && link.hash === current)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("hashchange", syncNavigation);
syncNavigation();
if (isHome) {
  document.body.classList.add("is-home");
  const home = document.querySelector<HTMLElement>("#home")!;
  home.hidden = false;
  const globe = home.querySelector<HTMLElement>("#home-globe")!;
  void import("./components/globe/index.ts").then(async ({ initGlobe }) => {
    const map = await initGlobe(globe);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let active = true;
    map.on("remove", () => {
      active = false;
    });
    let last = performance.now();
    const rotate = (now: number) => {
      if (active) {
        if (document.visibilityState !== "visible") last = now;
        else if (now - last >= 32) {
          const elapsed = Math.min(now - last, 200);
          map.setCenter([map.getCenter().lng + elapsed * 0.006, 20]);
          globe.dataset.longitude = String(map.getCenter().lng);
          last = now;
        }
        requestAnimationFrame(rotate);
      }
    };
    requestAnimationFrame(rotate);
  });
}
const shareButton = document.querySelector<HTMLButtonElement>("#share-view-button");
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
if (!isHome) {
  const app = document.querySelector("#app")!;
  if (!app.querySelector("#drawer")) {
    app.insertAdjacentHTML("beforeend", `<aside id="drawer"></aside>`);
  }

  const globeEl = document.querySelector("#globe");
  const drawer = document.querySelector("#drawer");
  let globeLoaded = false;

  function loadGlobe(): void {
    if (globeEl instanceof HTMLElement && !globeLoaded) {
      globeLoaded = true;
      void import("./components/globe/index.ts").then((m) => m.initGlobe(globeEl));
    }
  }

  loadGlobe();

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

      const picker = drawer.querySelector(
        'select[aria-label="Country"]',
      ) as HTMLSelectElement | null;

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
}
