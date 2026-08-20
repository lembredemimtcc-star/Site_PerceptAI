import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useCalendario() {
  return useQuery({
    queryKey: ['calendario_eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendario_eventos')
        .select('*');

      if (error) {
        console.error('[useCalendario] Supabase error:', error);
        throw error;
      }
      console.log('[useCalendario] Data loaded:', data?.length ?? 0, 'events');
      // Mapear colunas do banco para o formato esperado pelo frontend
      return (data ?? []).map((row: any) => {
        const inicio = new Date(row.data_hora_inicio);
        return {
          id: row.id,
          data: inicio.toISOString().split('T')[0],
          hora: inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tipo: row.tipo,
          titulo: row.titulo,
        };
      });
    },
    retry: 1,
  });
}