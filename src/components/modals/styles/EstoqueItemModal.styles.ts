import { COLORS, INK_OVERLAY } from "../../../config/colors";

export const estoqueItemModalStyles = {
  overlay: {
    background: INK_OVERLAY,
  },
  card: {
    border: `1px solid ${COLORS.line}`,
    background: COLORS.card,
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
    background: COLORS.card,
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