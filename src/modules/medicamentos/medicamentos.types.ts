export interface Medicamento {
  id: number | string;
  internacaoId?: string;
  leito: string;
  paciente: string;
  nome: string;
  via: string;
  horario: string;
  status: "administrado" | "pendente" | "atrasado";
  recorrente: boolean;
}