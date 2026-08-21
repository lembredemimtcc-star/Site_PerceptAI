import { COLORS } from "../../config/colors";

export const bedCardStyles = {
  button: {
    border: `1px solid ${COLORS.line}`,
    background: COLORS.card,
  },
  bedLabel: {
    color: COLORS.orange,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
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

export const riskColors = {
  critical: { bg: COLORS.redSoft, text: COLORS.red },
  attention: { bg: COLORS.orangeSoft, text: COLORS.orange },
  normal: { bg: COLORS.greenSoft, text: COLORS.green },
};

export const getRiskStripe = (risk: keyof typeof riskColors) =>
  riskColors[risk].text;

export const getRiskBadgeStyle = (risk: keyof typeof riskColors) => ({
  background: riskColors[risk].bg,
  color: riskColors[risk].text,
});

export const getAcordadoStyle = (acordado: boolean) => ({
  color: acordado ? COLORS.green : COLORS.slateSoft,
});

export const getHrBarStyle = (hr: number) => ({
  height: `${Math.min(12, (hr / 150) * 12)}px`,
  background: hr > 110 ? COLORS.red : hr > 85 ? COLORS.orange : COLORS.green,
});

export const getStatusToggleStyle = (isInternado: boolean) => ({
  background: isInternado ? COLORS.greenSoft : COLORS.line,
  color: isInternado ? COLORS.green : COLORS.slateSoft,
});