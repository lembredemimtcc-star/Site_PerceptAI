import React from "react";
import { ChevronRight } from "lucide-react";
import { RiskLevel } from "../../../types";
import { BedCardProps } from "../dashboard.types";
import { moodMeta } from "../../../config/mockData";
import {
  bedCardStyles as styles,
  getRiskBadgeStyle,
  getDecubitoStyle,
  getHrBarStyle,
  getStatusToggleStyle,
} from "./BedCard.styles";

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "attention", label: "Atenção" },
  { value: "critical", label: "Crítico" },
];

export const BedCard: React.FC<BedCardProps> = ({ bed, onSelect, onChangeRisk, onToggleStatus }) => {
  const mood = moodMeta[bed.mood];
  const MoodIcon = mood.icon;
  const isInternado = bed.status === "internado";

  return (
    <div
      className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md"
      style={{ ...styles.button, opacity: isInternado ? 1 : 0.55 }}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-3">
        <button onClick={() => onSelect(bed)} className="text-left">
          <p className="text-xs font-semibold" style={styles.bedLabel}>
            Leito {bed.id}
          </p>
          <p className="font-semibold text-sm" style={styles.bedName}>
            {bed.name}
          </p>
        </button>

        <div className="flex flex-col items-end gap-1">
          {/* Toggle internado / alta */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(bed.id);
            }}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg"
            style={getStatusToggleStyle(isInternado)}
          >
            {isInternado ? "Internado" : "Alta"}
          </button>

          {/* Select de risco (só editável se internado) */}
          {isInternado && (
            <select
              value={bed.risk}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChangeRisk(bed.id, e.target.value as RiskLevel)}
              className="text-xs font-semibold px-2 py-1 rounded-lg border-none outline-none"
              style={getRiskBadgeStyle(bed.risk)}
            >
              {RISK_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isInternado ? (
        <>
          {/* Mood */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={styles.moodIconBox}>
              <MoodIcon size={16} color={mood.color} />
            </div>
            <div>
              <p className="text-xs" style={styles.moodLabel}>
                {mood.label} • {bed.conf}%
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-xs" style={styles.statLabel}>
                FC
              </p>
              <p className="font-semibold text-sm" style={styles.statValue}>
                {bed.hr}
              </p>
            </div>
            <div>
              <p className="text-xs" style={styles.statLabel}>
                Decúbito
              </p>
              <p className="font-semibold text-sm" style={getDecubitoStyle(bed.decubito)}>
                {bed.decubito ? "Sim" : "Não"}
              </p>
            </div>
            <div>
              <p className="text-xs" style={styles.statLabel}>
                Atualização
              </p>
              <p className="font-semibold text-xs" style={styles.statValue}>
                {bed.ts}
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {bed.hrSeries.slice(-3).map((hr, i) => (
                <div key={i} className="w-2 rounded-full" style={getHrBarStyle(hr)} />
              ))}
            </div>
            <ChevronRight
              size={16}
              color={styles.chevronColor}
              onClick={() => onSelect(bed)}
              className="cursor-pointer"
            />
          </div>
        </>
      ) : (
        <p className="text-xs italic py-4" style={styles.statLabel}>
          Leito disponível — sem paciente internado
        </p>
      )}
    </div>
  );
};