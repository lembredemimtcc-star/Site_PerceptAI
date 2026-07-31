import React from "react";
import { Bed as BedIcon, ChevronRight } from "lucide-react";
import { Bed } from "../../../types";
import { COLORS } from "../../../config/colors";
import { moodMeta } from "../../../config/mockData";

interface BedCardProps {
  bed: Bed;
  onSelect: (bed: Bed) => void;
}

export const BedCard: React.FC<BedCardProps> = ({ bed, onSelect }) => {
  const mood = moodMeta[bed.mood];
  const MoodIcon = mood.icon;

  const riskColors = {
    critical: { bg: COLORS.redSoft, text: COLORS.red },
    attention: { bg: COLORS.orangeSoft, text: COLORS.orange },
    normal: { bg: COLORS.greenSoft, text: COLORS.green },
  };

  const colors = riskColors[bed.risk];

  return (
    <button
      onClick={() => onSelect(bed)}
      className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md"
      style={{ borderColor: COLORS.line, background: COLORS.card }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold" style={{ color: COLORS.slateSoft }}>
            Leito {bed.id}
          </p>
          <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>
            {bed.name}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: colors.bg, color: colors.text }}>
            {bed.risk === "critical" ? "Crítico" : bed.risk === "attention" ? "Atenção" : "Normal"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.orangeSoft }}>
          <MoodIcon size={16} color={mood.color} />
        </div>
        <div>
          <p className="text-xs" style={{ color: COLORS.slateSoft }}>
            {mood.label} • {bed.conf}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-xs" style={{ color: COLORS.slateSoft }}>
            FC
          </p>
          <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>
            {bed.hr}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: COLORS.slateSoft }}>
            Decúbito
          </p>
          <p className="font-semibold text-sm" style={{ color: bed.decubito ? COLORS.red : COLORS.green }}>
            {bed.decubito ? "Sim" : "Não"}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: COLORS.slateSoft }}>
            Atualização
          </p>
          <p className="font-semibold text-xs" style={{ color: COLORS.ink }}>
            {bed.ts}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {bed.hrSeries.slice(-3).map((hr, i) => (
            <div
              key={i}
              className="w-2 rounded-full"
              style={{
                height: `${Math.min(12, (hr / 150) * 12)}px`,
                background: hr > 110 ? COLORS.red : hr > 85 ? COLORS.orange : COLORS.green,
              }}
            />
          ))}
        </div>
        <ChevronRight size={16} color={COLORS.slate} />
      </div>
    </button>
  );
};
