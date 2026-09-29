import "./styles/tokens.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";

import { renderCountryListBox } from "./ui/country-listbox.ts";
import { serializeUrl } from "./url.ts";

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
        { cc: "US", name: "United States" },
        { cc: "UK", name: "United Kingdom" },
        { cc: "DE", name: "Germany" },
        { cc: "FR", name: "France" },
        { cc: "SK", name: "South Korea" },
      ],
      (cc) => {
        history.pushState(null, "", `${serializeUrl(cc, "Mesozoic")}`);
      },
    ),
  );
}
