import { COLORS } from "../../config/colors";

export const doctorCardStyles = {
  card: {
    border: `1px solid ${COLORS.line}`,
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
  background: plantao ? COLORS.orangeSoft : COLORS.line,
  color: plantao ? COLORS.orange : COLORS.slateSoft,
});