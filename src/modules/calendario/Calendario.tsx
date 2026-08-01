import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { calendarEvents as initialEvents, eventTypeMeta } from "./calendarioData";
import { NovoEventoModal, NovoEventoFormData } from "../../components/modals/NovoEventoModal";
import {
  getWeekDays,
  getMonthDays,
  addDays,
  addMonths,
  isSameDay,
  formatDayLabel,
  formatWeekRangeLabel,
  formatMonthLabel,
  toISODate,
} from "./calendarioUtils";
import {
  calendarioStyles as styles,
  getDayLabelStyle,
  getLegendDotStyle,
  getEventCardStyle,
  getToggleButtonStyle,
} from "./calendario.styles";

type ViewMode = "semana" | "mes";

export const Calendario: React.FC = () => {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("semana");
  const [referenceDate, setReferenceDate] = useState(new Date());

  const days = useMemo(
    () => (viewMode === "semana" ? getWeekDays(referenceDate) : getMonthDays(referenceDate)),
    [viewMode, referenceDate]
  );

  const rangeLabel = viewMode === "semana" ? formatWeekRangeLabel(days) : formatMonthLabel(referenceDate);

  const handlePrev = () => {
    setReferenceDate((prev) => (viewMode === "semana" ? addDays(prev, -7) : addMonths(prev, -1)));
  };

  const handleNext = () => {
    setReferenceDate((prev) => (viewMode === "semana" ? addDays(prev, 7) : addMonths(prev, 1)));
  };

  const handleSaveEvento = (data: NovoEventoFormData) => {
    setEvents((prev) => [...prev, data]);
    toast.success("Evento adicionado ao calendário");
  };

  const today = new Date();
  const isMonthView = viewMode === "mes";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Calendário" subtitle="Plantões, consultas e procedimentos · Ala UTI 2" />

      <div className="flex items-center justify-between px-8 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="w-9 h-9 rounded-lg border flex items-center justify-center" style={styles.navButton}>
            <ChevronLeft size={16} color={styles.navIconColor} />
          </button>
          <p className="text-[13.5px] font-bold min-w-[190px]" style={styles.weekLabel}>
            {rangeLabel}
          </p>
          <button onClick={handleNext} className="w-9 h-9 rounded-lg border flex items-center justify-center" style={styles.navButton}>
            <ChevronRight size={16} color={styles.navIconColor} />
          </button>

          {/* Toggle Semana / Mês */}
          <div className="flex items-center gap-1 rounded-lg border p-0.5 ml-2" style={styles.toggleWrap}>
            {(["semana", "mes"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="h-7 px-3 rounded-md text-[12px] font-semibold capitalize"
                style={getToggleButtonStyle(viewMode === mode)}
              >
                {mode === "semana" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {Object.entries(eventTypeMeta).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={getLegendDotStyle(v.color)} />
              <span className="text-[11.5px]" style={styles.legendLabel}>
                {v.label}
              </span>
            </div>
          ))}

          <button
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-lg flex items-center gap-1.5 text-[12.5px] font-semibold text-white"
            style={{ background: COLORS.orange }}
          >
            <Plus size={14} />
            Novo Evento
          </button>
        </div>
      </div>

      <div
        className={`flex-1 mx-8 my-5 bg-white rounded-2xl border overflow-hidden ${
          isMonthView ? "flex overflow-x-auto" : "grid grid-cols-7"
        }`}
        style={styles.gridBorder}
      >
        {days.map((day, i) => {
          const iso = toISODate(day);
          return (
            <div
              key={iso}
              className={`flex flex-col border-r last:border-0 overflow-y-auto ${isMonthView ? "flex-none w-[160px]" : ""}`}
              style={styles.gridBorder}
            >
              <div className="h-11 flex items-center justify-center border-b shrink-0" style={styles.dayHeader}>
                <span className="text-[12px] font-semibold" style={getDayLabelStyle(isSameDay(day, today))}>
                  {formatDayLabel(day)}
                </span>
              </div>
              <div className="flex-1 p-2 flex flex-col gap-2">
                {events
                  .filter((e) => e.data === iso)
                  .map((e, j) => {
                    const meta = eventTypeMeta[e.tipo];
                    return (
                      <div key={j} className="rounded-lg p-2" style={getEventCardStyle(meta.color)}>
                        <p className="mono text-[10.5px] font-semibold" style={styles.eventTime(meta.color)}>
                          {e.hora}
                        </p>
                        <p className="text-[11px] font-medium leading-snug mt-0.5" style={styles.eventTitle}>
                          {e.titulo}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      <NovoEventoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEvento} />
    </div>
  );
};