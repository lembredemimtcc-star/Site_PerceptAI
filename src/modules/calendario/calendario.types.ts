export interface EventoCalendario {
  dia: number;
  hora: string;
  tipo: "plantao" | "procedimento" | "consulta";
  titulo: string;
}

export interface TipoEvento {
  label: string;
  color: string;
}
