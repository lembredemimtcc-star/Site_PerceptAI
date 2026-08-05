import React from "react";
import { AlertTriangle } from "lucide-react";
import { getAlertBannerStyle, type AlertVariant } from "./styles/AlertBanner.styles";

interface AlertBannerProps {
  title: string;
  subtitle: string;
  variant?: AlertVariant;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ title, subtitle, variant = "warning" }) => {
  const styles = getAlertBannerStyle(variant);

  return (
    <div className="p-4 rounded-xl border-2 flex items-center gap-3" style={styles.alertBox}>
      <AlertTriangle size={20} color={styles.alertIconColor} className="shrink-0" />
      <div>
        <p className="font-semibold text-sm" style={styles.alertTitle}>
          {title}
        </p>
        <p className="text-xs mt-1" style={styles.alertSubtitle}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};