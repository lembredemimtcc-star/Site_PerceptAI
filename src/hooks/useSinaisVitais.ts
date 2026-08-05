import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSinaisVitais(internacaoId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!internacaoId) return;

    const channel = supabase
      .channel(`sinais_vitais_${internacaoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sinais_vitais',
          filter: `internacao_id=eq.${internacaoId}`,
        },
        (payload) => {
          queryClient.setQueryData(['sinais_vitais', internacaoId], (old: any) => {
            if (!old) return [payload.new];
            return [...old, payload.new].slice(-100); // manter os últimos 100
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [internacaoId, queryClient]);

  return useQuery({
    queryKey: ['sinais_vitais', internacaoId],
    queryFn: async () => {
      if (!internacaoId) return [];
      
      const { data, error } = await supabase
        .from('sinais_vitais')
        .select('*')
        .eq('internacao_id', internacaoId)
        .order('registrado_em', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!internacaoId,
  });
}
