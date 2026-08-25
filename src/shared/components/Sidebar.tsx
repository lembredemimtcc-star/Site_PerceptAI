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
      className="hidden md:flex w-[248px] flex-col overflow-hidden relative"
      style={{ background: COLORS.orangePainel }}
    >
      {/* moldura fina, mesmo padrão do login */}
      <div
        className="absolute inset-3 border pointer-events-none"
        style={{ borderColor: COLORS.card, borderWidth: "1px", opacity: 0.5 }}
      />

      <div
        className="px-6 pt-8 pb-7 relative"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.18)` }}
      >
        <p className="kicker mb-3 text-[12px] font-semibold uppercase" style={{ color: COLORS.orange, letterSpacing: "0.12em" }}>
          Hospital
        </p>
        <h2 className="display text-[1.7rem] font-semibold leading-none" style={{ color: COLORS.card }}>
          PerceptAI
        </h2>
        <p className="text-[13px] mt-3 leading-snug" style={{ color: COLORS.orangeSoft, opacity: 0.85 }}>
          Monitoramento hospitalar
        </p>
      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-5 relative">
        {navItems.filter(item => item.key !== "login").map(item => {
          const Icon = item.icon;
          const isActive = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-[13.5px] text-left transition-colors"
              style={{
                background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
                color: isActive ? COLORS.card : COLORS.orangeSoft,
                fontWeight: isActive ? 600 : 400,
                borderRadius: "8px",
              }}
            >
              <Icon size={16} strokeWidth={1.75} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        className="px-3 py-5 relative"
        style={{ borderTop: `1px solid rgba(255,255,255,0.18)` }}
      >
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