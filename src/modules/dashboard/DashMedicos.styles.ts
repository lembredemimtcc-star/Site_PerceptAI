import { COLORS } from "../../config/colors";

export const dashMedicosStyles = {
  card: {
    borderColor: COLORS.line,
    background: COLORS.card,
  },
  bedLabel: {
    color: COLORS.slateSoft,
  },
  bedName: {
    color: COLORS.ink,
  },
  clinicalInfo: {
    color: COLORS.slate,
  },
  statBox: {
    background: COLORS.bg,
  },
  statLabel: {
    color: COLORS.slateSoft,
  },
  statValue: {
    color: COLORS.ink,
  },
};

// Estilo dinâmico (depende do risco do leito)
export const getRiskBadgeStyle = (risk: string) => ({
  background: risk === "critical" ? COLORS.redSoft : COLORS.orangeSoft,
  color: risk === "critical" ? COLORS.red : COLORS.orange,
});