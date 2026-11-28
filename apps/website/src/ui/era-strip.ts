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
  group.className = "my-4 flex gap-2";

  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Geological era");

  for (const era of ["Paleozoic", "Mesozoic", "Cenozoic"] as Era[]) {
    const btn = document.createElement("button");
    btn.className =
      "min-h-11 min-w-0 flex-1 rounded-[var(--radius-control)]! border-boundary! bg-surface! px-2! py-2! text-[0.8125rem]! font-semibold! text-ink! transition-colors hover:border-moss! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[checked=true]:border-moss! aria-[checked=true]:bg-moss! aria-[checked=true]:text-white!";
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
    const payload = { ...cached.payload, cards: cached.payload.cards.slice(0, 12) };
    store.setState({
      era,
      payload,
      status: payload.cards.length ? "ready" : "empty",
      sequence,
    });
    return;
  }
  try {
    const res = await fetch(`/api/occs?cc=${countryCode}&era=${era}`);
    if (!res.ok) throw new Error("upstream");
    const response = (await res.json()) as SitePayload;
    if (!Array.isArray(response.cards)) throw new Error("schema");
    const payload = { ...response, cards: response.cards.slice(0, 12) };
    store.setState({ era, payload, status: payload.cards.length ? "ready" : "empty", sequence });
  } catch {
    if (countryCode === "US" && era === "Mesozoic") {
      try {
        const seed = (await fetch("/data/seed/US-Mesozoic.json").then((r) =>
          r.json(),
        )) as SitePayload;
        store.setState({
          era,
          payload: { ...seed, cards: seed.cards.slice(0, 12) },
          status: "degraded",
          sequence,
        });
        return;
      } catch {
        /* The regular error state also covers a missing seed. */
      }
    }
    store.setState({ era, payload: null, status: "degraded", sequence });
  }
}

const init = parseUrl(location.search);
if (location.pathname !== "/" || init.countryCode)
  history.replaceState(null, "", "?" + serializeUrl(init.countryCode, init.era, init.txn));
window.addEventListener("popstate", () => {
  const { countryCode, era } = parseUrl(location.search);
  store.setState({ countryCode, payload: null, status: "idle" });
  void selectEra(era, false);
});
