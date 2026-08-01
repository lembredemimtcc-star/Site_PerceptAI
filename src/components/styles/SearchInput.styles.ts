import { COLORS } from "../../config/colors";

export const searchInputStyles = {
  iconColor: COLORS.slate,
};

export const getSearchInputStyle = (isFocused: boolean) => ({
  background: COLORS.card,
  borderColor: isFocused ? COLORS.orange : COLORS.line,
  color: COLORS.ink,
});