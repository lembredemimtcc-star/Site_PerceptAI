import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { pickNumber, pickString, rowTimestamp } from "../lib/db";

export function normalizeExpressao(row: any) {
  return {
    ...row,
    internacao_id: pickString(row, "internacao_id"),
    mood: pickString(row, "mood", "emocao", "tipo_emocao") || "neutro",
    confianca: pickNumber(row, "confianca"),
    timestamp: rowTimestamp(row),
    registrado_em: rowTimestamp(row),
  };
}

export function useExpressoes(internacaoId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!internacaoId) return;

    const channel = supabase
      .channel(`expressoes_faciais_${internacaoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "expressoes_faciais",
          filter: `internacao_id=eq.${internacaoId}`,
        },
        (payload) => {
          queryClient.setQueryData(["expressoes_faciais", internacaoId], (old: any) => {
            const next = normalizeExpressao(payload.new);
            if (!old) return [next];
            return [...old, next].slice(-100);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [internacaoId, queryClient]);

  return useQuery({
    queryKey: ["expressoes_faciais", internacaoId],
    queryFn: async () => {
      if (!internacaoId) return [];

      const { data, error } = await supabase
        .from("expressoes_faciais")
        .select("*")
        .eq("internacao_id", internacaoId)
        .limit(100);

      if (error) throw error;

      return (data ?? [])
        .map(normalizeExpressao)
        .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
        .slice(-100);
    },
    enabled: !!internacaoId,
  });
}
