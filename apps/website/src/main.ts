import "./styles/tokens.css";

import { gate } from "utils";

console.log(gate);

document.querySelector("#load-globe")?.addEventListener("click", async () => {
  const { initGlobe } = await import("./components/globe");
  const el = document.querySelector<HTMLElement>("#globe");

  if (el) {
    await initGlobe(el);
  }

  console.log("initGlobe: ", initGlobe);
});
