import React from "react";
import { ChevronRight } from "lucide-react";
import { Bed } from "../../../types";
import { moodMeta } from "../../../config/mockData";
import {
  bedCardStyles as styles,
  getRiskBadgeStyle,
  getDecubitoStyle,
  getHrBarStyle,
} from "./BedCard.styles";

interface BedCardProps {
  bed: Bed;
  onSelect: (bed: Bed) => void;
}

export const BedCard: React.FC<BedCardProps> = ({ bed, onSelect }) => {
  const mood = moodMeta[bed.mood];
  const MoodIcon = mood.icon;

  return (
    <button
      onClick={() => onSelect(bed)}
      className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md"
      style={styles.button}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold" style={styles.bedLabel}>
            Leito {bed.id}
          </p>
          <p className="font-semibold text-sm" style={styles.bedName}>
            {bed.name}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block px-2 py-1 rounded-lg text-xs font-semibold" style={getRiskBadgeStyle(bed.risk)}>
            {bed.risk === "critical" ? "Crítico" : bed.risk === "attention" ? "Atenção" : "Normal"}
          </div>
        </div>
      </div>

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
        <ChevronRight size={16} color={styles.chevronColor} />
      </div>
    </button>
  );
};