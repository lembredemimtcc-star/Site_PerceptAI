import React from "react";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { Bed } from "../../types";
import { beds, clinicalData } from "../../config/mockData";

interface DashMedicosProps {
  onOpenBed: (bed: Bed) => void;
}

export const DashMedicos: React.FC<DashMedicosProps> = ({ onOpenBed }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard Médicos" subtitle="Visão clínica dos pacientes internados" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {beds.map(bed => {
            const clinical = clinicalData[bed.id];
            return (
              <button
                key={bed.id}
                onClick={() => onOpenBed(bed)}
                className="text-left p-4 rounded-xl border hover:shadow-md transition-all"
                style={{ borderColor: COLORS.line, background: COLORS.card }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: COLORS.slateSoft }}>
                      Leito {bed.id}
                    </p>
                    <p className="font-semibold" style={{ color: COLORS.ink }}>
                      {bed.name}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{
                      background: bed.risk === "critical" ? COLORS.redSoft : COLORS.orangeSoft,
                      color: bed.risk === "critical" ? COLORS.red : COLORS.orange,
                    }}
                  >
                    {bed.risk === "critical" ? "Crítico" : "Atenção"}
                  </span>
                </div>

                <div className="space-y-1 text-xs mb-3" style={{ color: COLORS.slate }}>
                  <p><strong>Idade:</strong> {clinical.idade} anos</p>
                  <p><strong>Diagnóstico:</strong> {clinical.diagnostico}</p>
                  <p><strong>Médico:</strong> {clinical.medico}</p>
                  <p><strong>Internação:</strong> {clinical.internacao}</p>
                  <p><strong>SpO2:</strong> {clinical.spo2}%</p>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded-lg" style={{ background: COLORS.bg }}>
                    <p className="text-xs" style={{ color: COLORS.slateSoft }}>FC</p>
                    <p className="font-bold" style={{ color: COLORS.ink }}>{bed.hr} bpm</p>
                  </div>
                  <div className="flex-1 p-2 rounded-lg" style={{ background: COLORS.bg }}>
                    <p className="text-xs" style={{ color: COLORS.slateSoft }}>IA Conf</p>
                    <p className="font-bold" style={{ color: COLORS.ink }}>{bed.conf}%</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
