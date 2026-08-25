import { COLORS } from "../../config/colors";

export const medicamentosStyles = {
  kpiCard: {
    borderColor: COLORS.line,
    borderLeft: `5px solid ${COLORS.orange}`,
  },
  kpiValue: {
    color: COLORS.ink,
  },
  kpiLabel: {
    color: COLORS.slateSoft,
  },
  tableCard: {
    borderColor: COLORS.line,
  },
  tableHeader: {
    borderColor: COLORS.orangePainel,
    background: COLORS.orangePainel,
  },
  tableHeaderLabel: {
    color: COLORS.card,
  },
  row: {
    borderColor: COLORS.line,
  },
  horario: {
    color: COLORS.ink,
  },
  leito: {
    color: COLORS.ink,
  },
  paciente: {
    color: COLORS.slate,
  },
  nome: {
    color: COLORS.ink,
  },
  nomeIconColor: COLORS.slateSoft,
  via: {
    background: COLORS.bg,
    color: COLORS.slate,
  },
  addButton: {
    background: COLORS.orange,
  },
};

export const statusCfg = {
  administrado: { label: "Administrado", bg: COLORS.orangeSoft, fg: COLORS.orangeDark },
  pendente: { label: "Pendente", bg: COLORS.bg, fg: COLORS.slateSoft },
  atrasado: { label: "Atrasado", bg: COLORS.redSoft, fg: COLORS.red },
};

// Estilos dinâmicos (dependem do status/estado)

export const getKpiIconBoxStyle = (accent: string) => ({
  background: `${accent}14`,
});

export const getStatusBadgeStyle = (bg: string) => ({
  background: bg,
});

export const getStatusLabelStyle = (fg: string) => ({
  color: fg,
});

export const getToggleButtonStyle = (isAdministrado: boolean) => ({
  borderColor: isAdministrado ? COLORS.line : COLORS.orange,
  color: isAdministrado ? COLORS.slateSoft : COLORS.orange,
});