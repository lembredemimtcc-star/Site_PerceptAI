export const calendarDays = ["Seg 27", "Ter 28", "Qua 29", "Qui 30", "Sex 31", "Sáb 01", "Dom 02"];

export const calendarEvents = [
  { dia: 0, hora: "08:00", tipo: "plantao" as const,     titulo: "Troca de plantão — Equipe A" },
  { dia: 1, hora: "10:00", tipo: "procedimento" as const,titulo: "Traqueostomia — Leito 407" },
  { dia: 2, hora: "09:00", tipo: "consulta" as const,    titulo: "Visita médica — Dr. Almeida" },
  { dia: 3, hora: "14:00", tipo: "consulta" as const,    titulo: "Avaliação — Leito 402" },
  { dia: 3, hora: "08:00", tipo: "plantao" as const,     titulo: "Troca de plantão — Equipe B" },
  { dia: 4, hora: "11:00", tipo: "procedimento" as const,titulo: "Diálise — Leito 405" },
  { dia: 5, hora: "09:30", tipo: "consulta" as const,    titulo: "Visita médica — Dra. Ferraz" },
];

export const eventTypeMeta = {
  plantao:      { label: "Plantão",     color: "#67727E" },
  procedimento: { label: "Procedimento",color: "#E14545" },
  consulta:     { label: "Consulta",    color: "#F2652E" },
};
