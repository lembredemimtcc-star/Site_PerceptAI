import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, AlertTriangle, ChevronDown } from "lucide-react";
import { TopBar } from "../../shared/components";
import { BedCard } from "./components/BedCard";
import { beds, recentPatients } from "../../config/mockData";
import { Bed, RiskLevel } from "../../types";
import { dashboardStyles as styles, getRiskBadgeStyle, getFilterOptionStyle } from "./Dashboard.styles";

interface DashboardProps {
  onOpenBed: (bed: Bed) => void;
}

const FILTER_OPTIONS: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "critical", label: "Críticos" },
  { value: "attention", label: "Atenção" },
];

export const Dashboard: React.FC<DashboardProps> = ({ onOpenBed }) => {
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBeds = beds.filter(bed => {
    const matchesFilter = filter === "all" || bed.risk === filter;
    const matchesSearch = bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const criticalCount = beds.filter(b => b.risk === "critical").length;
  const attentionCount = beds.filter(b => b.risk === "attention").length;

  const currentFilterLabel = FILTER_OPTIONS.find(opt => opt.value === filter)?.label ?? "Todos";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard de Pacientes" subtitle={`${beds.length} leitos monitorados`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alertas críticos */}
        {criticalCount > 0 && (
          <div className="p-4 rounded-xl border-2 flex items-center gap-3" style={styles.alertBox}>
            <AlertTriangle size={20} color={styles.alertIconColor} className="shrink-0" />
            <div>
              <p className="font-semibold text-sm" style={styles.alertTitle}>
                {criticalCount} paciente{criticalCount > 1 ? "s" : ""} em situação crítica
              </p>
              <p className="text-xs mt-1" style={styles.alertSubtitle}>
                Requer atenção imediata
              </p>
            </div>
          </div>
        )}

        {/* Filtros e busca */}
        <div className="bg-white rounded-xl border p-4" style={styles.filterCard}>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={styles.searchIconColor} />
              <input
                type="text"
                placeholder="Buscar paciente ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm"
                style={styles.searchInput}
              />
            </div>

            {/* Dropdown de filtro */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                className="px-3 py-2 rounded-lg border flex items-center gap-2 text-sm"
                style={styles.filterButton}
                onClick={() => setIsFilterOpen(prev => !prev)}
              >
                <Filter size={16} color={styles.filterIconColor} />
                {currentFilterLabel}
                <ChevronDown
                  size={14}
                  color={styles.filterIconColor}
                  className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isFilterOpen && (
                <div
                  className="absolute right-0 mt-1 w-40 rounded-lg border shadow-lg overflow-hidden z-10"
                  style={styles.filterDropdownMenu}
                >
                  {FILTER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm flex items-center justify-between"
                      style={getFilterOptionStyle(filter === option.value)}
                      onClick={() => {
                        setFilter(option.value);
                        setIsFilterOpen(false);
                      }}
                    >
                      {option.label}
                      {option.value === "critical" && criticalCount > 0 && (
                        <span className="text-xs opacity-70">{criticalCount}</span>
                      )}
                      {option.value === "attention" && attentionCount > 0 && (
                        <span className="text-xs opacity-70">{attentionCount}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards dos leitos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBeds.map(bed => (
            <BedCard key={bed.id} bed={bed} onSelect={onOpenBed} />
          ))}
        </div>

        {/* Pacientes recentes */}
        <div className="bg-white rounded-xl border p-4" style={styles.sectionCard}>
          <p className="text-sm font-bold mb-3" style={styles.sectionTitle}>
            Pacientes sob monitoramento intenso
          </p>
          <div className="space-y-2">
            {recentPatients.map((patient, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={styles.patientRow}>
                <div>
                  <p className="text-sm font-semibold" style={styles.patientName}>
                    {patient.nome}
                  </p>
                  <p className="text-xs" style={styles.patientBed}>
                    Leito {patient.leito}
                  </p>
                </div>
                <div
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={getRiskBadgeStyle(patient.risco)}
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