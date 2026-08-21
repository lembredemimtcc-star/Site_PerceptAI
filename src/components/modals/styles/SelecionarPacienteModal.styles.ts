import { COLORS, INK_OVERLAY } from "../../../config/colors";

export const selecionarPacienteStyles = {
  overlay: {
    background: INK_OVERLAY,
  },
  modalCard: {
    borderColor: COLORS.line,
  },
  header: {
    borderColor: COLORS.line,
  },
  title: {
    color: COLORS.ink,
  },
  subtitle: {
    color: COLORS.slateSoft,
  },
  closeButton: {
    color: COLORS.slateSoft,
  },
  searchIconColor: COLORS.slateSoft,
  searchInput: {
    borderColor: COLORS.line,
    background: COLORS.card,
    color: COLORS.ink,
  },
  emptyText: {
    color: COLORS.slateSoft,
  },
  avatar: {
    background: COLORS.bg,
  },
  avatarIconColor: COLORS.slateSoft,
  patientName: {
    color: COLORS.ink,
  },
  patientMeta: {
    color: COLORS.slate,
  },
  chevronColor: COLORS.slateSoft,
};

// Estilos dinâmicos

export const getPatientRowStyle = () => ({
  borderColor: COLORS.line,
  background: COLORS.card,
});