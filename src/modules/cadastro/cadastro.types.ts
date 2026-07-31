export interface PacienteCadastro {
  nome: string;
  cpf: string;
  dataNascimento: string;
  convenio: string;
  leito: string;
  contatoEmergencia: string;
  alergias: string;
  diagnostico: string;
}

export interface CadastroRecente {
  nome: string;
  leito: string;
  data: string;
}
