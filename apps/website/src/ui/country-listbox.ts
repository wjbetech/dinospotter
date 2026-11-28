export function renderCountryListBox(
  countries: {
    countryCode: string;
    name: string;
  }[],
  onPick: (c: { countryCode: string }) => void,
): HTMLSelectElement {
  const selector = document.createElement("select");
  selector.className =
    "min-h-11 w-full rounded-[var(--radius-control)]! border-boundary! bg-surface! px-3! py-2! text-base text-ink shadow-inner focus-visible:border-moss! focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus";
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
