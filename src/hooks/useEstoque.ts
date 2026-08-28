import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { pickNumber, pickString } from "../lib/db";

export function useEstoque() {
  return useQuery({
    queryKey: ["estoque"],
    queryFn: async () => {
      const joined = await supabase.from("estoque").select(`
        *,
        medicamento:medicamentos(nome, categoria, unidade_medida, forma_farmaceutica)
      `);

      const result = joined.error
        ? await supabase.from("estoque").select("*")
        : joined;

      if (result.error) throw result.error;

      return (result.data ?? []).map((row: any) => ({
        id: row.id,
        nome: pickString(row, "item", "nome") || row.medicamento?.nome || "Item",
        categoria: pickString(row, "categoria") || row.medicamento?.categoria || "insumo",
        quantidade: pickNumber(row, "quantidade", "quantidade_atual"),
        minimo: pickNumber(row, "quantidade_minima", "minimo"),
        unidade: pickString(row, "unidade") || row.medicamento?.unidade_medida || "un",
        medicamento_id: row.medicamento_id ?? null,
      }));
    },
    retry: 1,
  });
}
