import { COLORS } from "../../config/colors";

export const calendarioStyles = {
  navButton: {
    borderColor: COLORS.line,
  },
  navIconColor: COLORS.slate,
  weekLabel: {
    color: COLORS.ink,
  },
  legendLabel: {
    color: COLORS.slate,
  },
  gridBorder: {
    borderColor: COLORS.line,
  },
  dayHeader: {
    borderColor: COLORS.line,
    background: COLORS.bg,
  },
  eventTime: (color: string) => ({
    color,
  }),
  eventTitle: {
    color: COLORS.ink,
  },
  toggleWrap: {
    background: COLORS.bg,
    borderColor: COLORS.line,
  },
};

// Estilos dinâmicos (dependem de dados/estado)
export const getDayLabelStyle = (isToday: boolean) => ({
  color: isToday ? COLORS.orange : COLORS.slate,
});

export const getLegendDotStyle = (color: string) => ({
  background: color,
});

export const getEventCardStyle = (color: string) => ({
  background: `${color}14`,
  borderLeft: `3px solid ${color}`,
});

export const getToggleButtonStyle = (active: boolean) => ({
  background: active ? COLORS.orange : "transparent",
  color: active ? "#FFFFFF" : COLORS.slate,
});