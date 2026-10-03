import "./styles/tokens.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";

import { store } from "./store.ts";
import { renderCards } from "./ui/cards.ts";
import { renderSkeleton } from "./ui/skeleton.ts";
import { renderCountryListBox } from "./ui/country-listbox.ts";
import { serializeUrl } from "./url.ts";
import { selectEra } from "./ui/era-strip.ts";

document.querySelector("#app")!.innerHTML = `<div id="globe"></div><aside id="drawer"></aside>`;

const globeEl = document.querySelector("#globe");
if (globeEl instanceof HTMLElement) {
  void import("./components/globe/index.ts").then((map) => map.initGlobe(globeEl));
}

const drawer = document.querySelector("#drawer");

if (drawer instanceof HTMLElement) {
  drawer.append(
    renderCountryListBox(
      [
        { countryCode: "US", name: "United States" },
        { countryCode: "UK", name: "United Kingdom" },
        { countryCode: "DE", name: "Germany" },
        { countryCode: "FR", name: "France" },
        { countryCode: "SK", name: "South Korea" },
      ],
      (c) => {
        console.log("onPick", c.countryCode);
        const era = store.getState().era;
        history.pushState(null, "", "?" + serializeUrl(c.countryCode, era));
        store.setState({
          countryCode: c.countryCode,
        });
        void selectEra(era);
      },
    ),
  );

  store.subscribe(() => {
    const { payload, status } = store.getState();

    console.log("store", status, payload);

    drawer.querySelectorAll(".skeleton, .card").forEach((el) => el.remove());

    if (status === "loading") {
      const s = renderSkeleton();
      s.classList.add("skeleton");
      drawer.append(s);
    } else if (payload) {
      renderCards(drawer, payload.cards);
    }
  });
}
