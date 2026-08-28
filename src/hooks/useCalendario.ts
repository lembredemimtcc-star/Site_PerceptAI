import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { pickString } from "../lib/db";

export function useCalendario() {
  return useQuery({
    queryKey: ["calendario_eventos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("calendario_eventos").select("*");
      if (error) throw error;

      return (data ?? []).map((row: any) => {
        const inicioRaw = pickString(row, "data_hora_inicio", "data_inicio");
        const inicio = inicioRaw ? new Date(inicioRaw) : new Date();
        return {
          id: row.id,
          data: Number.isNaN(inicio.getTime())
            ? String(inicioRaw).slice(0, 10)
            : inicio.toISOString().split("T")[0],
          hora: Number.isNaN(inicio.getTime())
            ? ""
            : inicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tipo: row.tipo,
          titulo: row.titulo,
        };
      });
    },
    retry: 1,
  });
}
