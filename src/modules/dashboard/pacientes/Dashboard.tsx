import React, { useState, useRef, useEffect, useMemo } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../../../shared/components";
import { BedCard } from "../../../components/BedCard";
import { AlertBanner } from "../../../components/AlertBanner";
import { SearchInput } from "../../../components/SearchInput";
import { useBeds } from "../../../hooks";
import { Bed, RiskLevel } from "../../../types";
import { atualizarRiscoInternacao, atualizarStatusInternacao } from "../../../lib/mutations";
import { COLORS } from "../../../config/colors";
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
  const { data: bedsFromDb = [], isLoading, refetch } = useBeds(false);
  const [overrides, setOverrides] = useState<Record<string, Partial<Bed>>>({});

  const bedsState = useMemo(
    () =>
      bedsFromDb.map((bed) => {
        const key = bed.internacaoId || bed.id;
        return overrides[key] ? { ...bed, ...overrides[key] } : bed;
      }),
    [bedsFromDb, overrides]
  );

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

  const handleChangeRisk = async (internacaoId: string, risk: RiskLevel) => {
    const previous = overrides;
    setOverrides((prev) => ({
      ...prev,
      [internacaoId]: { ...prev[internacaoId], risk },
    }));
    try {
      await atualizarRiscoInternacao(internacaoId, risk);
      refetch();
    } catch (err: any) {
      setOverrides(previous);
      toast.error(err.message || "Não foi possível atualizar o risco");
    }
  };

  const handleToggleStatus = async (internacaoId: string) => {
    const target = bedsState.find((b) => b.internacaoId === internacaoId);
    if (!target) return;
    const internado = target.status !== "internado";
    const previous = overrides;
    setOverrides((prev) => ({
      ...prev,
      [internacaoId]: { ...prev[internacaoId], status: internado ? "internado" : "alta" },
    }));
    try {
      await atualizarStatusInternacao(internacaoId, target.leitoDbId, internado);
      refetch();
    } catch (err: any) {
      setOverrides(previous);
      toast.error(err.message || "Não foi possível atualizar o status");
    }
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

      <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
        {/* Alertas críticos */}
        {criticalCount > 0 && (
          <AlertBanner
            variant="critical"
            title={`${criticalCount} paciente${criticalCount > 1 ? "s" : ""} em situação crítica`}
            subtitle="Requer atenção imediata"
          />
        )}

        {/* Filtros e busca */}
        <div className="flex items-end gap-4 pb-2" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar paciente ou leito..."
            />

            {/* Dropdown de filtro */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                className="px-3 py-2 border flex items-center gap-2 text-sm"
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
                  className="absolute right-0 mt-1 w-40 border overflow-hidden z-10"
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

        {/* Cards dos leitos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            <p className="text-sm py-4" style={{ color: COLORS.slateSoft }}>Carregando pacientes...</p>
          ) : filteredBeds.map((bed, index) => (
            <BedCard
              key={bed.internacaoId || bed.id + "-" + index}
              bed={bed}
              onSelect={onOpenBed}
              onChangeRisk={handleChangeRisk}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>

        {/* Pacientes recentes */}
        <div className="border p-5" style={styles.sectionCard}>
          <p className="kicker mb-4" style={styles.sectionTitle}>
            Pacientes sob monitoramento intenso
          </p>
          <div className="space-y-2">
            {bedsState.filter(b => b.risk === "critical" || b.risk === "attention").slice(0, 5).map((patient, i) => (
              <div key={patient.internacaoId || patient.id + "-" + i} className="flex items-center justify-between px-3 py-2.5" style={styles.patientRow}>
                <div>
                  <p className="text-sm font-semibold" style={styles.patientName}>
                    {patient.name}
                  </p>
                  <p className="text-xs" style={styles.patientBed}>
                    Leito {patient.id}
                  </p>
                </div>
                <div
                  className="text-xs font-semibold px-2 py-0.5"
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