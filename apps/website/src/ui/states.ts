import type { Era } from "../url.ts";
import type { Status } from "../store.ts";

export function copyFor(status: Status, country: string | null, era: Era): string {
  if (!country) {
    return "Pick a country to start!";
  }

  if (status == "loading") {
    return "Loading fossil records...";
  }

  if (status === "degraded") {
    return "PBDB Dinosaur Database is unavailable. Showing cached data.";
  }

  if (status === "empty") {
    return `No recorded taxonomical data for ${country} in the ${era} Era. Try another era!`;
  }

  if (status === "error") {
    return "Error occurred. Please try again.";
  }

  return "";
}

export function renderFootnote(): HTMLElement {
  const footnoteEl = document.createElement("p");

  footnoteEl.textContent = "Sites plotted at modern coordinates.";

  return footnoteEl;
}
