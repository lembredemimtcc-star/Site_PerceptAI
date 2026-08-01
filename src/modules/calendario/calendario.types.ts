export type TipoEventoKey = "plantao" | "procedimento" | "consulta";

export interface EventoCalendario {
  data: string; // ISO "2026-07-27"
  hora: string;
  tipo: TipoEventoKey;
  titulo: string;
}

export interface TipoEvento {
  label: string;
  color: string;
}