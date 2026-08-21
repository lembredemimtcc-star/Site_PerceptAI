import { COLORS } from "../../config/colors";

export const loginStyles = {
  page: {
    background: COLORS.bg,
  },
  brandPanel: {
    background: COLORS.ink,
  },
  brandKicker: {
    color: COLORS.orange,
  },
  title: {
    color: COLORS.card,
  },
  subtitle: {
    color: COLORS.line,
  },
  formTitle: {
    color: COLORS.ink,
  },
  formSubtitle: {
    color: COLORS.slate,
  },
  formBorder: {
    borderColor: COLORS.line,
  },
  label: {
    color: COLORS.ink,
  },
  input: {
    borderColor: "transparent",
    borderBottom: `2px solid ${COLORS.ink}`,
    background: "transparent",
    color: COLORS.ink,
    borderRadius: 0,
  },
  submitButton: {
    background: COLORS.orange,
  },
  demoText: {
    color: COLORS.slate,
  },
};

export const loginIconColor = COLORS.slate;

export const getLoginInputStyle = (focused: boolean) => ({
  ...loginStyles.input,
  borderBottom: `2px solid ${focused ? COLORS.orange : COLORS.ink}`,
});
