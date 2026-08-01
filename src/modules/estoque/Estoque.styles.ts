import { COLORS } from "../../config/colors";

export const estoqueStyles = {
  searchIconColor: COLORS.slateSoft,
  searchInput: {
    borderColor: COLORS.line,
    background: COLORS.card,
  },
  categoryTitle: {
    color: COLORS.ink,
  },
  itemCard: {
    borderColor: COLORS.line,
    background: COLORS.card,
  },
  itemName: {
    color: COLORS.ink,
  },
  itemInfo: {
    color: COLORS.slateSoft,
  },
  addButton: {
    background: COLORS.orange,
  },
};

// Estilo dinâmico (depende se o item está com estoque baixo)
export const getStockBadgeStyle = (isLow: boolean) => ({
  background: isLow ? COLORS.redSoft : COLORS.greenSoft,
  color: isLow ? COLORS.red : COLORS.green,
});