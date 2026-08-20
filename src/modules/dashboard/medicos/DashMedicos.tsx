import React, { useState } from "react";
import { TopBar } from "../../../shared/components";
import { Bed, Doctor } from "../../../types";
import { beds, doctors } from "../../../config/mockData";
import { DoctorCard } from "../../../components/DoctorCard";
import { DoctorModal } from "../../../components/modals/DoctorModal";
import { SearchInput } from "../../../components/SearchInput";

interface DashMedicosProps {
  onOpenBed: (bed: Bed) => void;
}

export const DashMedicos: React.FC<DashMedicosProps> = ({ onOpenBed }) => {
  const [doctorsState, setDoctorsState] = useState<Doctor[]>(doctors);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSaveDoctor = (updatedDoctor: Doctor) => {
    setDoctorsState(prev => prev.map(d => (d.id === updatedDoctor.id ? updatedDoctor : d)));
  };

  const emPlantao = doctorsState.filter(d => d.plantao).length;

  const filteredDoctors = doctorsState.filter(doctor =>
    doctor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard Médicos" subtitle={`${emPlantao} de ${doctorsState.length} médicos de plantão`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar médico ou especialidade..."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDoctors.map(doctor => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              beds={beds}
              onOpenModal={setSelectedDoctor}
            />
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <DoctorModal
          key={selectedDoctor.id}
          doctor={selectedDoctor}
          allBeds={beds}
          onClose={() => setSelectedDoctor(null)}
          onSave={handleSaveDoctor}
          onSelectPatient={(bed) => {
            setSelectedDoctor(null);
            onOpenBed(bed);
          }}
        />
      )}
    </div>
  );
};