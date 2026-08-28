import React from "react";
import { ChevronRight } from "lucide-react";
import { DoctorCardProps } from "../modules/dashboard/dashboard.types";
import { doctorCardStyles as styles, getPlantaoToggleStyle } from "./styles/DoctorCard.styles";
import { COLORS } from "../config/colors";

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, beds, onOpenModal }) => {
  const pacientesDoMedico = beds.filter(
    (b) =>
      b.status === "internado" &&
      (doctor.pacientes.includes(b.internacaoId || "") || doctor.pacientes.includes(b.id))
  );

  return (
    <button
      onClick={() => onOpenModal(doctor)}
      className="text-left p-5 w-full"
      style={{
        ...styles.card,
        borderLeft: `5px solid ${doctor.plantao ? COLORS.orange : COLORS.line}`,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="display font-semibold text-[1.15rem] leading-tight" style={styles.doctorName}>
            {doctor.nome}
          </p>
          <p className="text-xs" style={styles.specialty}>
            {doctor.especialidade}
          </p>
          <p className="text-xs" style={styles.crm}>
            CRM {doctor.crm}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className="text-[10px] font-semibold px-2 py-0.5"
            style={getPlantaoToggleStyle(doctor.plantao)}
          >
            {doctor.plantao ? "De plantão" : "Fora de plantão"}
          </span>
          <span className="text-xs px-2 py-0.5" style={styles.turnoBadge}>
            {doctor.horarioInicio} - {doctor.horarioFim}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={styles.patientsTitle}>
          {pacientesDoMedico.length} paciente{pacientesDoMedico.length !== 1 ? "s" : ""} sob cuidado
        </p>
        <ChevronRight size={16} />
      </div>
    </button>
  );
};