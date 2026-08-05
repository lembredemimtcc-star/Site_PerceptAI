import { COLORS } from "../../config/colors";

export type AlertVariant = "warning" | "critical";

const variantColors: Record<AlertVariant, { bg: string; border: string; text: string }> = {
  warning: {
    bg: COLORS.orangeSoft,
    border: COLORS.orange,
    text: COLORS.orangeDark,
  },
  critical: {
    bg: COLORS.redSoft,
    border: COLORS.red,
    text: COLORS.red,
  },
};

export const getAlertBannerStyle = (variant: AlertVariant = "warning") => {
  const c = variantColors[variant];
  return {
    alertBox: {
      background: c.bg,
      borderColor: c.border,
    },
    alertIconColor: c.text,
    alertTitle: {
      color: c.text,
    },
    alertSubtitle: {
      color: c.text,
    },
  };
};