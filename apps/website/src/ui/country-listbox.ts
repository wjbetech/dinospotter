export function renderCountryListBox(
  countries: {
    countryCode: string;
    name: string;
  }[],
  onPick: (c: { countryCode: string }) => void,
): HTMLSelectElement {
  const selector = document.createElement("select");
  selector.setAttribute("aria-label", "Country");

  selector.append(
    Object.assign(document.createElement("option"), {
      value: "",
      textContent: "Pick a country",
      disabled: true,
      selected: true,
    }),
  );
  for (const country of countries) {
    selector.append(
      Object.assign(document.createElement("option"), {
        value: country.countryCode,
        textContent: country.name,
      }),
    );
  }

  selector.addEventListener("change", () => onPick({ countryCode: selector.value }));

  return selector;
}
