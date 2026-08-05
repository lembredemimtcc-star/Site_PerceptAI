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
    <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: COLORS.line, background: COLORS.card }}>
      {onBack && (
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} color={COLORS.ink} />
        </button>
      )}
      <div>
        <h1 className="text-xl font-bold" style={{ color: COLORS.ink }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm" style={{ color: COLORS.slateSoft }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
