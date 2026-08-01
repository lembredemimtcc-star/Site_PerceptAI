import { COLORS } from "../../config/colors";

export const mapaStyles = {
  alertBanner: {
    background: COLORS.redSoft,
  },
  alertIconColor: COLORS.red,
  alertText: {
    color: COLORS.red,
  },
  floorPlan: {
    borderColor: COLORS.line,
    background: "repeating-linear-gradient(0deg, #FAFBFC, #FAFBFC 24px, #F3F4F6 25px)",
  },
  corridor: {
    background: "#EEF0F3",
  },
  roomLabel: {
    color: COLORS.ink,
  },
  equipIconBox: {
    borderColor: COLORS.orange,
  },
  equipIconColor: COLORS.orange,
  equipDot: {
    background: COLORS.orange,
  },
  equipTag: {
    borderColor: COLORS.line,
    color: COLORS.slate,
  },
  legendLabel: {
    color: COLORS.slate,
  },
  mobileIconColor: COLORS.orange,
};

// Estilos dinâmicos (dependem do status do leito)
export const getRoomColor = (status: "critical" | "attention" | "normal") =>
  status === "critical" ? COLORS.red : status === "attention" ? COLORS.orange : COLORS.line;

export const getRoomStyle = (x: number, y: number, status: "critical" | "attention" | "normal") => ({
  left: `${x}%`,
  top: `${y}%`,
  borderColor: getRoomColor(status),
});

export const getEquipPositionStyle = (x: number, y: number) => ({
  left: `${x}%`,
  top: `${y}%`,
});

export const getLegendDotStyle = (color: string) => ({
  background: color,
});