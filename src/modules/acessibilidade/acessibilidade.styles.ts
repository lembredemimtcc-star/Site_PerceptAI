import { COLORS } from "../../config/colors";

export const acessibilidadeStyles = {
  cardBorder: {
    borderColor: COLORS.line,
  },
  cardTitle: {
    color: COLORS.ink,
  },
  cardSubtitle: {
    color: COLORS.slateSoft,
  },
  iconBox: {
    background: COLORS.orangeSoft,
  },
  itemTitle: {
    color: COLORS.ink,
  },
  itemDesc: {
    color: COLORS.slateSoft,
  },
  languageValue: {
    color: COLORS.slateSoft,
  },
  previewLabel: {
    color: COLORS.ink,
  },
  previewCaption: {
    color: COLORS.slateSoft,
  },
};

// Estilos dinâmicos (dependem do estado do componente)
export const getFonteButtonStyle = (isActive: boolean) => ({
  borderColor: isActive ? COLORS.orange : COLORS.line,
  background: isActive ? COLORS.orange : COLORS.card,
  color: isActive ? COLORS.card : COLORS.slate,
});

// Botão "Salvar preferências" — ativo em orange, desabilitado em orangeDark + opacity 0.55
export const getSaveButtonStyle = (dirty: boolean) => ({
  background: dirty ? COLORS.orange : COLORS.orangeDark,
  opacity: dirty ? 1 : 0.55,
  cursor: dirty ? "pointer" : "not-allowed",
});

// Mesmos tons usados pelo alto contraste global (styles.css) — modo de acessibilidade,
// não faz parte da identidade de marca, mantém preto/amarelo por ser padrão de a11y
const HC_BG = "#000000";
const HC_FG = "#FFEB00";

export const getPreviewBoxStyle = (contraste: boolean) => ({
  borderColor: contraste ? HC_FG : COLORS.line,
  borderWidth: contraste ? 2 : 1,
  background: contraste ? HC_BG : COLORS.bg,
});

// Vermelho mantido: alerta clínico crítico é risco real, não muda pra laranja
export const getPreviewIconColor = (contraste: boolean) => (contraste ? HC_FG : COLORS.red);

const FONT_SCALE = [0.9, 1, 1.15] as const;
const scaled = (base: number, fonte: number) =>
  Math.round(base * (FONT_SCALE[fonte] ?? 1) * 10) / 10;

export const getPreviewTitleStyle = (contraste: boolean, fonte: number) => ({
  color: contraste ? HC_FG : COLORS.ink,
  fontSize: scaled(14, fonte),
  fontWeight: 700,
});

export const getPreviewTextStyle = (contraste: boolean, fonte: number) => ({
  color: contraste ? HC_FG : COLORS.slate,
  fontSize: scaled(12.5, fonte),
  lineHeight: 1.6,
});

export const getPreviewButtonStyle = (contraste: boolean) => ({
  background: contraste ? "#111111" : COLORS.card,
  color: contraste ? HC_FG : COLORS.ink,
  borderColor: contraste ? HC_FG : COLORS.line,
  borderWidth: contraste ? 2 : 1,
});

// Vermelho mantido: indicador do mesmo alerta crítico acima
export const getPreviewDotStyle = (contraste: boolean, reducaoMov: boolean) => ({
  background: contraste ? HC_FG : COLORS.red,
  animation: reducaoMov ? "none" : "a11y-preview-pulse 1.2s ease-in-out infinite",
});

export const iconOrangeColor = COLORS.orange;