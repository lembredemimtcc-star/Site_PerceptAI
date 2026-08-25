import { COLORS } from "../../config/colors";

export const cadastroStyles = {
  cardBorder: {
    borderColor: COLORS.line,
  },
  cardTitle: {
    color: COLORS.ink,
  },
  fieldLabel: {
    color: COLORS.slate,
  },
  fieldInput: {
    borderColor: COLORS.line,
    color: COLORS.ink,
  },
  selectChevron: {
    color: COLORS.slateSoft,
  },
  checkboxAccent: {
    accentColor: COLORS.orange,
  },
  checkboxText: {
    color: COLORS.slate,
  },
  bedIconColor: COLORS.orange,
  bedRow: {
    background: COLORS.orangeSoft,
  },
  bedLabel: {
    color: COLORS.ink,
  },
  bedStatus: {
    color: COLORS.orange,
  },
  cadastroIconBox: {
    background: COLORS.orangeSoft,
  },
  cadastroIconColor: COLORS.orange,
  cadastroNome: {
    color: COLORS.ink,
  },
  cadastroInfo: {
    color: COLORS.slateSoft,
  },
};

// Estilo dinâmico (depende do estado podeSubmeter)
export const getSubmitButtonStyle = (podeSubmeter: boolean) => ({
  background: podeSubmeter ? COLORS.orange : COLORS.orangeDark,
  opacity: podeSubmeter ? 1 : 0.55,
  cursor: podeSubmeter ? "pointer" : "not-allowed",
});