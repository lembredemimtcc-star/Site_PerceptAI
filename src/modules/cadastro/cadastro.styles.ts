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
  bedIconColor: COLORS.green,
  bedRow: {
    background: COLORS.greenSoft,
  },
  bedLabel: {
    color: COLORS.ink,
  },
  bedStatus: {
    color: COLORS.green,
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
  background: podeSubmeter ? COLORS.orange : COLORS.slateSoft,
  cursor: podeSubmeter ? "pointer" : "not-allowed",
});