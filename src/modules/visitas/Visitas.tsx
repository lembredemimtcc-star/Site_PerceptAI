import React, { useState } from "react";
import { Info, UserCheck, Clock, UserX, Plus } from "lucide-react";
import { toast } from "sonner";
import { TopBar, WireframeAvatar } from "../../shared/components";
import { Visita } from "./visitas.types";
import { NovaVisitaModal } from "../../components/modals/NovaVisitaModal";
import {
  visitasStyles as styles,
  statusCfg,
  getStatusBadgeStyle,
} from "./Visitas.styles";

import { useBeds, useVisitas } from "../../hooks";
import { atualizarVisitaStatus, criarVisita } from "../../lib/mutations";

const statusIconMap = {
  "em-andamento": UserCheck,
  agendada: Clock,
  finalizada: UserX,
};

function mapStatus(raw: string | null | undefined, dataSaida: string | null): Visita["status"] {
  if (raw === "concluida" || raw === "finalizada") return "finalizada";
  if (raw === "em-andamento" || raw === "em_andamento") return "em-andamento";
  if (raw === "agendada") return "agendada";
  return dataSaida ? "finalizada" : "agendada";
}

export const Visitas: React.FC = () => {
  const { data: supabaseVisitas = [], refetch } = useVisitas();
  const { data: beds = [] } = useBeds();
  const [modalOpen, setModalOpen] = useState(false);

  const visitasData: Visita[] = supabaseVisitas.map((dbVisita: any) => {
    const formatTime = (ts: string | null) =>
      ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "??:??";
    return {
      id: dbVisita.id,
      internacaoId: dbVisita.internacao_id,
      pacienteId: dbVisita.paciente_id,
      leito: dbVisita.leito || "??",
      paciente: dbVisita.paciente || "",
      visitante: dbVisita.visitante || "Desconhecido",
      parentesco: dbVisita.parentesco || "-",
      entrada: formatTime(dbVisita.data_entrada),
      saida: formatTime(dbVisita.data_saida) === "??:??" ? "---" : formatTime(dbVisita.data_saida),
      status: mapStatus(dbVisita.status, dbVisita.data_saida),
    };
  });

  const handleAddVisita = async (visita: Visita) => {
    try {
      await criarVisita({
        ...(visita.internacaoId !== undefined ? { internacaoId: visita.internacaoId } : {}),
        ...(visita.pacienteId !== undefined ? { pacienteId: visita.pacienteId } : {}),
        visitante: visita.visitante,
        parentesco: visita.parentesco,
        entrada: visita.entrada,
        saida: visita.saida,
      });
      toast.success("Visita agendada com sucesso!");
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao agendar visita");
    }
  };

  const handleStatus = async (id: string | undefined, status: Visita["status"]) => {
    if (!id) return;
    try {
      await atualizarVisitaStatus(id, status);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar visita");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10">
        <TopBar title="Visitas" subtitle="Controle de acesso de visitantes · Ala UTI 2" />
      </div>

      <div className="flex justify-end px-8 mt-5">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-[12.5px] font-semibold text-white px-4 py-2.5"
          style={styles.addButton}
        >
          <Plus size={15} /> Nova Visita
        </button>
      </div>

      <div className="flex items-center gap-2 mx-8 mt-4 px-4 py-2.5 border border-l-[3px]" style={styles.infoBanner}>
        <Info size={15} color={styles.infoIconColor} />
        <p className="text-[12.5px] font-medium" style={styles.infoText}>
          Horário de visitas da ala: 13h–13h30 e 15h–15h30. Máximo 1 acompanhante por leito.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 px-8 py-6">
        {visitasData.map((v) => {
          const cfg = statusCfg[v.status];
          const Icon = statusIconMap[v.status];
          return (
            <div key={v.id} className="bg-white border p-5" style={styles.card}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="kicker" style={styles.leitoLabel}>
                    Leito {v.leito}
                  </span>
                </div>
                <span
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5"
                  style={getStatusBadgeStyle(cfg.bg, cfg.fg)}
                >
                  <Icon size={12} />
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <WireframeAvatar color={styles.avatarColor} />
                <div>
                  <p className="text-[13px] font-semibold" style={styles.visitanteNome}>
                    {v.visitante}
                  </p>
                  <p className="text-[11.5px]" style={styles.visitanteParentesco}>
                    {v.parentesco} {v.paciente ? `· ${v.paciente}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={styles.footer}>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} color={styles.footerIconColor} />
                  <span className="text-[12px] mono" style={styles.footerTime}>
                    {v.entrada} — {v.saida}
                  </span>
                </div>
                {v.status === "agendada" && (
                  <button
                    className="text-[11px] font-semibold px-3 py-1.5 text-white"
                    style={styles.checkinButton}
                    onClick={() => handleStatus(v.id, "em-andamento")}
                  >
                    Check-in
                  </button>
                )}
                {v.status === "em-andamento" && (
                  <button
                    className="text-[11px] font-semibold px-3 py-1.5 border"
                    style={styles.checkoutButton}
                    onClick={() => handleStatus(v.id, "finalizada")}
                  >
                    Check-out
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <NovaVisitaModal beds={beds} onClose={() => setModalOpen(false)} onSubmit={handleAddVisita} />
      )}
    </div>
  );
};
