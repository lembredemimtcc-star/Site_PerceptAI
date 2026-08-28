import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "../../../shared/components";
import { Bed, Doctor } from "../../../types";
import { useBeds, useUsuarios } from "../../../hooks";
import { salvarMedico, usuarioToDoctor } from "../../../lib/mutations";
import { DoctorCard } from "../../../components/DoctorCard";
import { DoctorModal } from "../../../components/modals/DoctorModal";
import { SearchInput } from "../../../components/SearchInput";

interface DashMedicosProps {
  onOpenBed: (bed: Bed) => void;
}

export const DashMedicos: React.FC<DashMedicosProps> = ({ onOpenBed }) => {
  const { data: beds = [], refetch: refetchBeds } = useBeds();
  const { data: usuarios = [], refetch: refetchUsuarios } = useUsuarios();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const doctors = useMemo(() => {
    return (usuarios ?? []).map((row: any) => {
      const internacaoIds = beds
        .filter((b) => b.medicoId && String(b.medicoId) === String(row.id) && b.status === "internado")
        .map((b) => b.internacaoId || b.id);
      return usuarioToDoctor(row, internacaoIds);
    });
  }, [usuarios, beds]);

  const handleSaveDoctor = async (updatedDoctor: Doctor) => {
    try {
      await salvarMedico(updatedDoctor, updatedDoctor.pacientes);
      toast.success("Médico atualizado");
      refetchUsuarios();
      refetchBeds();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar médico");
    }
  };

  const emPlantao = doctors.filter((d) => d.plantao).length;

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard Médicos" subtitle={`${emPlantao} de ${doctors.length} profissionais`} />

      <div className="flex-1 overflow-y-auto px-8 py-7 space-y-5">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar médico ou especialidade..."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDoctors.map((doctor) => (
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
          onSelectPatient={onOpenBed}
        />
      )}
    </div>
  );
};
