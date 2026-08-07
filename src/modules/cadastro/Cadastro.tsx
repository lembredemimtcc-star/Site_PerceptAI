import React, { useState } from "react";
import { ClipboardList, Save, UserPlus, BedSingle } from "lucide-react";
import { TopBar } from "../../shared/components";
import { useLeitos, usePacientes } from "../../hooks";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { cadastroStyles as styles, getSubmitButtonStyle } from "./cadastro.styles";

interface FormFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  span?: number;
}

const FormField = ({ label, value, onChange, placeholder, type = "text", span = 1 }: any) => (
  <div className={`col-span-${span}`}>
    <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-11 rounded-xl border px-3 text-sm outline-none mt-1.5"
      style={styles.fieldInput}
    />
  </div>
);

export const Cadastro: React.FC = () => {
  const { data: leitos = [], refetch: refetchLeitos } = useLeitos();
  const { data: pacientes = [], refetch: refetchPacientes } = usePacientes();

  const [lgpd, setLgpd] = useState(false);
  const [camera, setCamera] = useState(false);
  const podeSubmeter = lgpd && camera;

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [convenio, setConvenio] = useState("");
  const [diagnostico, setDiagnostico] = useState("");

  const leitosLivresDb = leitos.filter((l: any) => l.status === "livre");
  const atribuirLeitoAleatorio = (): any => {
    if (leitosLivresDb.length === 0) return null;
    return leitosLivresDb[Math.floor(Math.random() * leitosLivresDb.length)];
  };
  const cadastrosRecentesDb = pacientes.slice(-5).reverse(); // últimos 5

  const handleCadastrar = async () => {
    if (!nome || !cpf || !dataNascimento) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const { data: novoPaciente, error: pacError } = await supabase
        .from("pacientes")
        .insert({ nome, cpf, data_nascimento: dataNascimento, diagnostico, convenio })
        .select()
        .single();

      if (pacError) throw pacError;

      const leitoAleatorio = atribuirLeitoAleatorio();
      if (leitoAleatorio) {
        const leitoId = leitoAleatorio.id;
        const { error: intError } = await supabase
          .from("internacoes")
          .insert({
            paciente_id: novoPaciente.id,
            leito_id: leitoId,
            ativo: true,
            risco: "normal",
            data_entrada: new Date().toISOString(),
          });

        if (intError) throw intError;

        await supabase.from("leitos").update({ status: "ocupado" }).eq("id", leitoId);
      }

      toast.success(
        leitoAleatorio
          ? `Paciente cadastrado no leito ${leitoAleatorio.numero}!`
          : "Paciente cadastrado! (nenhum leito disponível)"
      );
      setNome(""); setCpf(""); setDataNascimento(""); setConvenio(""); setDiagnostico("");
      setLgpd(false); setCamera(false);
      refetchLeitos();
      refetchPacientes();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Cadastro de Pacientes" subtitle="Admissão e vinculação de leito · Ala UTI 2" />

      <div className="flex-1 grid grid-cols-5 gap-5 p-6 overflow-hidden">
        {/* Formulário */}
        <div className="col-span-3 bg-white rounded-2xl border p-6 overflow-y-auto" style={styles.cardBorder}>
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList size={17} color={styles.cadastroIconColor} />
            <p className="text-[14px] font-bold" style={styles.cardTitle}>
              Dados do paciente
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nome completo" placeholder="Nome do paciente" span={2} value={nome} onChange={setNome} />
            <FormField label="CPF" placeholder="000.000.000-00" value={cpf} onChange={setCpf} />
            <FormField label="Data de nascimento" type="date" value={dataNascimento} onChange={setDataNascimento} />
            <FormField label="Convênio" placeholder="Ex.: SUS, Bradesco Saúde" value={convenio} onChange={setConvenio} />

            <div>
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Leito atribuído
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <div
                  className="flex-1 h-11 rounded-xl border px-3 flex items-center text-sm"
                  style={styles.fieldInput}
                >
                  <BedSingle size={15} color={styles.bedIconColor} className="mr-2" />
                  Atribuição automática
                  {leitosLivresDb.length > 0
                    ? ` — ${leitosLivresDb.length} disponível${leitosLivresDb.length > 1 ? "is" : ""}`
                    : " — nenhum leito livre"}
                </div>
              </div>
              <p className="text-[11px] mt-1" style={styles.fieldInput}>
                O leito é sorteado automaticamente dentre os disponíveis.
              </p>
            </div>

            <FormField label="Contato de emergência" placeholder="Nome e telefone" span={2} />
            <FormField label="Alergias conhecidas" placeholder="Ex.: Dipirona, látex" span={2} />

            <div className="col-span-2">
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Diagnóstico inicial
              </label>
              <textarea
                placeholder="Descreva o quadro clínico de admissão"
                rows={3}
                value={diagnostico}
                onChange={e => setDiagnostico(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 mt-1.5 text-sm outline-none resize-none"
                style={styles.fieldInput}
              />
            </div>
          </div>

          {/* Consentimentos */}
          <div className="mt-5 flex flex-col gap-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpd}
                onChange={e => setLgpd(e.target.checked)}
                className="mt-0.5"
                style={styles.checkboxAccent}
              />
              <span className="text-[12px] leading-relaxed" style={styles.checkboxText}>
                Confirmo que o paciente/responsável foi informado sobre o tratamento de dados pessoais e clínicos, conforme a LGPD (Lei 13.709/2018).
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={camera}
                onChange={e => setCamera(e.target.checked)}
                className="mt-0.5"
                style={styles.checkboxAccent}
              />
              <span className="text-[12px] leading-relaxed" style={styles.checkboxText}>
                Autorizo o monitoramento por câmera com reconhecimento de expressão facial (IA PerceptAI) para fins clínicos.
              </span>
            </label>
          </div>

          <button
            onClick={handleCadastrar}
            disabled={!podeSubmeter}
            className="w-full h-12 rounded-xl text-white font-semibold text-sm mt-6 flex items-center justify-center gap-2 transition-opacity"
            style={getSubmitButtonStyle(podeSubmeter)}
          >
            <Save size={16} /> Cadastrar Paciente
          </button>
        </div>

        {/* Lateral direita */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border p-5" style={styles.cardBorder}>
            <p className="text-[13px] font-bold mb-3" style={styles.cardTitle}>
              Leitos disponíveis
            </p>
            <div className="flex flex-col gap-2">
              {leitosLivresDb.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={styles.bedRow}>
                  <div className="flex items-center gap-2">
                    <BedSingle size={15} color={styles.bedIconColor} />
                    <span className="text-[12.5px] font-semibold" style={styles.bedLabel}>
                      Leito {l.numero}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold" style={styles.bedStatus}>
                    Livre
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 flex-1 overflow-y-auto" style={styles.cardBorder}>
            <p className="text-[13px] font-bold mb-3" style={styles.cardTitle}>
              Cadastros recentes
            </p>
            <div className="flex flex-col gap-3">
              {cadastrosRecentesDb.map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0" style={styles.cardBorder}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={styles.cadastroIconBox}>
                    <UserPlus size={15} color={styles.cadastroIconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold truncate" style={styles.cadastroNome}>
                      {c.nome}
                    </p>
                    <p className="text-[11px]" style={styles.cadastroInfo}>
                      Admissão: {new Date(c.criado_em).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};