import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useVisitas(internacaoId?: string) {
  return useQuery({
    queryKey: ['visitas', internacaoId],
    queryFn: async () => {
      let query = supabase.from('visitas').select(`
        *,
        visitante:visitantes(*),
        internacao:internacoes(leito:leitos(numero))
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
