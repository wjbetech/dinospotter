import type { Era } from "../url.ts";
import { toBlurb } from "utils";
import type { EpochBlurb, SitePayload } from "utils";
import { store } from "../store.ts";
import { parseUrl, serializeUrl } from "../url.ts";

type TimescaleJson = {
  records: {
    nam: string;
    eag: number;
    lag: number;
    col: string;
    itp: string;
  }[];
};

let cache: EpochBlurb[] | null = null;

export async function loadBlurbs(): Promise<EpochBlurb[]> {
  if (cache) return cache;

  try {
    const json = await fetch("/data/timescale.json").then(
      (r) => r.json() as Promise<TimescaleJson>,
    );

    cache = json.records.map(toBlurb);

    return cache;
  } catch (error) {
    console.error("Failed to load epoch blurbs:", error);
    return [];
  }
}

export function renderEraStrip(active: Era, dots: Record<Era, string>): HTMLElement {
  const group = document.createElement("div");

  group.setAttribute("role", "radiogroup");

  for (const era of ["Paleozoic", "Mesozoic", "Cenozoic"] as Era[]) {
    const btn = document.createElement("button");
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(era === active));
    btn.textContent = `${era} ${dots[era]}`;
    group.append(btn);
    btn.addEventListener("click", () => void selectEra(era));
  }

  return group;
}

export async function selectEra(era: Era): Promise<void> {
  const { countryCode } = store.getState();
  const key = `${countryCode}:${era}`;

  const cached = store.loadSession(key) as { payload?: SitePayload | null } | null;

  if (cached?.payload?.cards?.length) {
    store.setState({
      era,
      payload: cached.payload as SitePayload,
      status: "ready",
    });

    history.pushState(null, "", "?" + serializeUrl(countryCode, era));
    return;
  }

  store.setState({
    era,
    status: "loading",
  });

  const res = await fetch(`/api/occs?cc=${countryCode}&era=${era}`);

  console.log("selectEra", countryCode, era, res.status);
  res.headers.get("content-type");

  const payload = (await res.json()) as SitePayload;
  console.log("selectEra payload", payload);

  store.setState({
    era,
    payload,
    status: "ready",
  });

  history.pushState(null, "", "?" + serializeUrl(countryCode, era));
}

const init = parseUrl(location.search);

history.replaceState(null, "", "?" + serializeUrl(init.countryCode, init.era));

window.addEventListener("popstate", () => {
  const { countryCode, era } = parseUrl(location.search);
  store.setState({
    countryCode,
    era,
    status: "idle",
  });
});
