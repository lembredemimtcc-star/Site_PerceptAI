import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { supabase } from "./lib/supabase";
import { signOut } from "./lib/auth";
import { FontsAndStyles } from "./config/fonts";
import { COLORS } from "./config/colors";
import { Sidebar, MobileNavbar } from "./shared/components";
import { AccessibilityProvider } from "./shared/accessibility";
import { LoginScreen } from "./modules/auth";
import { Dashboard, DashMedicos } from "./modules/dashboard";
import { Estoque } from "./modules/estoque";
import { Acessibilidade } from "./modules/acessibilidade";
import { InfoIA } from "./modules/info-ia";
import { Medicamentos } from "./modules/medicamentos";
import { Cadastro } from "./modules/cadastro";
import { Visitas } from "./modules/visitas";
import { Calendario } from "./modules/calendario";
import { Prontuario } from "./modules/prontuario";
import { Bed } from "./types";

export default function PerceptAIPrototype() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <AppShell />
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dash-pacientes");
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = async (key: string) => {
    if (key === "login") {
      await signOut();
      setLoggedIn(false);
      return;
    }
    setPage(key);
    setIsMobileNavbarOpen(false);
  };

  const openBed = (bed: Bed) => {
    setSelectedBed(bed);
    setPage("info-ia");
  };

  return (
    <div className="w-full h-screen" style={{ background: COLORS.bg }}>
      {FontsAndStyles()}
      <Toaster
        position="top-right"
        expand={false}
        gap={10}
        toastOptions={{
          duration: 3500,
          unstyled: false,
          classNames: { toast: "perceptai-toast" },
          style: {
            background: COLORS.card,
            border: `1px solid ${COLORS.line}`,
            borderLeft: `4px solid ${COLORS.orange}`,
            color: COLORS.ink,
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 500,
            padding: "12px 14px",
            boxShadow: "none",
          },
        }}
        icons={{
          success: <ToastMark bg={COLORS.greenSoft} color={COLORS.green} label="✓" />,
          error: <ToastMark bg={COLORS.redSoft} color={COLORS.red} label="✕" />,
          warning: <ToastMark bg={COLORS.orangeSoft} color={COLORS.orange} label="!" />,
          info: <ToastMark bg={COLORS.orangeSoft} color={COLORS.orange} label="i" />,
        }}
      />

      {!loggedIn ? (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      ) : (
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar current={page} onNavigate={navigate} />
          <MobileNavbar
            current={page}
            onNavigate={navigate}
            isOpen={isMobileNavbarOpen}
            onToggle={() => setIsMobileNavbarOpen((v) => !v)}
          />
          <div className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0 overflow-y-auto">
            {page === "dash-pacientes" && <Dashboard onOpenBed={openBed} />}
            {page === "dash-medicos" && <DashMedicos onOpenBed={openBed} />}
            {page === "info-ia" && (
              <InfoIA bed={selectedBed} onBack={() => setPage("dash-pacientes")} />
            )}
            {page === "estoque" && <Estoque />}
            {page === "acessibilidade" && <Acessibilidade />}
            {page === "medicamentos" && <Medicamentos />}
            {page === "cadastro" && <Cadastro />}
            {page === "visitas" && <Visitas />}
            {page === "calendario" && <Calendario />}
            {page === "prontuario" && <Prontuario />}
          </div>
        </div>
      )}
    </div>
  );
}

function ToastMark({ bg, color, label }: { bg: string; color: string; label: string }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "2px",
        background: bg,
        color,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}
