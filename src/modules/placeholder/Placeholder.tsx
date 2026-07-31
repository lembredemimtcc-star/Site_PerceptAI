import React from "react";
import { LayoutGrid } from "lucide-react";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { navItems } from "../../config/mockData";

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
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: COLORS.orangeSoft }}>
          <Icon size={24} color={COLORS.orange} />
        </div>
        <p className="font-semibold" style={{ color: COLORS.ink }}>
          {item?.label}
        </p>
        <p className="text-[13px]" style={{ color: COLORS.slateSoft }}>
          Protótipo desta página em desenvolvimento.
        </p>
      </div>
    </div>
  );
};
