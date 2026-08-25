export const COLORS = {
  bg: "#F6F7F9",
  card: "#FFFFFF",
  ink: "#1C2430",
  slate: "#3E4A56",
  slateSoft: "#53606C",
  line: "#E5E9EE",
  orange: "#F2652E",
  orangePainel: '#76290b',
  orangeDark: "#C94F1F",
  orangeSoft: "#FFF0E6",
  red: "#E14545",
  redSoft: "#FDECEC",
  green: "#2E9E63",
  greenSoft: "#E9F8EF",
} as const;

/** Mesma tinta da paleta, usada só em overlays. */
export const INK_OVERLAY = "rgba(28, 36, 48, 0.42)";

export type ColorKey = keyof typeof COLORS;