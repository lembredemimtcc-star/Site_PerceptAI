import React from "react";
import { Info, UserCheck, Clock, UserX } from "lucide-react";
import { TopBar, WireframeAvatar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { Visita } from "./visitas.types";

const visitasData: Visita[] = [
  { leito: "402", visitante: "Ana Silva",     parentesco: "Filha",  entrada: "14:00", saida: "14:30", status: "em-andamento" },
  { leito: "405", visitante: "Bruno Nunes",   parentesco: "Filho",  entrada: "15:00", saida: "15:30", status: "agendada" },
  { leito: "407", visitante: "Marta Ferreira",parentesco: "Esposa", entrada: "13:00", saida: "13:30", status: "finalizada" },
  { leito: "408", visitante: "Igor Martins",  parentesco: "Filho",  entrada: "16:00", saida: "16:30", status: "agendada" },
];

export const Visitas: React.FC = () => {
  const statusCfg = {
    "em-andamento": { label: "Em andamento", bg: COLORS.greenSoft, fg: COLORS.green, icon: UserCheck },
    "agendada": { label: "Agendada", bg: COLORS.orangeSoft, fg: COLORS.orangeDark, icon: Clock },
    "finalizada": { label: "Finalizada", bg: COLORS.bg, fg: COLORS.slateSoft, icon: UserX },
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Visitas" subtitle="Controle de acesso de visitantes · Ala UTI 2" />
      <div className="flex items-center gap-2 mx-8 mt-5 px-4 py-2.5 rounded-xl" style={{ background: COLORS.orangeSoft }}>
        <Info size={15} color={COLORS.orangeDark} />
        <p className="text-[12.5px] font-semibold" style={{ color: COLORS.orangeDark }}>
          Horário de visitas da ala: 13h–13h30 e 15h–15h30. Máximo 1 acompanhante por leito.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 px-8 py-6 overflow-y-auto">
        {visitasData.map((v, i) => {
          const cfg = statusCfg[v.status];
          const Icon = cfg.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border p-5" style={{ borderColor: COLORS.line }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px]" style={{ color: COLORS.ink }}>
                    Leito {v.leito}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.fg }}>
                  <Icon size={12} />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <WireframeAvatar color={COLORS.slateSoft} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>
                    {v.visitante}
                  </p>
                  <p className="text-[11.5px]" style={{ color: COLORS.slateSoft }}>
                    {v.parentesco}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: COLORS.line }}>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} color={COLORS.slateSoft} />
                  <span className="text-[12px] mono" style={{ color: COLORS.slate }}>
                    {v.entrada} — {v.saida}
                  </span>
                </div>
                {v.status === "agendada" && (
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white" style={{ background: COLORS.orange }}>
                    Check-in
                  </button>
                )}
                {v.status === "em-andamento" && (
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
                    Check-out
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
