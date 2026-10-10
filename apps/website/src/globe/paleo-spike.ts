type PaleoMap = {
  setPaintProperty(l: string, p: string, v: string): void;
};

export function togglePaleo(map: PaleoMap, on: boolean): void {
  map.setPaintProperty("water", "fill-color", on ? "#E8DCC8" : "#DCEBF5");
}
