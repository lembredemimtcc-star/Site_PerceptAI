import { supabase } from "./supabase";
import { idadeFrom, insertFirstOk, updateFirstOk } from "./db";
import type { EstoqueItem } from "../modules/estoque/estoque.types";
import type { NovoEventoFormData } from "../components/modals/NovoEventoModal";
import type { Doctor, RiskLevel } from "../types";
import type { Paciente, PrescricaoItem, ExameItem, SinaisVitais } from "../modules/prontuario/Prontuario.types";

function toDateOnly(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export async function cadastrarPaciente(input: {
  nome: string;
  cpf: string;
  dataNascimento: string;
  genero: string;
  diagnostico: string;
  convenio: string;
  alergias?: string;
  contatoEmergencia?: string;
  leitoId?: string;
  medicoId?: string;
}) {
  const nascimento = toDateOnly(input.dataNascimento);
  if (!nascimento) {
    throw new Error("Informe a data de nascimento.");
  }

  const cpfLimpo = input.cpf.replace(/\D/g, "");

  const pacienteInsert = await insertFirstOk("pacientes", [
    {
      nome: input.nome.trim(),
      cpf: cpfLimpo,
      data_nascimento: nascimento,
      genero: input.genero || "N",
      convenio: input.convenio || null,
      alergias: input.alergias || null,
      contato_emergencia: input.contatoEmergencia || null,
    },
    {
      nome: input.nome.trim(),
      cpf: cpfLimpo,
      data_nascimento: nascimento,
      genero: input.genero || "N",
      convenio: input.convenio || null,
    },
    {
      nome: input.nome.trim(),
      cpf: cpfLimpo,
      data_nascimento: nascimento,
      genero: input.genero || "N",
    },
  ]);
  if (pacienteInsert.error || !pacienteInsert.data) {
    if (pacienteInsert.error?.message?.includes("pacientes_cpf_key")) {
      throw new Error("Este CPF já está cadastrado no sistema.");
    }
    throw pacienteInsert.error ?? new Error("Falha ao cadastrar paciente");
  }

  if (input.leitoId) {
    const now = new Date().toISOString();
    const diag = input.diagnostico?.trim() || "Não informado";
    // medico_responsavel_id is NOT NULL in DB. If not provided, fallback to 1 (default doctor)
    const fallbackMedicoId = input.medicoId || 1;

    const internacao = await insertFirstOk("internacoes", [
      {
        paciente_id: pacienteInsert.data.id,
        leito_id: input.leitoId,
        medico_responsavel_id: fallbackMedicoId,
        ativo: true,
        data_internacao: now,
        diagnostico_principal: diag,
      },
      {
        paciente_id: pacienteInsert.data.id,
        leito_id: input.leitoId,
        medico_responsavel_id: fallbackMedicoId,
        ativo: true,
        data_internacao: now,
      }
    ]);
    if (internacao.error) throw internacao.error;

    const internacaoId = internacao.data?.id;
    if (internacaoId && input.diagnostico) {
      await updateFirstOk("internacoes", internacaoId, [
        { diagnostico_principal: input.diagnostico },
        { observacoes: input.diagnostico },
      ]);
      
      // HACK: schema tem prontuarios.internacao_id como UUID, mas internacoes.id é Integer!
      const intIdStr = String(internacaoId);
      const uuidHack = intIdStr.includes("-") ? intIdStr : `00000000-0000-0000-0000-${intIdStr.padStart(12, '0')}`;

      await insertFirstOk("prontuarios", [
        {
          internacao_id: uuidHack,
          queixa_principal: input.diagnostico,
          historia_doenca: input.diagnostico,
        },
        {
          internacao_id: uuidHack,
          queixa_principal: input.diagnostico,
        },
      ]);
    }
    await supabase.from("leitos").update({ status: "ocupado" }).eq("id", input.leitoId);
  }

  return pacienteInsert.data;
}

export async function atualizarRiscoInternacao(internacaoId: string, risk: RiskLevel) {
  // A tabela internacoes não tem coluna 'risco' — salva em observacoes como meta
  const { error } = await updateFirstOk("internacoes", internacaoId, [
    { observacoes: `risco:${risk}` },
  ]);
  if (error) throw error;
}

export async function atualizarStatusInternacao(
  internacaoId: string,
  leitoDbId: string | undefined,
  internado: boolean
) {
  const { error } = await updateFirstOk("internacoes", internacaoId, [
    internado
      ? { ativo: true, data_alta: null }
      : { ativo: false, data_alta: new Date().toISOString() },
  ]);
  if (error) throw error;
  if (leitoDbId) {
    await supabase.from("leitos").update({ status: internado ? "ocupado" : "livre" }).eq("id", leitoDbId);
  }
}

export async function salvarEstoque(mode: "novo" | "editar", item: EstoqueItem, medicamentoId?: string) {
  if (mode === "novo") {
    const { error } = await insertFirstOk("estoque", [
      {
        item: item.nome,
        nome: item.nome,
        quantidade: item.quantidade,
        quantidade_atual: item.quantidade,
        quantidade_minima: item.minimo,
        unidade: item.unidade,
        categoria: item.categoria,
        medicamento_id: medicamentoId || null,
        ultima_atualizacao: new Date().toISOString(),
      },
      {
        item: item.nome,
        quantidade: item.quantidade,
        quantidade_minima: item.minimo,
        unidade: item.unidade,
        categoria: item.categoria,
      },
      {
        medicamento_id: medicamentoId,
        quantidade_atual: item.quantidade,
        quantidade_minima: item.minimo,
      },
    ]);
    if (error) throw error;
    return;
  }

  const { error } = await updateFirstOk("estoque", item.id, [
    {
      item: item.nome,
      nome: item.nome,
      quantidade: item.quantidade,
      quantidade_atual: item.quantidade,
      quantidade_minima: item.minimo,
      unidade: item.unidade,
      categoria: item.categoria,
      ultima_atualizacao: new Date().toISOString(),
    },
    {
      quantidade_atual: item.quantidade,
      quantidade_minima: item.minimo,
    },
  ]);
  if (error) throw error;
}

export async function garantirMedicamento(nome: string, categoria: string, unidade: string) {
  const existing = await supabase.from("medicamentos").select("*").ilike("nome", nome).limit(1).maybeSingle();
  if (existing.data) return existing.data;

  const created = await insertFirstOk("medicamentos", [
    {
      nome,
      categoria,
      unidade_medida: unidade,
      principio_ativo: nome,
      forma_farmaceutica: "outro",
      forma: "outro",
      concentracao: "",
      dosagem: "",
    },
    { nome, dosagem: "", forma: "outro" },
    { nome },
  ]);
  if (created.error || !created.data) throw created.error ?? new Error("Falha ao criar medicamento");
  return created.data;
}

export async function salvarEventoCalendario(data: NovoEventoFormData) {
  const inicio = `${data.data}T${data.hora}:00`;
  const { error } = await insertFirstOk("calendario_eventos", [
    {
      titulo: data.titulo,
      tipo: data.tipo,
      descricao: data.observacoes || "",
      data_hora_inicio: inicio,
      data_hora_fim: inicio,
    },
    {
      titulo: data.titulo,
      tipo: data.tipo,
      descricao: data.observacoes || "",
      data_inicio: inicio,
      data_fim: inicio,
    },
  ]);
  if (error) throw error;
}

export async function criarVisita(input: {
  internacaoId?: string;
  pacienteId?: string;
  visitante: string;
  parentesco: string;
  entrada: string;
  saida: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const entrada = input.entrada ? `${today}T${input.entrada}:00` : new Date().toISOString();
  const saida = input.saida ? `${today}T${input.saida}:00` : null;

  const payloads = [
    {
      nome: input.visitante,
      nome_visitante: input.visitante,
      parentesco: input.parentesco,
      paciente_id: input.pacienteId || null,
      internacao_id: input.internacaoId || null,
      data_entrada: entrada,
      data_saida: saida,
      status: "agendada",
    },
    {
      nome: input.visitante,
      parentesco: input.parentesco,
      paciente_id: input.pacienteId || null,
      internacao_id: input.internacaoId || null,
      data_entrada: entrada,
      data_saida: saida,
    },
  ];
  const visitantes = await insertFirstOk("visitantes", payloads);
  if (!visitantes.error) return;
  const visitas = await insertFirstOk("visitas", payloads);
  if (visitas.error) throw visitas.error ?? visitantes.error;
}

export async function atualizarVisitaStatus(id: string, status: "em-andamento" | "agendada" | "finalizada" | "concluida") {
  const dbStatus = status === "finalizada" ? "concluida" : status;
  const extra =
    dbStatus === "concluida" || status === "finalizada"
      ? { data_saida: new Date().toISOString() }
      : dbStatus === "em-andamento"
        ? { data_entrada: new Date().toISOString() }
        : {};
  const visitantes = await updateFirstOk("visitantes", id, [{ status: dbStatus, ...extra }]);
  if (!visitantes.error) return;
  const visitas = await updateFirstOk("visitas", id, [{ status: dbStatus, ...extra }]);
  if (visitas.error) throw visitas.error ?? visitantes.error;
}

export async function criarAdministracao(input: {
  internacaoId: string;
  nome: string;
  via: string;
  horario: string;
}) {
  const med = await garantirMedicamento(input.nome, "medicamento", "un");
  const today = new Date().toISOString().slice(0, 10);
  const when = `${today}T${input.horario}:00`;

  const presc = await insertFirstOk("prescricoes_medicamentos", [
    {
      internacao_id: input.internacaoId,
      medicamento_id: med.id,
      via_administracao: input.via,
    },
    {
      internacao_id: input.internacaoId,
      medicamento_id: med.id,
    },
  ]);

  const { error } = await insertFirstOk("administracoes_medicamento", [
    {
      prescricao_id: presc.data?.id,
      internacao_id: input.internacaoId,
      medicamento_id: med.id,
      status: "pendente",
      data_hora_planejada: when,
      horario_previsto: when,
    },
    {
      internacao_id: input.internacaoId,
      medicamento_id: med.id,
      status: "pendente",
      horario_previsto: when,
    },
  ]);
  if (error) throw error;
}

export async function salvarMedico(doctor: Doctor, internacaoIds: string[]) {
  await updateFirstOk("usuarios", doctor.id, [
    {
      plantao: doctor.plantao,
      turno: doctor.turno,
      horario_inicio: doctor.horarioInicio,
      horario_fim: doctor.horarioFim,
      especialidade: doctor.especialidade,
      crm: doctor.crm,
    },
    { especialidade: doctor.especialidade, crm: doctor.crm },
  ]);

  const atuais = await supabase
    .from("internacoes")
    .select("id")
    .eq("medico_responsavel_id", doctor.id)
    .eq("ativo", true);

  const atuaisIds = new Set((atuais.data ?? []).map((r: any) => String(r.id)));
  const nextIds = new Set(internacaoIds);

  for (const id of atuaisIds) {
    if (!nextIds.has(id)) {
      await supabase.from("internacoes").update({ medico_responsavel_id: null }).eq("id", id);
    }
  }
  for (const id of nextIds) {
    await supabase.from("internacoes").update({ medico_responsavel_id: doctor.id }).eq("id", id);
  }
}

export async function salvarProntuario(input: {
  internacaoId: string;
  queixaPrincipal: string;
  historiaDoenca: string;
  avaliacao: string;
  orientacoes: string;
  sinaisVitais: SinaisVitais;
  prescricoes: PrescricaoItem[];
  exames: ExameItem[];
  existingId?: string;
}) {
    const intIdStr = String(input.internacaoId);
    const uuidHack = intIdStr.includes("-") ? intIdStr : `00000000-0000-0000-0000-${intIdStr.padStart(12, '0')}`;

  const payload = {
    internacao_id: uuidHack,
    queixa_principal: input.queixaPrincipal,
    historia_doenca: input.historiaDoenca,
    avaliacao: input.avaliacao,
    orientacoes: input.orientacoes,
    exames: input.exames,
    atualizado_em: new Date().toISOString(),
  };

  if (input.existingId) {
    const { error } = await updateFirstOk("prontuarios", input.existingId, [payload]);
    if (error) throw error;
  } else {
    const { error } = await insertFirstOk("prontuarios", [payload]);
    if (error) throw error;
  }

  const hr = Number(input.sinaisVitais.fc);
  const temp = Number(String(input.sinaisVitais.temp).replace(",", "."));
  const fr = Number(input.sinaisVitais.fr);
  if (hr || temp || input.sinaisVitais.pa) {
    const now = new Date().toISOString();
    const paParts = (input.sinaisVitais.pa || "").split("/");
    const paSistolica = paParts[0] ? Number(paParts[0]) : null;
    const paDiastolica = paParts[1] ? Number(paParts[1]) : null;

    await insertFirstOk("sinais_vitais", [
      {
        internacao_id: input.internacaoId,
        frequencia_cardiaca: Number.isFinite(hr) ? hr : null,
        temperatura_corporal: Number.isFinite(temp) ? temp : null,
        frequencia_respiratoria: Number.isFinite(fr) ? fr : null,
        pressao_arterial_sistolica: Number.isFinite(paSistolica) ? paSistolica : null,
        pressao_arterial_diastolica: Number.isFinite(paDiastolica) ? paDiastolica : null,
        timestamp: now,
      }
    ]);
  }

  for (const p of input.prescricoes) {
    if (!p.medicamento.trim()) continue;
    const med = await garantirMedicamento(p.medicamento, "medicamento", "un");
    await insertFirstOk("prescricoes_medicamentos", [
      {
        internacao_id: input.internacaoId,
        medicamento_id: med.id,
        prescrito_por_id: 1, // Fallback p/ medico padrao já que a UI não exige login ainda
        dosagem: p.dose,
        via_administracao: "VO", // UI não coleta via atualmente
        frequencia: p.frequencia || "1x ao dia",
        data_inicio: new Date().toISOString(),
        observacoes: p.duracao,
      },
      {
        internacao_id: input.internacaoId,
        medicamento_id: med.id,
        dosagem: p.dose,
        frequencia: p.frequencia || "1x ao dia",
      },
    ]);
  }
}

export function usuarioToDoctor(row: any, internacaoIds: string[]): Doctor {
  return {
    id: String(row.id),
    nome: row.nome || row.email || "Médico",
    especialidade: row.especialidade || "Clínica geral",
    crm: row.crm || "—",
    turno: (row.turno === "tarde" || row.turno === "noite" ? row.turno : "manhã") as Doctor["turno"],
    horarioInicio: row.horario_inicio || "07:00",
    horarioFim: row.horario_fim || "13:00",
    plantao: row.plantao !== false,
    pacientes: internacaoIds,
  };
}

export function internacaoToPacienteProntuario(bed: {
  internacaoId?: string;
  name: string;
  id: string;
  dataNascimento?: string;
  diagnostico?: string;
}): Paciente {
  return {
    id: bed.internacaoId || "",
    nome: bed.name,
    idade: idadeFrom(bed.dataNascimento),
    leito: bed.id,
    ...(bed.diagnostico !== undefined ? { condicao: bed.diagnostico } : {}),
  };
}
