import "./styles/tokens.css";

const loadGlobe = () => import("./components/globe/index.ts");

document.querySelector("#app")!.innerHTML = `
  <div id="globe"></div><aside id="drawer"></aside>
`;

document.querySelector("#globe")?.addEventListener("click", () => loadGlobe());
