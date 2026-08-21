import { COLORS, INK_OVERLAY } from "../../../config/colors";

export const doctorModalStyles = {
  overlay: {
    background: INK_OVERLAY,
  },
  modal: {
    background: COLORS.card,
    borderColor: COLORS.line,
  },
  title: {
    color: COLORS.ink,
  },
  subtitle: {
    color: COLORS.slateSoft,
  },
  label: {
    color: COLORS.slateSoft,
  },
  input: {
    borderColor: COLORS.line,
    background: COLORS.card,
    color: COLORS.ink,
  },
  patientRow: {
    background: COLORS.bg,
  },
  patientName: {
    color: COLORS.ink,
  },
  closeButton: {
    color: COLORS.slate,
  },
  saveButton: {
    background: COLORS.orange,
    color: "#fff",
  },
  cancelButton: {
    borderColor: COLORS.line,
    color: COLORS.slate,
  },
};

export const getPlantaoToggleStyle = (plantao: boolean) => ({
  background: plantao ? COLORS.greenSoft : COLORS.line,
  color: plantao ? COLORS.green : COLORS.slateSoft,
});