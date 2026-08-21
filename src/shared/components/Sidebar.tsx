import React from "react";
import { LogOut } from "lucide-react";
import { COLORS } from "../../config/colors";
import { navItems } from "../../config/mockData";

interface SidebarProps {
  current: string;
  onNavigate: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ current, onNavigate }) => {
  return (
    <div
      className="hidden md:flex w-[248px] flex-col overflow-hidden"
      style={{ background: COLORS.ink }}
    >
      <div className="px-6 pt-8 pb-7" style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <p className="kicker mb-3" style={{ color: COLORS.orange }}>
          Hospital
        </p>
        <h2 className="display text-[1.7rem] font-semibold leading-none" style={{ color: COLORS.card }}>
          PerceptAI
        </h2>
        <p className="text-[13px] mt-3 leading-snug" style={{ color: COLORS.line }}>
          Monitoramento hospitalar
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navItems.filter(item => item.key !== "login").map(item => {
          const Icon = item.icon;
          const isActive = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-[13.5px] text-left"
              style={{
                background: isActive ? COLORS.orange : "transparent",
                color: isActive ? COLORS.card : COLORS.line,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={16} strokeWidth={1.75} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-5" style={{ borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        <button
          onClick={() => onNavigate("login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium text-left"
          style={{ color: COLORS.redSoft }}
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </div>
  );
};
