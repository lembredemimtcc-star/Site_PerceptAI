import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { TopBar } from "../../../shared/components";
import { BedCard } from "../../../components/BedCard";
import { AlertBanner } from "../../../components/AlertBanner";
import { SearchInput } from "../../../components/SearchInput";
import { useInternacoes } from "../../../hooks";
import { Bed, RiskLevel } from "../../../types";
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
  const { data: internacoes = [], isLoading } = useInternacoes();
  
  const bedsState: Bed[] = internacoes.map(int => ({
    id: int.leito?.numero || "??",
    internacaoId: int.id,
    name: int.paciente?.nome || "Desconhecido",
    hr: 0, // will be loaded by BedCard
    hrSeries: [], // will be loaded by BedCard
    mood: "neutro", // will be loaded by BedCard
    conf: 0,
    risk: int.risco as RiskLevel,
    acordado: true,
    ts: "",
    status: int.ativo ? "internado" : "alta",
  }));

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

  const handleChangeRisk = (bedId: string, risk: RiskLevel) => {
    // TODO: Mutation for supabase
  };

  const handleToggleStatus = (bedId: string) => {
    // TODO: Mutation for supabase
  };

  const filteredBeds = bedsState.filter(bed => {
    const matchesFilter = filter === "all" || bed.risk === filter;
    const matchesSearch = bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const criticalCount = bedsState.filter(b => b.risk === "critical" && b.status === "internado").length;
  const attentionCount = bedsState.filter(b => b.risk === "attention" && b.status === "internado").length;

  const currentFilterLabel = FILTER_OPTIONS.find(opt => opt.value === filter)?.label ?? "Todos";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard de Pacientes" subtitle={`${bedsState.length} leitos monitorados`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alertas críticos */}
        {criticalCount > 0 && (
          <AlertBanner
            variant="critical"
            title={`${criticalCount} paciente${criticalCount > 1 ? "s" : ""} em situação crítica`}
            subtitle="Requer atenção imediata"
          />
        )}

        {/* Filtros e busca */}
        <div className="bg-white rounded-xl border p-4" style={styles.filterCard}>
          <div className="flex gap-2 mb-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar paciente ou leito..."
            />

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
          {isLoading ? (
            <p className="text-gray-500 text-sm py-4">Carregando pacientes...</p>
          ) : filteredBeds.map(bed => (
            <BedCard
              key={bed.id}
              bed={bed}
              onSelect={onOpenBed}
              onChangeRisk={handleChangeRisk}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>

        {/* Pacientes recentes */}
        <div className="bg-white rounded-xl border p-4" style={styles.sectionCard}>
          <p className="text-sm font-bold mb-3" style={styles.sectionTitle}>
            Pacientes sob monitoramento intenso
          </p>
          <div className="space-y-2">
            {bedsState.filter(b => b.risk === "critical" || b.risk === "attention").slice(0, 5).map((patient, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={styles.patientRow}>
                <div>
                  <p className="text-sm font-semibold" style={styles.patientName}>
                    {patient.name}
                  </p>
                  <p className="text-xs" style={styles.patientBed}>
                    Leito {patient.id}
                  </p>
                </div>
                <div
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={getRiskBadgeStyle(patient.risk)}
                >
                  {patient.risk === "critical" ? "Crítico" : "Atenção"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};