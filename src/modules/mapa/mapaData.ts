import { Zap, Truck } from "lucide-react";

export const mapRooms = [
  { id: "401", x: 6,  y: 10, status: "normal" as const },
  { id: "402", x: 6,  y: 34, status: "critical" as const },
  { id: "403", x: 6,  y: 58, status: "normal" as const },
  { id: "404", x: 6,  y: 82, status: "attention" as const },
  { id: "405", x: 78, y: 10, status: "normal" as const },
  { id: "406", x: 78, y: 34, status: "attention" as const },
  { id: "407", x: 78, y: 58, status: "normal" as const },
  { id: "408", x: 78, y: 82, status: "normal" as const },
];

export const mapEquip = [
  { label: "Maca 03", x: 40, y: 22, icon: Truck, ts: "há 1 min" },
  { label: "Desfibrilador A", x: 46, y: 48, icon: Zap, ts: "há 30s" },
  { label: "Maca 07", x: 40, y: 70, icon: Truck, ts: "há 4 min" },
];
