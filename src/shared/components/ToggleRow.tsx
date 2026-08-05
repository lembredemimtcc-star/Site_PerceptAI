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
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors shrink-0"
        style={{ background: checked ? COLORS.green : COLORS.line }}
      >
        <span
          className="absolute top-1/4 -translate-y-1 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(0px)" : "translateX(-20px)" }}
        />
      </button>
    </div>
  );
};