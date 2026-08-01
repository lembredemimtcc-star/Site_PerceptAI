import React, { useState } from "react";
import { ClipboardList, ChevronDown, Save, UserPlus, BedSingle } from "lucide-react";
import { TopBar } from "../../shared/components";
import { leitosLivres, cadastrosRecentes } from "../../config/mockData";
import { cadastroStyles as styles, getSubmitButtonStyle } from "./cadastro.styles";

interface FormFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  span?: number;
}

const FormField: React.FC<FormFieldProps> = ({ label, placeholder, type = "text", span = 1 }) => (
  <div className={`col-span-${span}`}>
    <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full h-11 rounded-xl border px-3 text-sm outline-none mt-1.5"
      style={styles.fieldInput}
    />
  </div>
);

export const Cadastro: React.FC = () => {
  const [lgpd, setLgpd] = useState(false);
  const [camera, setCamera] = useState(false);
  const podeSubmeter = lgpd && camera;

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
            <FormField label="Nome completo" placeholder="Nome do paciente" span={2} />
            <FormField label="CPF" placeholder="000.000.000-00" />
            <FormField label="Data de nascimento" type="date" />
            <FormField label="Convênio" placeholder="Ex.: SUS, Bradesco Saúde" />

            <div>
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Leito atribuído
              </label>
              <div className="relative mt-1.5">
                <select
                  className="w-full h-11 rounded-xl border px-3 text-sm outline-none appearance-none"
                  style={styles.fieldInput}
                >
                  {leitosLivres.map(l => (
                    <option key={l}>{l} — livre</option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  color={styles.selectChevron.color}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
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
              {leitosLivres.map(l => (
                <div key={l} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={styles.bedRow}>
                  <div className="flex items-center gap-2">
                    <BedSingle size={15} color={styles.bedIconColor} />
                    <span className="text-[12.5px] font-semibold" style={styles.bedLabel}>
                      Leito {l}
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
              {cadastrosRecentes.map((c, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0" style={styles.cardBorder}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={styles.cadastroIconBox}>
                    <UserPlus size={15} color={styles.cadastroIconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold truncate" style={styles.cadastroNome}>
                      {c.nome}
                    </p>
                    <p className="text-[11px]" style={styles.cadastroInfo}>
                      Leito {c.leito} · {c.data}
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