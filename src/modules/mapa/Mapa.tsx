import React from "react";
import { AlertTriangle } from "lucide-react";
import { TopBar, RiskTag } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { mapRooms, mapEquip } from "./mapaData";

export const Mapa: React.FC = () => {
  const critical = mapRooms.find(r => r.status === "critical");
  const roomColor = (s: "critical" | "attention" | "normal") =>
    s === "critical" ? COLORS.red : s === "attention" ? COLORS.orange : COLORS.line;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Mapa Interativo — Ala UTI 2" subtitle="Planta baixa · localização em tempo real" />
      {critical && (
        <div className="mx-8 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl pulse-critical" style={{ background: COLORS.redSoft }}>
          <AlertTriangle size={16} color={COLORS.red} />
          <p className="text-[12.5px] font-semibold" style={{ color: COLORS.red }}>
            Alerta — Leito {critical.id}: possível convulsão detectada. Equipamento mais próximo: Desfibrilador A (46m).
          </p>
        </div>
      )}
      <div className="flex-1 p-8 overflow-hidden">
        <div className="relative w-full h-full rounded-3xl border" style={{ borderColor: COLORS.line, background: "repeating-linear-gradient(0deg, #FAFBFC, #FAFBFC 24px, #F3F4F6 25px)" }}>
          {/* corredor central */}
          <div className="absolute left-1/2 top-6 bottom-6 w-24 -translate-x-1/2 rounded-2xl" style={{ background: "#EEF0F3" }} />

          {mapRooms.map(r => (
            <div
              key={r.id}
              className={`absolute w-32 h-24 rounded-xl border-2 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-shadow hover:shadow-md ${
                r.status === "critical" ? "pulse-critical" : ""
              }`}
              style={{ left: `${r.x}%`, top: `${r.y}%`, borderColor: roomColor(r.status) }}
            >
              <span className="font-bold text-sm" style={{ color: COLORS.ink }}>
                Leito {r.id}
              </span>
              <RiskTag risk={r.status} />
            </div>
          ))}

          {mapEquip.map((e, i) => {
            const Icon = e.icon;
            return (
              <div key={i} className="absolute flex flex-col items-center" style={{ left: `${e.x}%`, top: `${e.y}%` }}>
                <div className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white border-2" style={{ borderColor: COLORS.orange }}>
                  <Icon size={15} color={COLORS.orange} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: COLORS.orange }} />
                </div>
                <span className="text-[10px] mt-1 font-medium px-1.5 py-0.5 rounded bg-white border whitespace-nowrap" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
                  {e.label} · {e.ts}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-5 px-8 pb-6 shrink-0">
        {[["Estável", COLORS.green], ["Atenção", COLORS.orange], ["Crítico", COLORS.red]].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[11.5px]" style={{ color: COLORS.slate }}>
              {label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13, color: COLORS.orange }}>🚚</span>
          <span className="text-[11.5px]" style={{ color: COLORS.slate }}>
            Equipamento móvel rastreado por visão computacional
          </span>
        </div>
      </div>
    </div>
  );
};
