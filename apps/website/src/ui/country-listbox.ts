export function renderCountryListBox(
  countries: {
    cc: string;
    name: string;
  }[],
  onPick: (cc: string) => void,
): HTMLSelectElement {
  const selector = document.createElement("select");
  selector.setAttribute("aria-label", "Country");

  for (const country of countries) {
    selector.append(
      Object.assign(document.createElement("option"), {
        value: country.cc,
        textContent: country.name,
      }),
    );
  }
  selector.addEventListener("change", () => onPick(selector.value));

  return selector;
}
