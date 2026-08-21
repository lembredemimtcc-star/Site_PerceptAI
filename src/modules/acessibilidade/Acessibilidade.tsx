import React from "react";
import { Contrast, Volume2, RotateCcw, Vibrate, Type, Languages, AlertTriangle, Save, Undo2, Play } from "lucide-react";
import { toast } from "sonner";
import { TopBar, ToggleRow } from "../../shared/components";
import { useAccessibility, type FontSize } from "../../shared/accessibility";
import {
  acessibilidadeStyles as styles,
  getFonteButtonStyle,
  getPreviewBoxStyle,
  getPreviewIconColor,
  getPreviewTitleStyle,
  getPreviewTextStyle,
  getPreviewButtonStyle,
  getPreviewDotStyle,
  iconOrangeColor,
} from "./acessibilidade.styles";

export const Acessibilidade: React.FC = () => {
  const { draft, setDraft, dirty, save, reset, announce, vibrate } = useAccessibility();
  const { contraste, leitor, reducaoMov, vibracao, fonte } = draft;

  const fonteLabels = ["Pequeno", "Padrão", "Grande"];

  const handleSave = () => {
    save();
    toast.success("Preferências salvas com sucesso!");
    announce("Preferências de acessibilidade salvas", { force: leitor });
    vibrate([80], { force: vibracao });
  };

  const handleReset = () => {
    reset();
    toast.success("Preferências restauradas para o padrão.");
    announce("Preferências restauradas para o padrão", { force: true });
  };

  const handleTestAlert = () => {
    toast.warning("Leito 402 — Alerta crítico");
    announce("Alerta crítico no leito 402. Expressão de dor intensa detectada.", {
      force: leitor,
    });
    vibrate([200, 100, 200], { force: vibracao });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Acessibilidade" subtitle="Preferências de exibição e interação" />

      <div className="flex-1 grid grid-cols-5 gap-6 px-8 py-7 overflow-hidden">
        {/* Coluna esquerda — preferências */}
        <div className="col-span-3 bg-white border p-6 overflow-y-auto" style={styles.cardBorder}>
          <p className="display text-[1.15rem] font-semibold mb-1" style={styles.cardTitle}>
            Preferências gerais
          </p>
          <p className="text-[12px] mb-4" style={styles.cardSubtitle}>
            Ajustes aplicados a toda a interface do PerceptAI.
          </p>

          <ToggleRow
            icon={Contrast}
            title="Alto contraste"
            desc="Aumenta o contraste entre texto e fundo"
            checked={contraste}
            onChange={(v) => setDraft({ contraste: v })}
          />
          <ToggleRow
            icon={Volume2}
            title="Leitor de tela"
            desc="Habilita anúncios de voz para navegação"
            checked={leitor}
            onChange={(v) => setDraft({ leitor: v })}
          />
          <ToggleRow
            icon={RotateCcw}
            title="Reduzir movimento"
            desc="Desativa animações e transições"
            checked={reducaoMov}
            onChange={(v) => setDraft({ reducaoMov: v })}
          />
          <ToggleRow
            icon={Vibrate}
            title="Alertas por vibração"
            desc="Vibra o dispositivo em alertas críticos"
            checked={vibracao}
            onChange={(v) => setDraft({ vibracao: v })}
          />

          {/* Tamanho da fonte */}
          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={styles.iconBox}>
                <Type size={17} color={iconOrangeColor} />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold" style={styles.itemTitle}>
                  Tamanho da fonte
                </p>
                <p className="text-[12px]" style={styles.itemDesc}>
                  Ajusta o tamanho do texto em toda a interface
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-[52px]">
              {fonteLabels.map((l, i) => (
                <button
                  key={l}
                  onClick={() => setDraft({ fonte: i as FontSize })}
                  aria-pressed={fonte === i}
                  className="text-[12.5px] font-semibold px-4 py-2 border"
                  style={getFonteButtonStyle(fonte === i)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={styles.iconBox}>
              <Languages size={17} color={iconOrangeColor} />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold" style={styles.itemTitle}>
                Idioma
              </p>
              <p className="text-[12px]" style={styles.languageValue}>
                Português (Brasil)
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!dirty}
            style={{ ...styles.saveButton, opacity: dirty ? 1 : 0.55 }}
            className="w-full h-12 text-white font-semibold text-sm mt-4 flex items-center justify-center gap-2"
          >
            <Save size={16} /> {dirty ? "Salvar preferências" : "Preferências salvas"}
          </button>

          <button
            onClick={handleReset}
            className="w-full h-11 border font-semibold text-[13px] mt-3 flex items-center justify-center gap-2"
            style={{ borderColor: styles.cardBorder.borderColor, color: styles.cardSubtitle.color }}
          >
            <Undo2 size={15} /> Restaurar padrão
          </button>
        </div>

        {/* Coluna direita — pré-visualização */}
        <div className="col-span-2 bg-white border p-6 flex flex-col" style={styles.cardBorder}>
          <p className="kicker mb-4" style={styles.cardTitle}>
            Pré-visualização
          </p>
          <div
            className="a11y-preview border p-4 flex-1"
            data-hc={contraste ? "on" : "off"}
            style={getPreviewBoxStyle(contraste)}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                data-a11y-dot=""
                style={getPreviewDotStyle(contraste, reducaoMov)}
              />
              <AlertTriangle size={16} color={getPreviewIconColor(contraste)} />
              <span style={getPreviewTitleStyle(contraste, fonte)}>
                Leito 402 — Alerta crítico
              </span>
            </div>
            <p style={getPreviewTextStyle(contraste, fonte)}>
              Expressão de dor intensa detectada pela IA, com frequência cardíaca em elevação. Avaliação clínica recomendada.
            </p>
            <button
              type="button"
              className="mt-4 h-9 px-3 border font-semibold"
              style={{ ...getPreviewButtonStyle(contraste), fontSize: getPreviewTextStyle(contraste, fonte).fontSize }}
            >
              Ver leito
            </button>
            <p className="mt-3" style={{ ...getPreviewTextStyle(contraste, fonte), opacity: 0.85 }}>
              {reducaoMov ? "Animações desativadas" : "Animações ativas"} ·{" "}
              {leitor ? "Leitor de tela ativo" : "Leitor de tela desativado"} ·{" "}
              {vibracao ? "Vibração ativa" : "Vibração desativada"}
            </p>
          </div>
          <p className="text-[11px] mt-3" style={styles.previewCaption}>
            {dirty
              ? "Pré-visualização das alterações ainda não salvas."
              : "Assim os alertas aparecem com as preferências atuais."}
          </p>
          <button
            onClick={handleTestAlert}
            className="w-full h-11 border font-semibold text-[13px] mt-3 flex items-center justify-center gap-2"
            style={{ borderColor: styles.cardBorder.borderColor, color: styles.cardTitle.color }}
          >
            <Play size={14} /> Testar alerta
          </button>
        </div>
      </div>
    </div>
  );
};