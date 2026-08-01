import React from "react";
import { AlertTriangle } from "lucide-react";
import { lowStockAlertStyles as styles } from "./styles/LowStockAlert.styles";

interface LowStockAlertProps {
  count: number;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="p-4 rounded-xl border-2 flex items-center gap-3" style={styles.alertBox}>
      <AlertTriangle size={20} color={styles.alertIconColor} className="shrink-0" />
      <div>
        <p className="font-semibold text-sm" style={styles.alertTitle}>
          {count} item{count > 1 ? "ns" : ""} com estoque baixo
        </p>
        <p className="text-xs mt-1" style={styles.alertSubtitle}>
          Reposição necessária
        </p>
      </div>
    </div>
  );
};