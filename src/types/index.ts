import { LucideIcon } from "lucide-react";

export type MoodType = "dor" | "medo" | "tristeza" | "enjoo" | "sono" | "dormindo" | "acordado" | "neutro";
export type RiskLevel = "normal" | "attention" | "critical";

export interface Bed {
  id: string;
  name: string;
  hr: number;
  hrSeries: number[];
  mood: MoodType;
  conf: number;
  risk: RiskLevel;
  decubito: boolean;
  ts: string;
}

export interface ClinicalData {
  idade: number;
  diagnostico: string;
  medico: string;
  internacao: string;
  spo2: number;
}

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface VitalData {
  t: string;
  hr: number;
  spo2: number;
}

export interface PainData {
  t: string;
  intensidade: number;
}

export interface TremorEvent {
  t: string;
  tipo: string;
}

export interface RoomPosition {
  id: string;
  x: number;
  y: number;
  status: RiskLevel;
}

export interface Equipment {
  label: string;
  x: number;
  y: number;
  icon: LucideIcon;
  ts: string;
}

export interface MoodMeta {
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface RecentPatient {
  nome: string;
  leito: string;
  risco: RiskLevel;
}
