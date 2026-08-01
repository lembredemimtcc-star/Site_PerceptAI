import React, { useState } from "react";
import { Info, UserCheck, Clock, UserX, Plus } from "lucide-react";
import { TopBar, WireframeAvatar } from "../../shared/components";
import { Visita } from "./visitas.types";
import { NovaVisitaModal } from "../../components/modals/NovaVisitaModal";
import {
  visitasStyles as styles,
  statusCfg,
  getStatusBadgeStyle,
} from "./Visitas.styles";

const visitasIniciais: Visita[] = [
  { leito: "402", visitante: "Ana Silva",     parentesco: "Filha",  entrada: "14:00", saida: "14:30", status: "em-andamento" },
  { leito: "405", visitante: "Bruno Nunes",   parentesco: "Filho",  entrada: "15:00", saida: "15:30", status: "agendada" },
  { leito: "407", visitante: "Marta Ferreira",parentesco: "Esposa", entrada: "13:00", saida: "13:30", status: "finalizada" },
  { leito: "408", visitante: "Igor Martins",  parentesco: "Filho",  entrada: "16:00", saida: "16:30", status: "agendada" },
];

const statusIconMap = {
  "em-andamento": UserCheck,
  "agendada": Clock,
  "finalizada": UserX,
};

export const Visitas: React.FC = () => {
  const [visitasData, setVisitasData] = useState<Visita[]>(visitasIniciais);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddVisita = (visita: Visita) => {
    setVisitasData([...visitasData, visita]);
    setModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Visitas" subtitle="Controle de acesso de visitantes · Ala UTI 2" />

      {/* Botão nova visita */}
      <div className="flex justify-end px-8 mt-5">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl"
          style={styles.addButton}
        >
          <Plus size={15} /> Nova Visita
        </button>
      </div>

      <div className="flex items-center gap-2 mx-8 mt-4 px-4 py-2.5 rounded-xl" style={styles.infoBanner}>
        <Info size={15} color={styles.infoIconColor} />
        <p className="text-[12.5px] font-semibold" style={styles.infoText}>
          Horário de visitas da ala: 13h–13h30 e 15h–15h30. Máximo 1 acompanhante por leito.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 px-8 py-6 overflow-y-auto">
        {visitasData.map((v, i) => {
          const cfg = statusCfg[v.status];
          const Icon = statusIconMap[v.status];
          return (
            <div key={i} className="bg-white rounded-2xl border p-5" style={styles.card}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px]" style={styles.leitoLabel}>
                    Leito {v.leito}
                  </span>
                </div>
                <span
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full"
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
                    {v.parentesco}
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
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white" style={styles.checkinButton}>
                    Check-in
                  </button>
                )}
                {v.status === "em-andamento" && (
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded-full border" style={styles.checkoutButton}>
                    Check-out
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <NovaVisitaModal onClose={() => setModalOpen(false)} onSubmit={handleAddVisita} />
      )}
    </div>
  );
};