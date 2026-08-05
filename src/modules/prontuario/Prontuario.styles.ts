import { COLORS } from "../../config/colors";

export const prontuarioStyles = {
  patientBar: {
    borderColor: COLORS.line,
  },
  patientName: {
    color: COLORS.ink,
  },
  patientMeta: {
    color: COLORS.slate,
  },
  divider: {
    color: COLORS.line,
  },
  trocarPacienteButton: {
    borderColor: COLORS.line,
    color: COLORS.slate,
    background: COLORS.bg,
  },
  sectionCard: {
    borderColor: COLORS.line,
  },
  sectionTitle: {
    color: COLORS.ink,
  },
  sectionIconColor: COLORS.slateSoft,
  tableHeaderLabel: {
    color: COLORS.slateSoft,
  },
  fieldLabel: {
    color: COLORS.slate,
  },
  fieldUnit: {
    color: COLORS.slateSoft,
  },
  textarea: {
    borderColor: COLORS.line,
    background: COLORS.bg,
    color: COLORS.ink,
  },
  input: {
    borderColor: COLORS.line,
    background: COLORS.bg,
    color: COLORS.ink,
  },
  addMedButton: {
    borderColor: COLORS.orange,
    color: COLORS.orange,
    background: `${COLORS.orange}0D`,
  },
  footer: {
    borderColor: COLORS.line,
    background: COLORS.white ?? "#ffffff",
  },
  cancelButton: {
    borderColor: COLORS.line,
    color: COLORS.slate,
    background: "transparent",
  },
  saveButton: {
    background: COLORS.orange,
  },
};

// Estilos dinâmicos (dependem do estado)

export const getRemoveButtonStyle = (disabled: boolean) => ({
  borderColor: COLORS.line,
  color: disabled ? COLORS.line : COLORS.red,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
});