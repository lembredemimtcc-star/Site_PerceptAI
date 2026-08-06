export interface Paciente {
  id: string;
  nome: string;
  idade: number;
  leito: string;
  sexo?: "M" | "F";
  condicao?: string;
}

export interface SinaisVitais {
  pa: string;
  fc: string;
  fr: string;
  temp: string;
}

export interface PrescricaoItem {
  id: string;
  medicamento: string;
  dose: string;
  frequencia: string;
  duracao: string;
  observacoes: string;
}

export type TipoExame = "laboratorial" | "imagem" | "funcional" | "outro";

export type UrgenciaExame = "rotina" | "urgente" | "emergencia";

export interface ExameItem {
  id: string;
  nome: string;
  tipo: TipoExame | "";
  urgencia: UrgenciaExame | "";
  observacoes: string;
}

export interface ProntuarioFormData {
  queixaPrincipal: string;
  historiaDoenca: string;
  avaliacao: string;
  orientacoes: string;
  sinaisVitais: SinaisVitais;
  prescricoes: PrescricaoItem[];
  exames: ExameItem[];
}