import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useVisitas(internacaoId?: string) {
  return useQuery({
    queryKey: ['visitas', internacaoId],
    queryFn: async () => {
      // O banco real usa a tabela "visitantes", ligada a "pacientes"
      let query = supabase.from('visitantes').select(`
        *,
        paciente:pacientes(nome)
      `);

      const { data, error } = await query;

      if (error) {
        console.error('[useVisitas] erro Supabase:', error.message, error.details, error.hint);
        throw error;
      }
      return data;
    },
  });
}
