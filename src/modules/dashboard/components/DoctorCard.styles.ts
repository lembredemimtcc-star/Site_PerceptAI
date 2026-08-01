import { COLORS } from "../../../config/colors";

export const doctorCardStyles = {
  card: {
    borderColor: COLORS.line,
    background: COLORS.card,
  },
  doctorName: {
    color: COLORS.ink,
  },
  specialty: {
    color: COLORS.slateSoft,
  },
  crm: {
    color: COLORS.slateSoft,
  },
  turnoBadge: {
    background: COLORS.bg,
    color: COLORS.slate,
  },
  patientsTitle: {
    color: COLORS.slateSoft,
  },
};

export const getPlantaoToggleStyle = (plantao: boolean) => ({
  background: plantao ? COLORS.greenSoft : COLORS.line,
  color: plantao ? COLORS.green : COLORS.slateSoft,
});