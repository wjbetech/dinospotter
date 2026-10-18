export interface City {
  name: string;
  iso2: string;
  capital: boolean;
  pop: number;
  lng: number;
  lat: number;
}

export function majorCities(places: City[], iso2: string, count = 3): City[] {
  const countryCode = iso2.toUpperCase();
  const local = places.filter((place) => place.iso2 === countryCode);
  const rest = local
    .filter((place) => !place.capital)
    .sort((a, b) => b.pop - a.pop || a.name.localeCompare(b.name))
    .slice(0, count);

  return [...local.filter((place) => place.capital), ...rest];
}
