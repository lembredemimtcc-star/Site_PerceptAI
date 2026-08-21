import React from "react";
import { LayoutGrid } from "lucide-react";
import { TopBar } from "../../shared/components";
import { navItems } from "../../config/mockData";
import { placeholderStyles as styles } from "./Placeholder.styles";

interface PlaceholderProps {
  page: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ page }) => {
  const item = navItems.find(n => n.key === page);
  const Icon = item?.icon || LayoutGrid;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title={item?.label || "Página"} />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 flex items-center justify-center" style={styles.iconBox}>
          <Icon size={24} color={styles.iconColor} />
        </div>
        <p className="font-semibold" style={styles.title}>
          {item?.label}
        </p>
        <p className="text-[13px]" style={styles.subtitle}>
          Protótipo desta página em desenvolvimento.
        </p>
      </div>
    </div>
  );
};