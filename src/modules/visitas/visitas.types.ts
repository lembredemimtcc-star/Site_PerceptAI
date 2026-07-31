export interface Visita {
  leito: string;
  visitante: string;
  parentesco: string;
  entrada: string;
  saida: string;
  status: "em-andamento" | "agendada" | "finalizada";
}
