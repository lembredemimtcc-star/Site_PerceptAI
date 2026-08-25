import { COLORS } from "../../../config/colors";

export const dashboardStyles = {
  alertBox: {
    background: COLORS.redSoft,
    borderColor: COLORS.red,
  },
  alertIconColor: COLORS.red,
  alertTitle: {
    color: COLORS.red,
  },
  alertSubtitle: {
    color: COLORS.red,
  },
  filterCard: {
    borderColor: COLORS.line,
  },
  searchIconColor: COLORS.slateSoft,
  searchInput: {
    borderColor: COLORS.line,
    background: COLORS.bg,
  },
  filterButton: {
    borderColor: COLORS.orangePainel,
    background: COLORS.orangePainel,
    color: COLORS.card,
  },
  filterIconColor: COLORS.card,
  filterDropdownMenu: {
    background: COLORS.card,
    borderColor: COLORS.line,
  },
  sectionCard: {
    borderColor: COLORS.line,
  },
  sectionTitle: {
    color: COLORS.orange,
  },
  patientRow: {
    background: COLORS.bg,
  },
  patientName: {
    color: COLORS.ink,
  },
  patientBed: {
    color: COLORS.slateSoft,
  },
};

// Estilo dinâmico (depende do risco do paciente)
export const getRiskBadgeStyle = (risco: string) => ({
  background: risco === "critical" ? COLORS.redSoft : COLORS.orangeSoft,
  color: risco === "critical" ? COLORS.red : COLORS.orange,
});

// Estilo dinâmico (depende se a opção do dropdown está ativa)
export const getFilterOptionStyle = (isActive: boolean) => ({
  background: isActive ? COLORS.orangeSoft : "transparent",
  color: isActive ? COLORS.orange : COLORS.ink,
  fontWeight: isActive ? 600 : 400,
});