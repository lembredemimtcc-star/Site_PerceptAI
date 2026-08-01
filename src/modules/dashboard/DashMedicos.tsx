import React, { useState } from "react";
import { TopBar } from "../../shared/components";
import { Bed, Doctor } from "../../types";
import { beds, doctors } from "../../config/mockData";
import { DoctorCard } from "./components/DoctorCard";
import { DoctorModal } from "./components/DoctorModal";

interface DashMedicosProps {
  onOpenBed: (bed: Bed) => void;
}

export const DashMedicos: React.FC<DashMedicosProps> = ({ onOpenBed }) => {
  const [doctorsState, setDoctorsState] = useState<Doctor[]>(doctors);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleSaveDoctor = (updatedDoctor: Doctor) => {
    setDoctorsState(prev => prev.map(d => (d.id === updatedDoctor.id ? updatedDoctor : d)));
  };

  const emPlantao = doctorsState.filter(d => d.plantao).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard Médicos" subtitle={`${emPlantao} de ${doctorsState.length} médicos de plantão`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {doctorsState.map(doctor => (
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