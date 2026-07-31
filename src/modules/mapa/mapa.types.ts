export interface SalaPositao {
  id: string;
  x: number;
  y: number;
  status: "critical" | "attention" | "normal";
}

export interface EquipamentoMapa {
  label: string;
  x: number;
  y: number;
  ts: string;
}
