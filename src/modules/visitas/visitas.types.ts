export interface Visita {
  id?: string;
  internacaoId?: string;
  pacienteId?: string;
  leito: string;
  paciente: string;
  visitante: string;
  parentesco: string;
  entrada: string;
  saida: string;
  status: "em-andamento" | "agendada" | "finalizada";
}