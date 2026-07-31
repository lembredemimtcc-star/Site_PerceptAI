export interface Medicamento {
  id: number;
  leito: string;
  paciente: string;
  nome: string;
  via: string;
  horario: string;
  status: "administrado" | "pendente" | "atrasado";
}
