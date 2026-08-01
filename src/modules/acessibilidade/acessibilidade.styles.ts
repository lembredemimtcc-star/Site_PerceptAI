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
  saveButton: {
    background: COLORS.orange,
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
  background: isActive ? COLORS.orange : "white",
  color: isActive ? "white" : COLORS.slate,
});

export const getPreviewBoxStyle = (contraste: boolean) => ({
  borderColor: COLORS.line,
  background: contraste ? COLORS.ink : COLORS.bg,
});

export const getPreviewIconColor = (contraste: boolean) =>
  contraste ? "#FFB199" : COLORS.red;

export const getPreviewTitleStyle = (contraste: boolean, fonte: number) => ({
  color: contraste ? "#FFFFFF" : COLORS.ink,
  fontSize: fonte === 0 ? 12 : fonte === 1 ? 14 : 17,
  fontWeight: 700,
});

export const getPreviewTextStyle = (contraste: boolean, fonte: number) => ({
  color: contraste ? "#D6DBE1" : COLORS.slate,
  fontSize: fonte === 0 ? 11 : fonte === 1 ? 12.5 : 15,
  lineHeight: 1.6,
});

export const iconOrangeColor = COLORS.orange;