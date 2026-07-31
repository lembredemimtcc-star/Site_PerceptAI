import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { calendarDays, calendarEvents, eventTypeMeta } from "./calendarioData";

export const Calendario: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Calendário" subtitle="Plantões, consultas e procedimentos · Ala UTI 2" />
      <div className="flex items-center justify-between px-8 pt-5">
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg border flex items-center justify-center" style={{ borderColor: COLORS.line }}>
            <ChevronLeft size={16} color={COLORS.slate} />
          </button>
          <p className="text-[13.5px] font-bold" style={{ color: COLORS.ink }}>
            27 Jul — 02 Ago 2026
          </p>
          <button className="w-9 h-9 rounded-lg border flex items-center justify-center" style={{ borderColor: COLORS.line }}>
            <ChevronRight size={16} color={COLORS.slate} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(eventTypeMeta).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
              <span className="text-[11.5px]" style={{ color: COLORS.slate }}>
                {v.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 mx-8 my-5 bg-white rounded-2xl border overflow-hidden grid grid-cols-7" style={{ borderColor: COLORS.line }}>
        {calendarDays.map((d, i) => (
          <div key={i} className="flex flex-col border-r last:border-0 overflow-y-auto" style={{ borderColor: COLORS.line }}>
            <div className="h-11 flex items-center justify-center border-b shrink-0" style={{ borderColor: COLORS.line, background: COLORS.bg }}>
              <span className="text-[12px] font-semibold" style={{ color: i === 3 ? COLORS.orange : COLORS.slate }}>
                {d}
              </span>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-2">
              {calendarEvents.filter(e => e.dia === i).map((e, j) => {
                const meta = eventTypeMeta[e.tipo];
                return (
                  <div
                    key={j}
                    className="rounded-lg p-2"
                    style={{ background: `${meta.color}14`, borderLeft: `3px solid ${meta.color}` }}
                  >
                    <p className="mono text-[10.5px] font-semibold" style={{ color: meta.color }}>
                      {e.hora}
                    </p>
                    <p className="text-[11px] font-medium leading-snug mt-0.5" style={{ color: COLORS.ink }}>
                      {e.titulo}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
