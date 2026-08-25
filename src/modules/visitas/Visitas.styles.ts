import { COLORS } from "../../config/colors";

export const visitasStyles = {
  addButton: {
    background: COLORS.orange,
  },
  infoBanner: {
    background: COLORS.card,
    borderColor: COLORS.line,
    borderLeftColor: COLORS.orange,
  },
  infoIconColor: COLORS.orange,
  infoText: {
    color: COLORS.slate,
  },
  card: {
    borderColor: COLORS.line,
  },
  leitoLabel: {
    color: COLORS.ink,
  },
  avatarColor: COLORS.slateSoft,
  visitanteNome: {
    color: COLORS.ink,
  },
  visitanteParentesco: {
    color: COLORS.slateSoft,
  },
  footer: {
    borderColor: COLORS.line,
  },
  footerIconColor: COLORS.slateSoft,
  footerTime: {
    color: COLORS.slate,
  },
  checkinButton: {
    background: COLORS.orange,
  },
  checkoutButton: {
    borderColor: COLORS.line,
    color: COLORS.slate,
  },
};

export const statusCfg = {
  "em-andamento": { label: "Em andamento", bg: COLORS.orangeSoft, fg: COLORS.orangeDark },
  "agendada": { label: "Agendada", bg: COLORS.bg, fg: COLORS.slateSoft },
  "finalizada": { label: "Finalizada", bg: COLORS.bg, fg: COLORS.slateSoft },
};

// Estilo dinâmico (depende do status da visita)
export const getStatusBadgeStyle = (bg: string, fg: string) => ({
  background: bg,
  color: fg,
});