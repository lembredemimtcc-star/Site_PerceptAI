export const COLORS = {
  bg: "#F6F7F9",
  card: "#FFFFFF",
  ink: "#1C2430",
  slate: "#67727E",
  slateSoft: "#9AA3AC",
  line: "#E5E9EE",
  orange: "#F2652E",
  orangeDark: "#C94F1F",
  orangeSoft: "#FFF0E6",
  red: "#E14545",
  redSoft: "#FDECEC",
  green: "#2E9E63",
  greenSoft: "#E9F8EF",
} as const;

export type ColorKey = keyof typeof COLORS;
