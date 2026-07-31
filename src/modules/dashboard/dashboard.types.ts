import { Bed, RecentPatient, RiskLevel } from "../../types";

export interface DashboardState {
  selectedBed: Bed | null;
  filter: RiskLevel | "all";
}

export interface BedCardProps {
  bed: Bed;
  onSelect: (bed: Bed) => void;
}

export interface RiskAlertProps {
  patient: RecentPatient;
}
