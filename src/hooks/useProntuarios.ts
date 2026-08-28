import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useProntuario(internacaoId?: string) {
  return useQuery({
    queryKey: ["prontuarios", internacaoId],
    enabled: !!internacaoId,
    queryFn: async () => {
      // HACK: Convert number ID to UUID since DB schema is mismatched
      const intIdStr = String(internacaoId);
      const uuidHack = intIdStr.includes("-") ? intIdStr : `00000000-0000-0000-0000-${intIdStr.padStart(12, '0')}`;

      const { data, error } = await supabase
        .from("prontuarios")
        .select("*")
        .eq("internacao_id", uuidHack)
        .order("atualizado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        const fallback = await supabase
          .from("prontuarios")
          .select("*")
          .eq("internacao_id", uuidHack)
          .limit(1)
          .maybeSingle();
        if (fallback.error) return null;
        return fallback.data;
      }
      return data;
    },
  });
}
