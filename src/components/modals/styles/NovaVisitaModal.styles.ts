import { COLORS } from "../../../config/colors";

export const novaVisitaModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.5)",
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
  },
  cancelButton: {
    borderColor: COLORS.line,
    color: COLORS.slate,
  },
  confirmButton: {
    background: COLORS.orange,
  },
};