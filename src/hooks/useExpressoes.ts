import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useExpressoes(internacaoId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!internacaoId) return;

    const channel = supabase
      .channel(`expressoes_faciais_${internacaoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expressoes_faciais',
          // internacao_id é UUID/string — sem aspas o filtro Realtime funciona
          filter: `internacao_id=eq.${internacaoId}`,
        },
        (payload) => {
          queryClient.setQueryData(['expressoes_faciais', internacaoId], (old: any) => {
            if (!old) return [payload.new];
            return [...old, payload.new].slice(-100);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [internacaoId, queryClient]);

  return useQuery({
    queryKey: ['expressoes_faciais', internacaoId],
    queryFn: async () => {
      if (!internacaoId) return [];

      const { data, error } = await supabase
        .from('expressoes_faciais')
        .select('*')
        .eq('internacao_id', internacaoId)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) {
        console.error('[useExpressoes] erro Supabase:', error.message, error.details, error.hint);
        throw error;
      }
      return data;
    },
    enabled: !!internacaoId,
  });
}
