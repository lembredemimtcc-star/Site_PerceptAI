import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { pickNumber, rowTimestamp } from "../lib/db";

export function normalizeVital(row: any) {
  return {
    ...row,
    hr: pickNumber(row, "hr", "fc"),
    spo2: pickNumber(row, "spo2"),
    fr: pickNumber(row, "fr"),
    temperatura: pickNumber(row, "temperatura", "temp"),
    pressao_arterial: row?.pressao_arterial ?? row?.pa ?? null,
    timestamp: rowTimestamp(row),
    registrado_em: rowTimestamp(row),
  };
}

export function useSinaisVitais(internacaoId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!internacaoId) return;

    const channel = supabase
      .channel(`sinais_vitais_${internacaoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sinais_vitais",
          filter: `internacao_id=eq.${internacaoId}`,
        },
        (payload) => {
          queryClient.setQueryData(["sinais_vitais", internacaoId], (old: any) => {
            const next = normalizeVital(payload.new);
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
    queryKey: ["sinais_vitais", internacaoId],
    queryFn: async () => {
      if (!internacaoId) return [];

      const { data, error } = await supabase
        .from("sinais_vitais")
        .select("*")
        .eq("internacao_id", internacaoId)
        .limit(100);

      if (error) throw error;

      return (data ?? [])
        .map(normalizeVital)
        .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
        .slice(-100);
    },
    enabled: !!internacaoId,
  });
}
