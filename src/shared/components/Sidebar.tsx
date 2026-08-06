import React from "react";
import { LogOut } from "lucide-react";
import { COLORS } from "../../config/colors";
import { navItems } from "../../config/mockData";
import { FileText } from "lucide-react";

interface SidebarProps {
  current: string;
  onNavigate: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ current, onNavigate }) => {
  return (
    <div className="w-64 flex flex-col border-r overflow-hidden" style={{ borderColor: COLORS.line, background: COLORS.card }}>
      <div className="p-6 border-b" style={{ borderColor: COLORS.line }}>
        <h2 className="text-lg font-bold" style={{ color: COLORS.orange }}>
          PerceptAI
        </h2>
        <p className="text-xs mt-1" style={{ color: COLORS.slateSoft }}>
          Monitoramento hospitalar
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.filter(item => item.key !== "login").map(item => {
          const Icon = item.icon;
          const isActive = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              style={{
                background: isActive ? COLORS.orangeSoft : "transparent",
                color: isActive ? COLORS.orange : COLORS.slate,
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
        <button
          onClick={() => onNavigate("login")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
          style={{ color: COLORS.red }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
};
