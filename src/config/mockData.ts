import {
  AlertTriangle, Frown, CloudRain, Meh, Moon, BedSingle, Sun, Minus,
  LogIn, Stethoscope, LayoutGrid, UserPlus, Sparkles, Accessibility, Pill,
  Package, Users, Calendar, Map as MapIcon, Zap, Truck, Activity, FileText
} from "lucide-react";
import { Bed, ClinicalData, NavItem, VitalData, PainData, TremorEvent, RoomPosition, Equipment, MoodMeta, RecentPatient, Doctor } from "../types";
import { COLORS } from "./colors";

export const moodMeta: Record<string, MoodMeta> = {
  dor:       { label: "Dor",         icon: AlertTriangle, color: COLORS.red },
  medo:      { label: "Medo",        icon: Frown,          color: COLORS.red },
  tristeza:  { label: "Tristeza",    icon: CloudRain,      color: COLORS.orange },
  enjoo:     { label: "Enjoo",       icon: Meh,            color: COLORS.orange },
  sono:      { label: "Sonolência",  icon: Moon,           color: COLORS.slate },
  dormindo:  { label: "Dormindo",    icon: BedSingle,      color: COLORS.slate },
  acordado:  { label: "Acordado",    icon: Sun,            color: COLORS.green },
  neutro:    { label: "Neutro",      icon: Minus,          color: COLORS.slate },
};

export const beds: Bed[] = [
  { id: "402", name: "M. Silva",   hr: 121, hrSeries: [78,82,88,95,101,110,121], mood: "dor",      conf: 92, risk: "critical", acordado: false, ts: "agora",    status: "internado" },
  { id: "403", name: "J. Andrade", hr: 74,  hrSeries: [70,72,71,73,74,74,74],     mood: "dormindo", conf: 96, risk: "normal",   acordado: true,  ts: "há 2 min", status: "internado" },
  { id: "404", name: "R. Costa",   hr: 96,  hrSeries: [80,84,88,90,93,95,96],     mood: "medo",     conf: 81, risk: "attention",acordado: false, ts: "há 1 min", status: "internado" },
  { id: "405", name: "A. Nunes",   hr: 70,  hrSeries: [68,69,70,70,71,70,70],     mood: "neutro",   conf: 95, risk: "normal",   acordado: false, ts: "há 4 min", status: "internado" },
  { id: "406", name: "C. Prado",   hr: 89,  hrSeries: [75,78,81,84,86,88,89],     mood: "tristeza", conf: 74, risk: "attention",acordado: true,  ts: "há 1 min", status: "internado" },
  { id: "407", name: "L. Ferreira",hr: 102, hrSeries: [80,85,90,94,97,100,102],   mood: "acordado", conf: 90, risk: "normal",   acordado: false, ts: "agora",    status: "internado" },
  { id: "408", name: "P. Martins", hr: 64,  hrSeries: [66,65,65,64,64,63,64],     mood: "dormindo", conf: 97, risk: "normal",   acordado: false, ts: "há 3 min", status: "internado" },
  { id: "409", name: "V. Rocha",   hr: 111, hrSeries: [82,88,93,99,104,108,111],  mood: "enjoo",    conf: 79, risk: "attention",acordado: false, ts: "há 2 min", status: "internado" },
];

export const doctors: Doctor[] = [
  {
    id: "d1",
    nome: "Dr. Almeida",
    especialidade: "Cardiologia",
    crm: "12345-SP",
    turno: "manhã",
    horarioInicio: "07:00",
    horarioFim: "13:00",
    plantao: true,
    pacientes: ["402", "404", "409"],
  },
  {
    id: "d2",
    nome: "Dra. Ferraz",
    especialidade: "Neurologia",
    crm: "54321-SP",
    turno: "tarde",
    horarioInicio: "13:00",
    horarioFim: "19:00",
    plantao: true,
    pacientes: ["403", "405", "408"],
  },
  {
    id: "d3",
    nome: "Dr. Klein",
    especialidade: "Cirurgia Geral",
    crm: "98765-SP",
    turno: "noite",
    horarioInicio: "19:00",
    horarioFim: "07:00",
    plantao: false,
    pacientes: ["406", "407"],
  },
];

export const navItems: NavItem[] = [
  { key: "login",           label: "Login",           icon: LogIn },
  { key: "dash-medicos",    label: "Dash Médicos",    icon: Stethoscope },
  { key: "dash-pacientes",  label: "Dash Pacientes",  icon: LayoutGrid },
  { key: "cadastro",        label: "Cadastro",        icon: UserPlus },
  { key: "info-ia",         label: "Info IA",         icon: Sparkles },
  { key: "acessibilidade",  label: "Acessibilidade",  icon: Accessibility },
  { key: "medicamentos",    label: "Medicamentos",    icon: Pill },
  { key: "prontuario", label: "Prontuário", icon: FileText },
  { key: "estoque",         label: "Estoque",         icon: Package },
  { key: "visitas",         label: "Visitas",         icon: Users },
  { key: "calendario",      label: "Calendário",      icon: Calendar },
];

export const vitalsData: VitalData[] = [
  { t: "00h", hr: 78, spo2: 97 }, { t: "02h", hr: 75, spo2: 96 }, { t: "04h", hr: 82, spo2: 95 },
  { t: "06h", hr: 90, spo2: 94 }, { t: "08h", hr: 105, spo2: 93 }, { t: "10h", hr: 121, spo2: 90 },
  { t: "12h", hr: 110, spo2: 92 }, { t: "14h", hr: 95, spo2: 94 }, { t: "16h", hr: 88, spo2: 95 },
  { t: "18h", hr: 80, spo2: 96 }, { t: "20h", hr: 76, spo2: 97 }, { t: "22h", hr: 74, spo2: 97 },
];

export const painData: PainData[] = [
  { t: "00h", intensidade: 10 }, { t: "02h", intensidade: 5 }, { t: "04h", intensidade: 20 },
  { t: "06h", intensidade: 35 }, { t: "08h", intensidade: 60 }, { t: "10h", intensidade: 88 },
  { t: "12h", intensidade: 70 }, { t: "14h", intensidade: 40 }, { t: "16h", intensidade: 25 },
  { t: "18h", intensidade: 15 }, { t: "20h", intensidade: 8 }, { t: "22h", intensidade: 5 },
];

export const tremorEvents: TremorEvent[] = [
  { t: "03:12", tipo: "Tremor leve" },
  { t: "07:45", tipo: "Espasmo muscular" },
  { t: "09:58", tipo: "Tremor moderado" },
  { t: "10:30", tipo: "Espasmo — possível convulsão" },
  { t: "15:20", tipo: "Tremor leve" },
];

export const copilotMsgs = [
  "Nas últimas 4 horas, o leito 402 apresentou 3 picos de expressão de dor associados a FC acima de 110bpm.",
  "Às 10:30 foi registrado um espasmo classificado como possível convulsão. Recomendo avaliação clínica imediata.",
];

export const suggestedQs = ["Resumir últimas 24h", "Comparar com leito anterior", "Gerar relatório para o médico"];

export const mapRooms: RoomPosition[] = [
  { id: "401", x: 6,  y: 10, status: "normal" },
  { id: "402", x: 6,  y: 34, status: "critical" },
  { id: "403", x: 6,  y: 58, status: "normal" },
  { id: "404", x: 6,  y: 82, status: "attention" },
  { id: "405", x: 78, y: 10, status: "normal" },
  { id: "406", x: 78, y: 34, status: "attention" },
  { id: "407", x: 78, y: 58, status: "normal" },
  { id: "408", x: 78, y: 82, status: "normal" },
];

export const mapEquip: Equipment[] = [
  { label: "Maca 03", x: 40, y: 22, icon: Truck, ts: "há 1 min" },
  { label: "Desfibrilador A", x: 46, y: 48, icon: Zap, ts: "há 30s" },
  { label: "Maca 07", x: 40, y: 70, icon: Truck, ts: "há 4 min" },
];

export const clinicalData: Record<string, ClinicalData> = {
  "402": { idade: 78, diagnostico: "Pós-operatório cardíaco", medico: "Dr. Almeida",  internacao: "12 dias", spo2: 91 },
  "403": { idade: 65, diagnostico: "AVC isquêmico",           medico: "Dra. Ferraz",  internacao: "5 dias",  spo2: 96 },
  "404": { idade: 54, diagnostico: "Insuficiência respiratória", medico: "Dr. Almeida", internacao: "3 dias", spo2: 93 },
  "405": { idade: 71, diagnostico: "Sepse controlada",        medico: "Dra. Ferraz",  internacao: "8 dias",  spo2: 97 },
  "406": { idade: 60, diagnostico: "Pancreatite aguda",       medico: "Dr. Klein",    internacao: "2 dias",  spo2: 95 },
  "407": { idade: 45, diagnostico: "Politrauma",              medico: "Dr. Klein",    internacao: "6 dias",  spo2: 94 },
  "408": { idade: 82, diagnostico: "DPOC descompensado",      medico: "Dra. Ferraz",  internacao: "9 dias",  spo2: 92 },
  "409": { idade: 58, diagnostico: "Pós-operatório abdominal",medico: "Dr. Almeida",  internacao: "1 dia",   spo2: 95 },
};

export const leitosLivres = ["410", "411", "412"];

export const cadastrosRecentes = [
  { nome: "Helena Duarte",  leito: "410", data: "29/07 · 22h14" },
  { nome: "Otávio Ramos",   leito: "411", data: "28/07 · 09h02" },
];

export const recentPatients: RecentPatient[] = [
  { nome: "M. Silva",   leito: "402", risco: "critical" },
  { nome: "R. Costa",   leito: "404", risco: "attention" },
  { nome: "C. Prado",   leito: "406", risco: "attention" },
];