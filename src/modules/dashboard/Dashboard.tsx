import React, { useState } from "react";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { TopBar } from "../../shared/components";
import { BedCard } from "./components/BedCard";
import { COLORS } from "../../config/colors";
import { beds, recentPatients } from "../../config/mockData";
import { Bed, RiskLevel } from "../../types";

interface DashboardProps {
  onOpenBed: (bed: Bed) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenBed }) => {
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBeds = beds.filter(bed => {
    const matchesFilter = filter === "all" || bed.risk === filter;
    const matchesSearch = bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const criticalCount = beds.filter(b => b.risk === "critical").length;
  const attentionCount = beds.filter(b => b.risk === "attention").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard de Pacientes" subtitle={`${beds.length} leitos monitorados`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alertas críticos */}
        {criticalCount > 0 && (
          <div className="p-4 rounded-xl border-2 flex items-center gap-3" style={{ background: COLORS.redSoft, borderColor: COLORS.red }}>
            <AlertTriangle size={20} color={COLORS.red} className="shrink-0" />
            <div>
              <p className="font-semibold text-sm" style={{ color: COLORS.red }}>
                {criticalCount} paciente{criticalCount > 1 ? "s" : ""} em situação crítica
              </p>
              <p className="text-xs mt-1" style={{ color: COLORS.red }}>
                Requer atenção imediata
              </p>
            </div>
          </div>
        )}

        {/* Filtros e busca */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: COLORS.line }}>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={COLORS.slateSoft} />
              <input
                type="text"
                placeholder="Buscar paciente ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: COLORS.line, background: COLORS.bg }}
              />
            </div>
            <button
              className="px-3 py-2 rounded-lg border flex items-center gap-2 text-sm"
              style={{ borderColor: COLORS.line }}
              onClick={() => setFilter(filter === "all" ? "critical" : filter === "critical" ? "attention" : "all")}
            >
              <Filter size={16} color={COLORS.slate} />
              {filter === "all" ? "Todos" : filter === "critical" ? "Críticos" : "Atenção"}
            </button>
          </div>
        </div>

        {/* Cards dos leitos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBeds.map(bed => (
            <BedCard key={bed.id} bed={bed} onSelect={onOpenBed} />
          ))}
        </div>

        {/* Pacientes recentes */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: COLORS.line }}>
          <p className="text-sm font-bold mb-3" style={{ color: COLORS.ink }}>
            Pacientes sob monitoramento intenso
          </p>
          <div className="space-y-2">
            {recentPatients.map((patient, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.bg }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.ink }}>
                    {patient.nome}
                  </p>
                  <p className="text-xs" style={{ color: COLORS.slateSoft }}>
                    Leito {patient.leito}
                  </p>
                </div>
                <div
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{
                    background: patient.risco === "critical" ? COLORS.redSoft : COLORS.orangeSoft,
                    color: patient.risco === "critical" ? COLORS.red : COLORS.orange,
                  }}
                >
                  {patient.risco === "critical" ? "Crítico" : "Atenção"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
