import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAdministracoes(internacaoId?: string) {
  return useQuery({
    queryKey: ['administracoes', internacaoId],
    queryFn: async () => {
      let query = supabase.from('administracoes_medicamento').select(`
        *,
        medicamento:medicamentos(nome, dosagem, forma),
        internacao:internacoes(
          paciente:pacientes(nome),
          leito:leitos(numero)
        )
      `);
      if (internacaoId) {
        query = query.eq('internacao_id', internacaoId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
