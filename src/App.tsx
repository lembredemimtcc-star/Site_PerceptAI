import React, { useState } from "react";
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
import { Mapa } from "./modules/mapa";
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
          {page === "mapa" && <Mapa />}
          {page === "info-ia" && <InfoIA bed={selectedBed} onBack={() => setPage("dash-pacientes")} />}
        </div>
      )}
    </div>
  );
}
