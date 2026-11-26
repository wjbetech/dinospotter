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
  dialog.append(close, title, summary, metadata, link);
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
