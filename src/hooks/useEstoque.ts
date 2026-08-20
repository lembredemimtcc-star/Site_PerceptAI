import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useEstoque() {
  return useQuery({
    queryKey: ['estoque'],
    queryFn: async () => {
      // Primeiro tenta buscar com join para medicamentos
      let { data, error } = await supabase
        .from('estoque')
        .select('*, medicamentos(nome, categoria, unidade)');

      if (error) {
        console.error('[useEstoque] Supabase error (with join):', error);
        // Fallback: busca sem join
        const { data: data2, error: error2 } = await supabase
          .from('estoque')
          .select('*');
        if (error2) {
          console.error('[useEstoque] Supabase error (fallback):', error2);
          throw error2;
        }
        data = data2;
      }
      console.log('[useEstoque] Data loaded:', data?.length ?? 0, 'items');
      // Mapear colunas do banco para o formato esperado pelo frontend
      return (data ?? []).map((row: any) => ({
        id: row.id,
        nome: row.medicamentos?.nome ?? `Medicamento ${row.medicamento_id}`,
        categoria: row.medicamentos?.categoria ?? 'medicamento',
        quantidade: row.quantidade_atual,
        minimo: row.quantidade_minima,
        unidade: row.medicamentos?.unidade ?? 'un',
      }));
    },
    retry: 1,
  });
}