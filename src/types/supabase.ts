export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nome: string;
          funcao: 'medico' | 'enfermeiro' | 'admin';
          crm?: string | null;
          especialidade?: string | null;
          criado_em: string;
        };
      };
      pacientes: {
        Row: {
          id: string;
          nome: string;
          cpf: string;
          data_nascimento: string;
          diagnostico: string | null;
          convenio: string | null;
          criado_em: string;
        };
      };
      leitos: {
        Row: {
          id: string;
          numero: string;
          status: 'livre' | 'ocupado' | 'manutencao';
          criado_em: string;
        };
      };
      internacoes: {
        Row: {
          id: string;
          paciente_id: string;
          leito_id: string;
          medico_id: string | null;
          data_entrada: string;
          data_alta: string | null;
          ativo: boolean;
          risco: 'normal' | 'attention' | 'critical';
          criado_em: string;
        };
      };
      sinais_vitais: {
        Row: {
          id: string;
          internacao_id: string;
          hr: number | null;
          spo2: number | null;
          temperatura: number | null;
          pressao_arterial: string | null;
          registrado_em: string;
        };
      };
      expressoes_faciais: {
        Row: {
          id: string;
          internacao_id: string;
          mood: 'dor' | 'medo' | 'tristeza' | 'enjoo' | 'sono' | 'dormindo' | 'acordado' | 'neutro';
          confianca: number;
          intensidade: number; // para cálculo de dor, por exemplo
          registrado_em: string;
        };
      };
      medicamentos: {
        Row: {
          id: string;
          nome: string;
          dosagem: string;
          forma: string;
          criado_em: string;
        };
      };
      administracoes_medicamento: {
        Row: {
          id: string;
          internacao_id: string;
          medicamento_id: string;
          administrado_por: string;
          horario_previsto: string;
          horario_administrado: string | null;
          status: 'pendente' | 'administrado' | 'atrasado' | 'cancelado';
          observacao: string | null;
          criado_em: string;
        };
      };
      visitantes: {
        Row: {
          id: string;
          nome: string;
          documento: string;
          parentesco: string;
          criado_em: string;
        };
      };
      visitas: {
        Row: {
          id: string;
          internacao_id: string;
          visitante_id: string;
          data_entrada: string;
          data_saida: string | null;
          status: 'ativa' | 'concluida';
        };
      };
      calendario_eventos: {
        Row: {
          id: string;
          titulo: string;
          descricao: string | null;
          tipo: 'exame' | 'cirurgia' | 'retorno' | 'outro';
          data_inicio: string;
          data_fim: string;
          internacao_id: string | null;
          criado_em: string;
        };
      };
      estoque: {
        Row: {
          id: string;
          item: string;
          quantidade: number;
          unidade: string;
          quantidade_minima: number;
          categoria: 'medicamento' | 'insumo' | 'equipamento';
          ultima_atualizacao: string;
        };
      };
    };
  };
}

// Helpers type para facilitar as queries e componentes
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
