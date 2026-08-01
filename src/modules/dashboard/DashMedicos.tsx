import React from "react";
import { TopBar } from "../../shared/components";
import { Bed } from "../../types";
import { beds, clinicalData } from "../../config/mockData";
import { dashMedicosStyles as styles, getRiskBadgeStyle } from "./DashMedicos.styles";

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
                style={styles.card}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-semibold" style={styles.bedLabel}>
                      Leito {bed.id}
                    </p>
                    <p className="font-semibold" style={styles.bedName}>
                      {bed.name}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={getRiskBadgeStyle(bed.risk)}
                  >
                    {bed.risk === "critical" ? "Crítico" : "Atenção"}
                  </span>
                </div>

                <div className="space-y-1 text-xs mb-3" style={styles.clinicalInfo}>
                  <p><strong>Idade:</strong> {clinical.idade} anos</p>
                  <p><strong>Diagnóstico:</strong> {clinical.diagnostico}</p>
                  <p><strong>Médico:</strong> {clinical.medico}</p>
                  <p><strong>Internação:</strong> {clinical.internacao}</p>
                  <p><strong>SpO2:</strong> {clinical.spo2}%</p>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded-lg" style={styles.statBox}>
                    <p className="text-xs" style={styles.statLabel}>FC</p>
                    <p className="font-bold" style={styles.statValue}>{bed.hr} bpm</p>
                  </div>
                  <div className="flex-1 p-2 rounded-lg" style={styles.statBox}>
                    <p className="text-xs" style={styles.statLabel}>IA Conf</p>
                    <p className="font-bold" style={styles.statValue}>{bed.conf}%</p>
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