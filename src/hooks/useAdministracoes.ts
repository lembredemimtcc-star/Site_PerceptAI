import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAdministracoes(internacaoId?: string) {
  return useQuery({
    queryKey: ['administracoes', internacaoId],
    queryFn: async () => {
      // O banco real vincula administracoes_medicamento -> prescricoes_medicamentos -> medicamentos / internacoes
      let query = supabase.from('administracoes_medicamento').select(`
        *,
        prescricao:prescricoes_medicamentos(
          *,
          medicamento:medicamentos(nome, forma_farmaceutica),
          internacao:internacoes(
            paciente:pacientes(nome),
            leito:leitos(numero)
          )
        )
      `);
      
      // Se tiver internacaoId, precisaríamos filtrar pela tabela aninhada (o que é mais difícil no PostgREST direto)
      // Como a UI geralmente carrega todas as administrações para a tela Medicamentos (internacaoId é undefined), vai funcionar.
      // Caso precise filtrar, fazemos no frontend por enquanto se vier internacaoId.
      
      const { data, error } = await query;
      if (error) {
        console.error('[useAdministracoes] erro Supabase:', error.message, error.details, error.hint);
        throw error;
      }
      
      if (internacaoId && data) {
         return data.filter((d: any) => d.prescricao?.internacao_id?.toString() === String(internacaoId));
      }

      return data;
    },
  });
}
