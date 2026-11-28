import { savedFinds, toggleSaved } from "./selection.ts";
import { artworkFor } from "utils";
import type { TaxonCard, TaxonDetail } from "utils";
import { serializeUrl } from "../url.ts";
import { store } from "../store.ts";

export function openTaxon(
  card: TaxonCard,
  detail: TaxonDetail,
  returnTo: HTMLElement,
): HTMLDialogElement | null {
  if (document.querySelector("dialog[open]")) return null;
  const dialog = document.createElement("dialog");
  dialog.className = "modal-panel";
  dialog.setAttribute("aria-labelledby", "taxon-title");
  const close = document.createElement("button");
  close.textContent = "Close";
  close.addEventListener("click", () => dialog.close());
  const title = document.createElement("h2");
  title.id = "taxon-title";
  title.textContent = card.tna;
  const summary = document.createElement("p");
  summary.textContent = `${card.eag}–${card.lag} Ma · ${card.sfm || "Formation not recorded"}`;
  const metadata = document.createElement("p");
  metadata.className = "taxon-metadata";
  metadata.setAttribute("role", "status");
  metadata.textContent = detail.rank;
  const link = document.createElement("a");
  link.textContent = "PBDB Source";
  link.href = `https://paleobiodb.org/classic/checkTaxonInfo?taxon_no=${encodeURIComponent(card.tid.replace(/^txn:/, ""))}`;
  const art = document.createElement("span");
  art.className = "taxon-art detail-art";
  art.dataset.kind = artworkFor(card.tna, card);
  art.style.setProperty("--silhouette", "url(/sprites/" + art.dataset.kind + ".svg)");
  art.setAttribute("aria-hidden", "true");
  const save = document.createElement("button");
  const context = store.getState();
  const updateSave = () => {
    const saved = savedFinds().some(
      (find) =>
        find.card.tid === card.tid &&
        find.country === context.countryCode &&
        find.era === context.era,
    );
    save.textContent = saved ? "Remove saved find" : "Save find";
    save.setAttribute("aria-pressed", String(saved));
  };
  updateSave();
  save.addEventListener("click", () => {
    if (
      context.countryCode &&
      toggleSaved({ card, country: context.countryCode, era: context.era })
    )
      updateSave();
    else save.textContent = "Storage unavailable in this browser";
  });
  const facts = document.createElement("dl");
  facts.className = "specimen-facts";
  for (const [label, value] of [
    ["Age", `${card.eag}–${card.lag} million years ago`],
    ["Formation", card.sfm || "Not recorded"],
    ["Recorded findsites", String(card.sites.length)],
    ["Era", context.era],
  ]) {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    facts.append(term, description);
  }
  summary.textContent = "A fossil group represented in the selected country's featured records.";
  link.textContent = "View evidence in the Paleobiology Database";
  dialog.append(close, title, art, summary, facts, metadata, save, link);
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener(
    "close",
    () => {
      dialog.remove();
      document.body.style.overflow = "";
      history.replaceState(
        null,
        "",
        `?${serializeUrl(store.getState().countryCode, store.getState().era)}`,
      );
      returnTo.focus({ preventScroll: true });
    },
    { once: true },
  );
  document.body.append(dialog);
  dialog.showModal();
  close.focus();
  document.body.style.overflow = "hidden";
  return dialog;
}
