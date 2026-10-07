import type { TaxonCard, TaxonDetail } from "utils";
import { serializeUrl } from "../url.ts";
import { store } from "../store.ts";

export function openTaxon(card: TaxonCard, detail: TaxonDetail, returnTo: HTMLElement): void {
  if (document.querySelector('[role="dialog"]')) return;

  const dialog = document.createElement("div");

  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const closeButton = document.createElement("button");

  closeButton.textContent = "Close";
  closeButton.addEventListener("click", () => {
    closeTaxon(dialog, returnTo);
  });

  dialog.innerHTML = `
    <h2>${card.tna}</h2>
    <a href="${detail.pbdbUrl}">PBDB Source</a>
    <p>${card.eag}-${card.lag} MA · ${card.sfm} · ${card.tid}</p>
  `;

  dialog.prepend(closeButton);
  dialog.className = "modal-panel";
  dialog.style.cssText =
    "position:fixed;inset:5%;background:#fff;border:1px solid #E5DED0;border-radius:12px;padding:16px;z-index:50";

  const firstLink = dialog.querySelector("a") as HTMLElement | null;

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTaxon(dialog, returnTo);
    } else {
      trap(event, dialog);
    }
    if (firstLink) firstLink.focus();
  });

  dialog.setAttribute("tabindex", "-1");
  document.body.append(dialog);
  dialog.focus();
  document.body.style.overflow = "hidden";
}

export function trap(event: KeyboardEvent, dialog: HTMLElement): void {
  if (event.key !== "Tab") return;

  const focusables = [...dialog.querySelectorAll("button, a[href]")] as HTMLElement[];
  const firstFocus = focusables[0];
  const lastFocus = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === firstFocus) {
    lastFocus.focus();
    event.preventDefault();
  }

  if (!event.shiftKey && document.activeElement === lastFocus) {
    firstFocus.focus();
    event.preventDefault();
  }
}

export function closeTaxon(dialog: HTMLElement, returnTo: HTMLElement): void {
  dialog.remove();
  document.body.style.overflow = "";
  history.replaceState(
    null,
    "",
    `?${serializeUrl(store.getState().countryCode, store.getState().era)}`,
  );
  returnTo.focus();
}
