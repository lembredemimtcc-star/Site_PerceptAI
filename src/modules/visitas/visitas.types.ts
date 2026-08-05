export interface Visita {
  leito: string;
  paciente: string; // NOVO — nome do paciente, preenchido automaticamente ao selecionar o leito
  visitante: string;
  parentesco: string;
  entrada: string;
  saida: string;
  status: "em-andamento" | "agendada" | "finalizada";
}