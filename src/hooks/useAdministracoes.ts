import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { pickString } from "../lib/db";

export function useAdministracoes(internacaoId?: string) {
  return useQuery({
    queryKey: ["administracoes", internacaoId],
    retry: false,
    queryFn: async () => {
      const adminRes = await supabase.from("administracoes_medicamento").select("*");
      if (adminRes.error) throw adminRes.error;

      const [presc, meds, internacoes, pacientes, leitos] = await Promise.all([
        supabase.from("prescricoes_medicamentos").select("*"),
        supabase.from("medicamentos").select("*"),
        supabase.from("internacoes").select("*"),
        supabase.from("pacientes").select("id, nome"),
        supabase.from("leitos").select("id, numero"),
      ]);

      const prescById = Object.fromEntries((presc.data ?? []).map((p: any) => [String(p.id), p]));
      const medById = Object.fromEntries((meds.data ?? []).map((m: any) => [String(m.id), m]));
      const intById = Object.fromEntries((internacoes.data ?? []).map((i: any) => [String(i.id), i]));
      const pacById = Object.fromEntries((pacientes.data ?? []).map((p: any) => [String(p.id), p]));
      const leiById = Object.fromEntries((leitos.data ?? []).map((l: any) => [String(l.id), l]));

      const rows = (adminRes.data ?? []).filter((d: any) => {
        if (!internacaoId) return true;
        const prescRow = prescById[String(d.prescricao_id)];
        const id = prescRow?.internacao_id ?? d.internacao_id;
        return String(id) === String(internacaoId);
      });

      return rows.map((admin: any) => {
        const prescRow = prescById[String(admin.prescricao_id)];
        const internacao = intById[String(prescRow?.internacao_id ?? admin.internacao_id)];
        const med = medById[String(prescRow?.medicamento_id ?? admin.medicamento_id)];
        const paciente = pacById[String(internacao?.paciente_id)];
        const leito = leiById[String(internacao?.leito_id)];
        const horarioRaw = admin.data_hora_planejada ?? admin.horario_previsto ?? admin.horario;
        return {
          ...admin,
          mapped: {
            id: admin.id,
            leito: leito?.numero || "??",
            paciente: paciente?.nome || "Desconhecido",
            nome: med?.nome || pickString(admin, "nome") || "Desconhecido",
            via: prescRow?.via_administracao || med?.forma_farmaceutica || med?.forma || "-",
            horario: horarioRaw
              ? new Date(horarioRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "??",
            status: admin.status || "pendente",
            recorrente: false,
          },
        };
      });
    },
  });
}
