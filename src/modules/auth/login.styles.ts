import { COLORS } from "../../config/colors";

export const loginStyles = {
  page: {
    background: COLORS.bg,
  },
  brandPanel: {
    background: COLORS.orangePainel,
  },
  brandKicker: {
    color: COLORS.orange,
    letterSpacing: "0.12em",
  },
  title: {
    color: COLORS.card,
  },
  subtitle: {
    color: COLORS.orangeSoft,
  },
  divider: {
    background: COLORS.card,
    opacity: 0.35,
  },
  featureTitle: {
    color: COLORS.card,
  },
  featureDescription: {
    color: COLORS.orangeSoft,
    opacity: 0.85,
  },
  formTitle: {
    color: COLORS.ink,
  },
  formSubtitle: {
    color: COLORS.slateSoft,
  },
  formBorder: {
    borderColor: COLORS.line,
  },
  label: {
    color: COLORS.ink,
  },
  input: {
    borderColor: "transparent",
    borderBottom: `2px solid ${COLORS.line}`,
    background: "transparent",
    color: COLORS.ink,
    borderRadius: 0,
    transition: "border-color 0.2s ease",
  },
  submitButton: {
    background: COLORS.orange,
    borderRadius: "10px",
    transition: "background 0.15s ease",
  },
  submitButtonHover: {
    background: COLORS.orangeDark,
  },
  demoText: {
    color: COLORS.slateSoft,
  },
  accessIcon: {
    color: COLORS.orange,
  },
  frame: {
    borderColor: COLORS.card,
    borderWidth: "1px",
    opacity: 0.5,
  },
  cornerMark: {
    color: COLORS.card,
  },
};

export const loginIconColor = COLORS.slateSoft;

export const getLoginInputStyle = (focused: boolean) => ({
  ...loginStyles.input,
  borderBottom: `2px solid ${focused ? COLORS.orange : COLORS.line}`,
});