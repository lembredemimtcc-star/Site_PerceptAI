import { COLORS } from "../../config/colors";
import { EventoCalendario, TipoEvento, TipoEventoKey } from "./calendario.types";

export const eventTypeMeta: Record<TipoEventoKey, TipoEvento> = {
  plantao: { label: "Plantão", color: COLORS.orange },
  consulta: { label: "Consulta", color: COLORS.green },
  procedimento: { label: "Procedimento", color: COLORS.red },
};

export const calendarEvents: EventoCalendario[] = [
  { data: "2026-07-27", hora: "07:00", titulo: "Plantão UTI 2 — Dra. Marina", tipo: "plantao" },
  { data: "2026-07-29", hora: "14:30", titulo: "Consulta pós-op — Leito 12", tipo: "consulta" },
  { data: "2026-07-30", hora: "09:00", titulo: "Procedimento — Traqueostomia", tipo: "procedimento" },
];