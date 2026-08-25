import React from "react";
import { ArrowLeft } from "lucide-react";
import { COLORS } from "../../config/colors";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onBack }) => {
  return (
    <div
      className="flex items-end gap-5 px-8 pt-6 pb-5"
      style={{
        background: COLORS.card,
        borderBottom: `1px solid ${COLORS.line}`,
        boxShadow: `inset 0 4px 0 ${COLORS.orange}`,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="mb-1 p-1 flex items-center justify-center transition-colors hover:opacity-70"
          style={{
            background: "transparent",
            border: "none",
            color: COLORS.slate,
          }}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
      )}
      <div className="min-w-0">
        <p className="kicker mb-2" style={{ color: COLORS.orange }}>
          PerceptAI
        </p>
        <h1 className="display text-[1.85rem] font-semibold leading-[1.15]" style={{ color: COLORS.ink }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] mt-1.5" style={{ color: COLORS.slate }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};