import { COLORS, INK_OVERLAY } from "../../../config/colors";

export const novoMedicamentoModalStyles = {
  overlay: {
    background: INK_OVERLAY,
  },
  modal: {
    background: COLORS.card,
    borderColor: COLORS.line,
  },
  modalTitle: {
    color: COLORS.ink,
  },
  modalSubtitle: {
    color: COLORS.slateSoft,
  },
  modalCloseColor: COLORS.slateSoft,
  fieldLabel: {
    color: COLORS.slate,
  },
  fieldInput: {
    borderColor: COLORS.line,
    color: COLORS.ink,
    background: COLORS.card,
  },
  checkboxLabel: {
    color: COLORS.slate,
  },
  cancelButton: {
    borderColor: COLORS.line,
    color: COLORS.slate,
  },
  confirmButton: {
    background: COLORS.orange,
  },
};