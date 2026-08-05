import { COLORS } from "../../../config/colors";

export const novoEventoModalStyles = {
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

// Estilos dinâmicos (dependem do tipo/estado selecionado)
export const getTypeChipStyle = (color: string, selected: boolean) => ({
  background: selected ? `${color}1F` : COLORS.bg,
  color: selected ? color : COLORS.slate,
  border: `1px solid ${selected ? color : COLORS.line}`,
});