import { COLORS } from "../../config/colors";

export const searchInputStyles = {
  iconColor: COLORS.slate,
};

export const getSearchInputStyle = (isFocused: boolean) => ({
  background: "transparent",
  border: "none",
  borderBottom: `2px solid ${isFocused ? COLORS.orange : COLORS.ink}`,
  borderRadius: 0,
  color: COLORS.ink,
});