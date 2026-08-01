import React, { useState } from "react";
import { Pill, Clock, AlertCircle, CheckCircle2, Syringe, Plus } from "lucide-react";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { Medicamento } from "./medicamentos.types";
import { NovoMedicamentoModal } from "../../components/modals/NovoMedicamentoModal";
import {
  medicamentosStyles as styles,
  statusCfg as statusIcons,
  getKpiIconBoxStyle,
  getStatusBadgeStyle,
  getStatusLabelStyle,
  getToggleButtonStyle,
} from "./Medicamentos.styles";

import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAdministracoes } from "../../hooks";

const statusIconMap = {
  administrado: CheckCircle2,
  pendente: Clock,
  atrasado: AlertCircle,
};

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border p-4 flex items-center gap-3" style={styles.kpiCard}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={getKpiIconBoxStyle(accent)}>
      <Icon size={18} color={accent} />
    </div>
    <div>
      <p className="mono text-lg font-bold leading-none" style={styles.kpiValue}>{value}</p>
      <p className="text-[11.5px] mt-1" style={styles.kpiLabel}>{label}</p>
    </div>
  </div>
);

export const Medicamentos: React.FC = () => {
  const { data: administracoes = [], isLoading } = useAdministracoes();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapear dados do Supabase para o formato da UI
  const items: Medicamento[] = administracoes.map((admin: any) => ({
    id: admin.id,
    leito: admin.internacao?.leito?.numero || "??",
    paciente: admin.internacao?.paciente?.nome || "Desconhecido",
    nome: admin.medicamento?.nome || "Desconhecido",
    via: admin.medicamento?.forma || "-",
    horario: admin.horario_previsto ? new Date(admin.horario_previsto).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "??",
    status: admin.status as any,
    recorrente: false, // Pode ser ajustado baseado no modelo real se tiver cronograma
  }));

  const toggleAdministrado = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "administrado" ? "pendente" : "administrado";
    
    // Optimistic update
    queryClient.setQueryData(['administracoes', undefined], (old: any) => {
      if (!old) return old;
      return old.map((m: any) => m.id === id ? { ...m, status: newStatus } : m);
    });

    try {
      const { error } = await supabase
        .from('administracoes_medicamento')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error(err);
      queryClient.invalidateQueries({ queryKey: ['administracoes'] }); // revert
    }
  };

  const handleAddMedicamento = (novo: Omit<Medicamento, "id" | "status">) => {
    // TODO: implement real add with Supabase
    setIsModalOpen(false);
  };

  const pendentesOuAtrasados = items.filter(m => m.status !== "administrado").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Medicamentos" subtitle="Administração e horários por leito · Ala UTI 2" />

      <div className="flex items-center justify-between px-8 pt-6">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <KPICard icon={Pill} label="Doses programadas hoje" value={items.length} accent={COLORS.slate} />
          <KPICard icon={Clock} label="Pendentes / atrasadas" value={pendentesOuAtrasados} accent={COLORS.orange} />
          <KPICard icon={AlertCircle} label="Atrasadas" value={items.filter(m => m.status === "atrasado").length} accent={COLORS.red} />
        </div>
      </div>

      <div className="flex justify-end px-8 mt-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={styles.addButton}
        >
          <Plus size={16} />
          Novo Medicamento
        </button>
      </div>

      <div className="flex-1 mx-8 my-5 bg-white rounded-2xl border overflow-hidden flex flex-col" style={styles.tableCard}>
        <div className="grid grid-cols-12 px-5 h-11 items-center border-b shrink-0" style={styles.tableHeader}>
          {["Horário", "Leito", "Paciente", "Medicamento", "Via", "Status", ""].map((h, i) => (
            <span
              key={i}
              className={`text-[11px] font-semibold uppercase tracking-wide ${
                ["col-span-1", "col-span-1", "col-span-2", "col-span-3", "col-span-2", "col-span-2", "col-span-1"][i]
              }`}
              style={styles.tableHeaderLabel}
            >
              {h}
            </span>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.sort((a, b) => a.horario.localeCompare(b.horario)).map(m => {
            const cfg = statusIcons[m.status];
            const StatusIcon = statusIconMap[m.status];
            return (
              <div key={m.id} className="grid grid-cols-12 px-5 h-16 items-center border-b" style={styles.row}>
                <span className="col-span-1 mono text-[13px] font-semibold" style={styles.horario}>
                  {m.horario}
                </span>
                <span className="col-span-1 font-bold text-[13px]" style={styles.leito}>
                  {m.leito}
                </span>
                <span className="col-span-2 text-[12.5px]" style={styles.paciente}>
                  {m.paciente}
                </span>
                <span className="col-span-3 text-[13px] font-medium flex items-center gap-2" style={styles.nome}>
                  <Syringe size={14} color={styles.nomeIconColor} />
                  {m.nome}
                  {m.recorrente && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={styles.via}>
                      diário
                    </span>
                  )}
                </span>
                <span className="col-span-2 text-[12px] px-2 py-1 rounded-lg w-fit" style={styles.via}>
                  {m.via}
                </span>
                <div className="col-span-2 flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit" style={getStatusBadgeStyle(cfg.bg)}>
                  <StatusIcon size={13} color={cfg.fg} />
                  <span className="text-[11.5px] font-semibold" style={getStatusLabelStyle(cfg.fg)}>
                    {cfg.label}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => toggleAdministrado(m.id as unknown as string, m.status)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                    style={getToggleButtonStyle(m.status === "administrado")}
                  >
                    {m.status === "administrado" ? "Desfazer" : "Confirmar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <NovoMedicamentoModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMedicamento}
        />
      )}
    </div>
  );
};