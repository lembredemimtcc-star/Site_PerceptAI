import { COLORS } from "../../../config/colors";

export const bedCardStyles = {
  button: {
    borderColor: COLORS.line,
    background: COLORS.card,
  },
  bedLabel: {
    color: COLORS.slateSoft,
  },
  bedName: {
    color: COLORS.ink,
  },
  moodIconBox: {
    background: COLORS.orangeSoft,
  },
  moodLabel: {
    color: COLORS.slateSoft,
  },
  statLabel: {
    color: COLORS.slateSoft,
  },
  statValue: {
    color: COLORS.ink,
  },
  chevronColor: COLORS.slate,
};

// Estilos dinâmicos (dependem dos dados do leito)

export const riskColors = {
  critical: { bg: COLORS.redSoft, text: COLORS.red },
  attention: { bg: COLORS.orangeSoft, text: COLORS.orange },
  normal: { bg: COLORS.greenSoft, text: COLORS.green },
};

export const getRiskBadgeStyle = (risk: keyof typeof riskColors) => ({
  background: riskColors[risk].bg,
  color: riskColors[risk].text,
});

export const getDecubitoStyle = (decubito: boolean) => ({
  color: decubito ? COLORS.red : COLORS.green,
});

export const getHrBarStyle = (hr: number) => ({
  height: `${Math.min(12, (hr / 150) * 12)}px`,
  background: hr > 110 ? COLORS.red : hr > 85 ? COLORS.orange : COLORS.green,
});