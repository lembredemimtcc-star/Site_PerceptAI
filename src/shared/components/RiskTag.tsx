import React from "react";
import { COLORS } from "../../config/colors";
import { RiskLevel } from "../../types";

interface RiskTagProps {
  risk: RiskLevel;
}

export const RiskTag: React.FC<RiskTagProps> = ({ risk }) => {
  const cfg = {
    normal: { label: "Estável", bg: COLORS.greenSoft, fg: COLORS.green },
    attention: { label: "Atenção", bg: COLORS.orangeSoft, fg: COLORS.orangeDark },
    critical: { label: "Crítico", bg: COLORS.redSoft, fg: COLORS.red },
  }[risk];

  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.fg }}>
      {cfg.label}
    </span>
  );
};
