import { supabase } from "./supabase";
import type { Bed, RiskLevel } from "../types";

export function pick(row: Record<string, unknown> | null | undefined, ...keys: string[]) {
  if (!row) return undefined;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

export function pickString(row: Record<string, unknown> | null | undefined, ...keys: string[]) {
  const value = pick(row, ...keys);
  return value == null ? "" : String(value);
}

export function pickNumber(row: Record<string, unknown> | null | undefined, ...keys: string[]) {
  const value = pick(row, ...keys);
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function idadeFrom(iso?: string | null) {
  if (!iso) return 0;
  const birth = new Date(iso);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return Math.max(0, age);
}

export function diasInternacao(iso?: string | null) {
  if (!iso) return "—";
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return "—";
  const days = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1);
  return days === 1 ? "1 dia" : `${days} dias`;
}

export function rowTimestamp(row: Record<string, unknown> | null | undefined) {
  return pickString(row, "timestamp", "registrado_em", "created_at", "criado_em");
}

function isSchemaMismatch(error: { message?: string; details?: string; hint?: string } | null) {
  if (!error) return false;
  const text = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    text.includes("column") ||
    text.includes("schema cache") ||
    text.includes("could not find") ||
    text.includes("does not exist") ||
    text.includes("pgrst204") ||
    text.includes("pgrst200") ||
    text.includes("relationship") ||
    text.includes("foreign key")
  );
}

export async function insertFirstOk<T = any>(table: string, variants: Record<string, unknown>[]) {
  let lastError: any = null;
  for (const payload of variants) {
    const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null));
    const { data, error } = await supabase.from(table).insert(clean).select().maybeSingle();
    if (!error) return { data: data as T, error: null };
    lastError = error;
    if (!isSchemaMismatch(error)) break;
  }
  return { data: null as T | null, error: lastError };
}

export async function updateFirstOk(table: string, id: string, variants: Record<string, unknown>[]) {
  let lastError: any = null;
  for (const payload of variants) {
    const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null));
    const { error } = await supabase.from(table).update(clean).eq("id", id);
    if (!error) return { error: null };
    lastError = error;
    if (!isSchemaMismatch(error)) break;
  }
  return { error: lastError };
}

export function internacaoToBed(int: any): Bed {
  const paciente = int?.paciente ?? {};
  const leito = int?.leito ?? {};
  const medico = int?.medico ?? {};
  const ativo = int?.ativo !== false && !int?.data_alta;
  // Lê o risco do campo observacoes (ex: "risco:critical") ou default "normal"
  const obsText = pickString(int, "observacoes") || "";
  const ricoMatch = obsText.match(/risco:(normal|attention|critical)/);
  const risk = (ricoMatch ? ricoMatch[1] : "normal") as RiskLevel;
  const pacienteId = pickString(int, "paciente_id", "id_paciente", "patient_id") || pickString(paciente, "id");
  const leitoId = pickString(int, "leito_id", "id_leito", "bed_id") || pickString(leito, "id");
  // Suporta medico_responsavel_id (banco real) e medico_id (schema antigo)
  const medicoId = pickString(int, "medico_responsavel_id", "medico_id", "id_medico", "doctor_id") || pickString(medico, "id");

  const internacaoIdVal = pickString(int, "id") || undefined;
  const pacienteIdVal = pacienteId || undefined;
  const leitoDbIdVal = leitoId || undefined;
  const medicoIdVal = medicoId || undefined;
  const diagnosticoVal =
    pickString(int, "diagnostico_principal", "diagnostico", "diagnostico_inicial", "cid", "observacoes", "queixa_principal") ||
    pickString(paciente, "condicao", "cid") ||
    undefined;
  const medicoNomeVal = pickString(medico, "nome", "name") || undefined;
  // Suporta data_internacao (banco real) e data_entrada (schema antigo)
  const dataEntradaVal = pickString(int, "data_internacao", "data_entrada", "entrada", "created_at", "data_criacao", "admitted_at") || undefined;
  const dataNascimentoVal = pickString(paciente, "data_nascimento", "nascimento", "birth_date", "data_nasc") || undefined;
  const convenioVal = pickString(paciente, "convenio", "plano") || undefined;
  const cpfVal = pickString(paciente, "cpf", "documento") || undefined;
  const alergiasVal = pickString(paciente, "alergias", "alergia") || undefined;
  const contatoEmergenciaVal = pickString(paciente, "contato_emergencia", "contato") || undefined;

  return {
    id: pickString(leito, "numero", "code", "leito") || leitoId || "??",
    ...(internacaoIdVal !== undefined ? { internacaoId: internacaoIdVal } : {}),
    ...(pacienteIdVal !== undefined ? { pacienteId: pacienteIdVal } : {}),
    ...(leitoDbIdVal !== undefined ? { leitoDbId: leitoDbIdVal } : {}),
    ...(medicoIdVal !== undefined ? { medicoId: medicoIdVal } : {}),
    name: pickString(paciente, "nome", "name", "full_name") || (int?.id ? "Paciente" : "Desconhecido"),
    hr: 0,
    hrSeries: [],
    mood: "neutro",
    conf: 0,
    risk,
    acordado: true,
    ts: "",
    status: ativo ? "internado" : "alta",
    ...(diagnosticoVal !== undefined ? { diagnostico: diagnosticoVal } : {}),
    ...(medicoNomeVal !== undefined ? { medicoNome: medicoNomeVal } : {}),
    ...(dataEntradaVal !== undefined ? { dataEntrada: dataEntradaVal } : {}),
    ...(dataNascimentoVal !== undefined ? { dataNascimento: dataNascimentoVal } : {}),
    ...(convenioVal !== undefined ? { convenio: convenioVal } : {}),
    ...(cpfVal !== undefined ? { cpf: cpfVal } : {}),
    ...(alergiasVal !== undefined ? { alergias: alergiasVal } : {}),
    ...(contatoEmergenciaVal !== undefined ? { contatoEmergencia: contatoEmergenciaVal } : {}),
  };
}

export async function fetchInternacoesRows(onlyActive = true) {
  const internacoes = await supabase.from("internacoes").select("*");
  if (internacoes.error) throw internacoes.error;
  let rows = internacoes.data ?? [];

  const [pacientes, leitos, usuarios, prontuarios] = await Promise.all([
    supabase.from("pacientes").select("*"),
    supabase.from("leitos").select("*"),
    supabase.from("usuarios").select("*"),
    supabase.from("prontuarios").select("*"),
  ]);

  const pacById = indexById(pacientes.data ?? []);
  const leiById = indexById(leitos.data ?? []);
  const usrById = indexById(usuarios.data ?? []);
  const prontByInternacao: Record<string, any> = {};
  for (const p of prontuarios.data ?? []) {
    const key = asId(p.internacao_id);
    if (key && !prontByInternacao[key]) prontByInternacao[key] = p;
  }

  rows = rows.map((r: any) => {
    const pid = asId(r.paciente_id) || asId(r.id_paciente) || asId(r.patient_id);
    const lid = asId(r.leito_id) || asId(r.id_leito) || asId(r.bed_id);
    const mid = asId(r.medico_id) || asId(r.id_medico) || asId(r.doctor_id);
    const pront = prontByInternacao[asId(r.id)];
    return {
      ...r,
      queixa_principal: pront?.queixa_principal ?? r.queixa_principal,
      paciente: pacById[pid] ?? (typeof r.paciente === "object" ? r.paciente : null),
      leito: leiById[lid] ?? (typeof r.leito === "object" ? r.leito : null),
      medico: usrById[mid] ?? (typeof r.medico === "object" ? r.medico : null),
    };
  });

  if (!onlyActive) return rows;

  return rows.filter((r: any) => {
    if (typeof r.ativo === "boolean") return r.ativo;
    const status = pickString(r, "status").toLowerCase();
    if (status === "alta" || status === "encerrada") return false;
    return !r.data_alta;
  });
}

function asId(value: unknown) {
  if (value == null || value === "") return "";
  if (typeof value === "object") return String((value as { id?: unknown }).id ?? "");
  return String(value);
}

function indexById(rows: any[]) {
  const map: Record<string, any> = {};
  for (const row of rows) {
    const id = pickString(row, "id");
    if (id) map[id] = row;
  }
  return map;
}
