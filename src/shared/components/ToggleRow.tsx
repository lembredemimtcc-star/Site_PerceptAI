import React from "react";
import { LucideIcon } from "lucide-react";
import { COLORS } from "../../config/colors";

interface ToggleRowProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ icon: Icon, title, desc, checked, onChange }) => {
  return (
    <div className="py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: COLORS.orangeSoft }}>
          <Icon size={17} color={COLORS.orange} />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold" style={{ color: COLORS.ink }}>
            {title}
          </p>
          <p className="text-[12px]" style={{ color: COLORS.slateSoft }}>
            {desc}
          </p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ background: checked ? COLORS.green : COLORS.line }}
      >
        <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform" style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
};
