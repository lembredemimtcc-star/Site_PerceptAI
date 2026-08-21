import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useEstoque() {
  return useQuery({
    queryKey: ['estoque'],
    queryFn: async () => {
      // Faz a query apenas na tabela 'estoque', pois os tipos indicam que ela
      // tem todos os dados necessários (item, quantidade, unidade, categoria)
      const { data, error } = await supabase
        .from('estoque')
        .select('*');

      if (error) {
        console.error('[useEstoque] Supabase error:', error);
        throw error;
      }
      
      console.log('[useEstoque] Data loaded:', data?.length ?? 0, 'items');
      
      // Mapear colunas do banco (Row de estoque) para o formato esperado pelo frontend
      return (data ?? []).map((row: any) => ({
        id: row.id,
        nome: row.item || 'Item Desconhecido', // A tabela usa 'item' ao invés de 'nome'
        categoria: row.categoria ?? 'insumo',
        quantidade: row.quantidade ?? 0, // A tabela usa 'quantidade' ao invés de 'quantidade_atual'
        minimo: row.quantidade_minima ?? 0,
        unidade: row.unidade ?? 'un',
      }));
    },
    retry: 1,
  });
}