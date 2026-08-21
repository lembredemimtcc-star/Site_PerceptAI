import React, { useState, useEffect } from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from "sonner";
import { supabase } from "./lib/supabase";
import { signOut } from "./lib/auth";
import { FontsAndStyles } from "./config/fonts";
import { COLORS } from "./config/colors";
import { Sidebar, MobileNavbar } from "./shared/components";
import { AccessibilityProvider } from "./shared/accessibility";
import { useIsMobile } from "./hooks/use-mobile";
import { LoginScreen } from "./modules/auth";
import { Dashboard, DashMedicos } from "./modules/dashboard";
import { Estoque } from "./modules/estoque";
import { Acessibilidade } from "./modules/acessibilidade";
import { InfoIA } from "./modules/info-ia";
import { Medicamentos } from "./modules/medicamentos";
import { Cadastro } from "./modules/cadastro";
import { Visitas } from "./modules/visitas";
import { Calendario } from "./modules/calendario";
import { Placeholder } from "./modules/placeholder";
import { beds } from "./config/mockData";
import { Prontuario } from "./modules/prontuario";
import { Bed } from "./types";

export default function PerceptAIPrototype() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dash-pacientes");
  const [selectedBed, setSelectedBed] = useState<Bed>(
    (beds.find(b => b.risk === "critical") ?? beds[0])!
  );
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const toggleMobileNavbar = () => {
    setIsMobileNavbarOpen(prev => !prev);
  };

  const openBed = (bed: Bed) => {
    setSelectedBed(bed);
    setPage("info-ia");
  };

  return (
    <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <div className="w-full h-screen" style={{ background: COLORS.bg }}>
      {FontsAndStyles()}

      <Toaster
        position="top-right"
        expand={false}
        gap={10}
        toastOptions={{
          duration: 3500,
          unstyled: false,
          classNames: {
            toast: "perceptai-toast",
          },
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
          success: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "2px",
                background: COLORS.greenSoft,
                color: COLORS.green,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ✓
            </span>
          ),
          error: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "2px",
                background: COLORS.redSoft,
                color: COLORS.red,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ✕
            </span>
          ),
          warning: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "2px",
                background: COLORS.orangeSoft,
                color: COLORS.orange,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              !
            </span>
          ),
          info: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "2px",
                background: COLORS.orangeSoft,
                color: COLORS.orange,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              i
            </span>
          ),
        }}
      />

      {!loggedIn ? (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      ) : (
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar current={page} onNavigate={navigate} />
          <MobileNavbar current={page} onNavigate={navigate} isOpen={isMobileNavbarOpen} onToggle={toggleMobileNavbar} />
          <div className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0 overflow-y-auto">
            {page === "dash-pacientes" && <Dashboard onOpenBed={openBed} />}
            {page === "dash-medicos" && <DashMedicos onOpenBed={openBed} />}
            {page === "info-ia" && <InfoIA bed={selectedBed} onBack={() => setPage("dash-pacientes")} />}
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
    </AccessibilityProvider>
    </QueryClientProvider>
  );
}