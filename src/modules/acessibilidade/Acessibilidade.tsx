import React, { useState } from "react";
import { Contrast, Volume2, RotateCcw, Vibrate, Type, Languages, AlertTriangle, Save } from "lucide-react";
import { TopBar, ToggleRow } from "../../shared/components";
import { COLORS } from "../../config/colors";

export const Acessibilidade: React.FC = () => {
  const [contraste, setContraste] = useState(false);
  const [leitor, setLeitor] = useState(false);
  const [reducaoMov, setReducaoMov] = useState(false);
  const [vibracao, setVibracao] = useState(true);
  const [fonte, setFonte] = useState(1);

  const fonteLabels = ["Pequena", "Padrão", "Grande"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Acessibilidade" subtitle="Preferências de exibição e interação" />
      <div className="flex-1 grid grid-cols-5 gap-5 p-6 overflow-hidden">
        <div className="col-span-3 bg-white rounded-2xl border p-6 overflow-y-auto" style={{ borderColor: COLORS.line }}>
          <p className="text-[14px] font-bold mb-1" style={{ color: COLORS.ink }}>
            Preferências gerais
          </p>
          <p className="text-[12px] mb-4" style={{ color: COLORS.slateSoft }}>
            Ajustes aplicados a toda a interface do PerceptAI.
          </p>

          <ToggleRow icon={Contrast} title="Alto contraste" desc="Aumenta o contraste entre texto e fundo" checked={contraste} onChange={setContraste} />
          <ToggleRow icon={Volume2} title="Leitor de tela" desc="Habilita anúncios de voz para navegação" checked={leitor} onChange={setLeitor} />
          <ToggleRow icon={RotateCcw} title="Reduzir movimento" desc="Desativa animações e transições" checked={reducaoMov} onChange={setReducaoMov} />
          <ToggleRow icon={Vibrate} title="Alertas por vibração" desc="Vibra o dispositivo em alertas críticos" checked={vibracao} onChange={setVibracao} />

          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: COLORS.orangeSoft }}>
                <Type size={17} color={COLORS.orange} />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold" style={{ color: COLORS.ink }}>
                  Tamanho da fonte
                </p>
                <p className="text-[12px]" style={{ color: COLORS.slateSoft }}>
                  Ajusta o tamanho do texto em toda a interface
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-[52px]">
              {fonteLabels.map((l, i) => (
                <button
                  key={l}
                  onClick={() => setFonte(i)}
                  className="text-[12.5px] font-semibold px-4 py-2 rounded-xl border"
                  style={{
                    borderColor: fonte === i ? COLORS.orange : COLORS.line,
                    background: fonte === i ? COLORS.orange : "white",
                    color: fonte === i ? "white" : COLORS.slate,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: COLORS.orangeSoft }}>
              <Languages size={17} color={COLORS.orange} />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold" style={{ color: COLORS.ink }}>
                Idioma
              </p>
              <p className="text-[12px]" style={{ color: COLORS.slateSoft }}>
                Português (Brasil)
              </p>
            </div>
          </div>

          <button className="w-full h-12 rounded-xl text-white font-semibold text-sm mt-4 flex items-center justify-center gap-2" style={{ background: COLORS.orange }}>
            <Save size={16} /> Salvar preferências
          </button>
        </div>

        <div className="col-span-2 bg-white rounded-2xl border p-6 flex flex-col" style={{ borderColor: COLORS.line }}>
          <p className="text-[13px] font-bold mb-4" style={{ color: COLORS.ink }}>
            Pré-visualização
          </p>
          <div className="rounded-xl border p-4 flex-1" style={{ borderColor: COLORS.line, background: contraste ? COLORS.ink : COLORS.bg }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} color={contraste ? "#FFB199" : COLORS.red} />
              <span
                style={{
                  color: contraste ? "#FFFFFF" : COLORS.ink,
                  fontSize: fonte === 0 ? 12 : fonte === 1 ? 14 : 17,
                  fontWeight: 700,
                }}
              >
                Leito 402 — Alerta crítico
              </span>
            </div>
            <p
              style={{
                color: contraste ? "#D6DBE1" : COLORS.slate,
                fontSize: fonte === 0 ? 11 : fonte === 1 ? 12.5 : 15,
                lineHeight: 1.6,
              }}
            >
              Expressão de dor intensa detectada pela IA, com frequência cardíaca em elevação. Avaliação clínica recomendada.
            </p>
          </div>
          <p className="text-[11px] mt-3" style={{ color: COLORS.slateSoft }}>
            Assim os alertas aparecerão com as preferências atuais.
          </p>
        </div>
      </div>
    </div>
  );
};
