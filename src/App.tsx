import React, { useState } from "react";
import { Toaster } from "sonner";
import { FontsAndStyles } from "./config/fonts";
import { COLORS } from "./config/colors";
import { Sidebar } from "./shared/components";
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
import { Bed } from "./types";

export default function PerceptAIPrototype() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dash-pacientes");
  const [selectedBed, setSelectedBed] = useState<Bed>(beds.find(b => b.risk === "critical") || beds[0]);

  const navigate = (key: string) => {
    if (key === "login") {
      setLoggedIn(false);
      return;
    }
    setPage(key);
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
          classNames: {
            toast: "perceptai-toast",
          },
          style: {
            background: COLORS.card,
            border: `1px solid ${COLORS.line}`,
            borderLeft: `4px solid ${COLORS.orange}`,
            color: COLORS.ink,
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: 500,
            padding: "14px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
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
                borderRadius: "50%",
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
                borderRadius: "50%",
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
                borderRadius: "50%",
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
                borderRadius: "50%",
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
        <div className="flex h-screen w-full">
          <Sidebar current={page} onNavigate={navigate} />
          {page === "dash-pacientes" && <Dashboard onOpenBed={openBed} />}
          {page === "dash-medicos" && <DashMedicos onOpenBed={openBed} />}
          {page === "info-ia" && <InfoIA bed={selectedBed} onBack={() => setPage("dash-pacientes")} />}
          {page === "estoque" && <Estoque />}
          {page === "acessibilidade" && <Acessibilidade />}
          {page === "medicamentos" && <Medicamentos />}
          {page === "cadastro" && <Cadastro />}
          {page === "visitas" && <Visitas />}
          {page === "calendario" && <Calendario />}
        </div>
      )}
    </div>
  );
}