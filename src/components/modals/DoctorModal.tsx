import React, { useState } from "react";
import { X } from "lucide-react";
import { Doctor } from "../../types";
import { DoctorModalProps } from "../../modules/dashboard/dashboard.types";
import { doctorModalStyles as styles, getPlantaoToggleStyle } from "./styles/DoctorModal.styles";

export const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, allBeds, onClose, onSave, onSelectPatient }) => {
  const [plantao, setPlantao] = useState(doctor.plantao);
  const [turno, setTurno] = useState(doctor.turno);
  const [horarioInicio, setHorarioInicio] = useState(doctor.horarioInicio);
  const [horarioFim, setHorarioFim] = useState(doctor.horarioFim);
  const [pacientesSelecionados, setPacientesSelecionados] = useState<string[]>(doctor.pacientes);

  const internados = allBeds.filter(b => b.status === "internado");

  const togglePaciente = (bedId: string) => {
    setPacientesSelecionados(prev =>
      prev.includes(bedId) ? prev.filter(id => id !== bedId) : [...prev, bedId]
    );
  };

  const handleSave = () => {
    onSave({
      ...doctor,
      plantao,
      turno,
      horarioInicio,
      horarioFim,
      pacientes: pacientesSelecionados,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border p-6 max-h-[85vh] overflow-y-auto"
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-bold text-lg" style={styles.title}>
              {doctor.nome}
            </p>
            <p className="text-sm" style={styles.subtitle}>
              {doctor.especialidade} • CRM {doctor.crm}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Plantão */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={styles.label}>
            Status
          </p>
          <button
            type="button"
            onClick={() => setPlantao(prev => !prev)}
            className="px-3 py-2 rounded-lg text-sm font-semibold"
            style={getPlantaoToggleStyle(plantao)}
          >
            {plantao ? "De plantão" : "Fora de plantão"}
          </button>
        </div>

        {/* Turno */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={styles.label}>
            Turno
          </p>
          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value as Doctor["turno"])}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={styles.input}
          >
            <option value="manhã">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
        </div>

        {/* Horário */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={styles.label}>
            Horário
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={horarioInicio}
              onChange={(e) => setHorarioInicio(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border text-sm"
              style={styles.input}
            />
            <span style={styles.label}>até</span>
            <input
              type="time"
              value={horarioFim}
              onChange={(e) => setHorarioFim(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border text-sm"
              style={styles.input}
            />
          </div>
        </div>

        {/* Pacientes */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={styles.label}>
            Pacientes sob os cuidados ({pacientesSelecionados.length})
          </p>
          <div className="space-y-1">
            {internados.map(bed => {
              const isChecked = pacientesSelecionados.includes(bed.id);
              return (
                <div
                  key={bed.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={styles.patientRow}
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePaciente(bed.id)}
                    />
                    <span className="text-sm" style={styles.patientName}>
                      {bed.name} — Leito {bed.id}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onSelectPatient(bed)}
                    className="text-xs underline"
                    style={styles.label}
                  >
                    Ver ficha
                  </button>
                </div>
              );
            })}
            {internados.length === 0 && (
              <p className="text-xs italic" style={styles.label}>
                Nenhum paciente internado no momento
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
            style={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={styles.saveButton}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};