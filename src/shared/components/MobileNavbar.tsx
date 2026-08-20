import React from "react";
import { Menu, X, LayoutGrid, Stethoscope, Sparkles, Package, Pill, FileText, Users, Calendar, LogOut, UserPlus, Accessibility } from "lucide-react";
import { COLORS } from "../../config/colors";
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
      {/* Top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4" style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="p-2 rounded-lg" style={{ color: COLORS.slate, background: "transparent" }}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold" style={{ color: COLORS.orange }}>PerceptAI</span>
        </div>
        <span className="text-xs font-medium" style={{ color: COLORS.slateSoft }}>
          {filteredItems.find(i => i.key === current)?.label || ""}
        </span>
      </div>

      {/* Side drawer */}
      {isOpen && (
        <div className="md:hidden fixed top-14 left-0 bottom-0 z-50 w-[280px] flex flex-col" style={{ background: COLORS.card, borderRight: `1px solid ${COLORS.line}` }}>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 pt-4">
            {filteredItems.map(item => {
              const isActive = current === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => { onNavigate(item.key); onToggle(); }}
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
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onToggle} />
      )}
    </>
  );
};