import { Bed, RecentPatient, RiskLevel, Doctor } from "../../types";

export interface DashboardState {
  selectedBed: Bed | null;
  filter: RiskLevel | "all";
}

export interface BedCardProps {
  bed: Bed;
  onSelect: (bed: Bed) => void;
  onChangeRisk: (bedId: string, risk: RiskLevel) => void;
  onToggleStatus: (bedId: string) => void;
}

export interface RiskAlertProps {
  patient: RecentPatient;
}

export interface DoctorCardProps {
  doctor: Doctor;
  beds: Bed[];
  onOpenModal: (doctor: Doctor) => void;
}

export interface DoctorModalProps {
  doctor: Doctor;
  allBeds: Bed[];
  onClose: () => void;
  onSave: (updatedDoctor: Doctor) => void;
  onSelectPatient: (bed: Bed) => void;
}