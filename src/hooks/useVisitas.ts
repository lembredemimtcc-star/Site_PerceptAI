import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { pickString } from "../lib/db";

export function useVisitas() {
  return useQuery({
    queryKey: ["visitas"],
    retry: false,
    queryFn: async () => {
      let rowsRes = await supabase.from("visitantes").select("*");
      if (rowsRes.error) {
        rowsRes = await supabase.from("visitas").select("*");
      }
      if (rowsRes.error) throw rowsRes.error;

      const [pacientes, internacoes, leitos] = await Promise.all([
        supabase.from("pacientes").select("id, nome"),
        supabase.from("internacoes").select("*"),
        supabase.from("leitos").select("id, numero"),
      ]);

      const pacById = Object.fromEntries((pacientes.data ?? []).map((p: any) => [String(p.id), p]));
      const leiById = Object.fromEntries((leitos.data ?? []).map((l: any) => [String(l.id), l]));
      const internacoesList = internacoes.data ?? [];

      return (rowsRes.data ?? []).map((row: any) => {
        const pacienteId = pickString(row, "paciente_id") || row.paciente?.id;
        const paciente = pacById[String(pacienteId)];
        const internacao =
          internacoesList.find((i: any) => String(i.id) === String(row.internacao_id)) ||
          internacoesList.find((i: any) => String(i.paciente_id) === String(pacienteId) && i.ativo !== false);
        const leito = leiById[String(internacao?.leito_id)];
        return {
          id: row.id,
          internacao_id: pickString(row, "internacao_id") || internacao?.id,
          paciente_id: pacienteId,
          leito: leito?.numero ?? "??",
          paciente: paciente?.nome || "",
          visitante: pickString(row, "nome", "nome_visitante") || "Desconhecido",
          parentesco: pickString(row, "parentesco") || "-",
          data_entrada: row.data_entrada,
          data_saida: row.data_saida,
          status: row.status,
        };
      });
    },
  });
}
