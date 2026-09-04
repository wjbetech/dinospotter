export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";

export interface EraDescription {
  name: string;
  era: Era;
  lag: number;
  eag: number;
  color: string;
  description: string;
}

export interface TaxonCard {
  tna: string;
  tid: string;
  oei: string;
  eag: number;
  lag: number;
  lng: number;
  lat: number;
}
