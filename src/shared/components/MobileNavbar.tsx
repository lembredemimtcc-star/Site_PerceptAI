import React from "react";
import { Menu, X, LogOut } from "lucide-react";
import { COLORS, INK_OVERLAY } from "../../config/colors";
import { navItems } from "../../config/mockData";

interface MobileNavbarProps {
  current: string;
  onNavigate: (key: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ current, onNavigate, isOpen, onToggle }) => {
  const filteredItems = navItems.filter(item => item.key !== "login");

  return (
    <>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4"
        style={{ background: COLORS.orangePainel }}
      >
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="p-2" style={{ color: COLORS.card }}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="display text-[1.15rem] font-semibold" style={{ color: COLORS.card }}>
            PerceptAI
          </span>
        </div>
        <span className="kicker" style={{ color: COLORS.card }}>
          {filteredItems.find(i => i.key === current)?.label || ""}
        </span>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed top-14 left-0 bottom-0 z-50 w-[270px] flex flex-col"
          style={{ background: COLORS.orangePainel }}
        >
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {filteredItems.map(item => {
              const isActive = current === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => { onNavigate(item.key); onToggle(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-[13.5px] text-left"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
                    color: COLORS.card,
                    fontWeight: isActive ? 600 : 400,
                    opacity: isActive ? 1 : 0.75,
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="px-3 py-4" style={{ borderTop: `1px solid rgba(255,255,255,0.16)` }}>
            <button
              onClick={() => onNavigate("login")}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium text-left"
              style={{ color: COLORS.card, opacity: 0.85 }}
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sair
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: INK_OVERLAY }}
          onClick={onToggle}
        />
      )}
    </>
  );
};