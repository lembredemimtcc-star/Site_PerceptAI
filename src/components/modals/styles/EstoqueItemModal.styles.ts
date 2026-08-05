import { COLORS } from "../../../config/colors";

export const estoqueItemModalStyles = {
  overlay: {
    background: "rgba(15, 23, 42, 0.45)",
  },
  card: {
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
  },
  header: {
    borderColor: COLORS.line,
  },
  headerIconWrap: {
    background: `${COLORS.orange}1A`,
  },
  headerIconColor: COLORS.orange,
  title: {
    color: COLORS.ink,
  },
  closeIconColor: COLORS.slate,
  label: {
    color: COLORS.slate,
  },
  input: {
    borderColor: COLORS.line,
    color: COLORS.ink,
    background: COLORS.bg,
  },
  cancelButton: {
    color: COLORS.slate,
    background: COLORS.bg,
  },
  saveButton: {
    color: "#FFFFFF",
    background: COLORS.orange,
  },
};