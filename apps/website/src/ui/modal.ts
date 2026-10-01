import type { TaxonCard, TaxonDetail } from "utils";

export function openTaxon(card: TaxonCard, detail: TaxonDetail, returnTo: HTMLElement): void {
  const dialog = document.createElement("div");

  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  dialog.innerHTML = `
    <h2>${card.tna}</h2>
    <a href="${detail.pbdbUrl}">PBDB Source</a>
    <p>${card.eag}-${card.lag} MA · ${card.sfm} · ${card.tid}</p>
  `;

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTaxon(dialog, returnTo);
    } else {
      trap(event, dialog);
    }
  });

  document.body.append(dialog);
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
  returnTo.focus();
}
