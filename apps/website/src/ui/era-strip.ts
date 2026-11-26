import { type Era, parseUrl, serializeUrl } from "../url.ts";
import { toBlurb } from "utils";
import type { EpochBlurb, SitePayload } from "utils";
import { store } from "../store.ts";

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
  group.setAttribute("aria-label", "Geological era");

  for (const era of ["Paleozoic", "Mesozoic", "Cenozoic"] as Era[]) {
    const btn = document.createElement("button");
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(era === active));
    btn.textContent = era;
    btn.style.setProperty("--era-color", dots[era]);
    group.append(btn);
    btn.addEventListener("click", () => void selectEra(era));
  }

  return group;
}

export async function selectEra(era: Era, pushHistory = true): Promise<void> {
  const { countryCode } = store.getState();
  const sequence = store.nextSeq();
  const key = `${countryCode}:${era}`;
  const current = parseUrl(location.search);
  const txn = current.countryCode === countryCode && current.era === era ? current.txn : null;
  if (pushHistory && (current.countryCode !== countryCode || current.era !== era)) {
    history.pushState(null, "", "?" + serializeUrl(countryCode, era, txn));
  }
  const cached = store.loadSession(key) as { payload?: SitePayload | null } | null;
  store.setState({ era, payload: null, status: countryCode ? "loading" : "idle", sequence });
  if (!countryCode) return;
  if (Array.isArray(cached?.payload?.cards)) {
    store.setState({
      era,
      payload: cached.payload,
      status: cached.payload.cards.length ? "ready" : "empty",
      sequence,
    });
    return;
  }
  try {
    const res = await fetch(`/api/occs?cc=${countryCode}&era=${era}`);
    if (!res.ok) throw new Error("upstream");
    const payload = (await res.json()) as SitePayload;
    if (!Array.isArray(payload.cards)) throw new Error("schema");
    store.setState({ era, payload, status: payload.cards.length ? "ready" : "empty", sequence });
  } catch {
    if (countryCode === "US" && era === "Mesozoic") {
      try {
        const seed = (await fetch("/data/seed/US-Mesozoic.json").then((r) =>
          r.json(),
        )) as SitePayload;
        store.setState({ era, payload: seed, status: "degraded", sequence });
        return;
      } catch {
        /* The regular error state also covers a missing seed. */
      }
    }
    store.setState({ era, payload: null, status: "degraded", sequence });
  }
}

const init = parseUrl(location.search);
history.replaceState(null, "", "?" + serializeUrl(init.countryCode, init.era, init.txn));
window.addEventListener("popstate", () => {
  const { countryCode, era } = parseUrl(location.search);
  store.setState({ countryCode, payload: null, status: "idle" });
  void selectEra(era, false);
});
