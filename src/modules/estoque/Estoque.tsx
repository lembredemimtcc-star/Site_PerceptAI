import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../../shared/components";
import { EstoqueItem } from "./estoque.types";
import { EstoqueItemModal } from "../../components/modals/EstoqueItemModal";
import { LowStockAlert } from "../../components/Alert";
import { estoqueStyles as styles, getStockBadgeStyle } from "./Estoque.styles";

const mockEstoque: EstoqueItem[] = [
  { id: "1", nome: "Luvas látex P", categoria: "EPI", quantidade: 450, minimo: 200, unidade: "caixa" },
  { id: "2", nome: "Máscara N95", categoria: "EPI", quantidade: 80, minimo: 150, unidade: "un" },
  { id: "3", nome: "Gaze estéril", categoria: "Curativo", quantidade: 320, minimo: 100, unidade: "caixa" },
  { id: "4", nome: "Soro fisiológico", categoria: "Medicamento", quantidade: 150, minimo: 100, unidade: "L" },
  { id: "5", nome: "Cateter IV 20G", categoria: "Equipamento", quantidade: 45, minimo: 50, unidade: "un" },
];

export const Estoque: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<EstoqueItem[]>(mockEstoque);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"novo" | "editar">("novo");
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);

  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantidade < item.minimo);

  const categories = Array.from(new Set(items.map(i => i.categoria)));

  const handleOpenNovo = () => {
    setModalMode("novo");
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditar = (item: EstoqueItem) => {
    setModalMode("editar");
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaveItem = (item: EstoqueItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
    toast.success(modalMode === "novo" ? "Item adicionado ao estoque" : "Item atualizado");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Estoque" subtitle="Controle de medicamentos e insumos" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <LowStockAlert count={lowStockItems.length} />

        {/* Busca */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={styles.searchIconColor} />
          <input
            type="text"
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm"
            style={styles.searchInput}
          />
        </div>

        {/* Itens por categoria */}
        {categories.map(category => {
          const categoryItems = filteredItems.filter(i => i.categoria === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <p className="text-sm font-bold mb-2" style={styles.categoryTitle}>
                {category}
              </p>
              <div className="space-y-2">
                {categoryItems.map(item => {
                  const isLow = item.quantidade < item.minimo;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleOpenEditar(item)}
                      className="w-full p-4 rounded-xl border flex items-center justify-between text-left"
                      style={styles.itemCard}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={styles.itemName}>
                          {item.nome}
                        </p>
                        <p className="text-xs mt-1" style={styles.itemInfo}>
                          {item.quantidade} {item.unidade} • Mín: {item.minimo}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-bold px-3 py-1 rounded-lg inline-block"
                          style={getStockBadgeStyle(isLow)}
                        >
                          {isLow ? "Baixo" : "OK"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleOpenNovo}
          className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm"
          style={styles.addButton}
        >
          <Plus size={16} /> Adicionar item
        </button>
      </div>

      <EstoqueItemModal
        open={modalOpen}
        mode={modalMode}
        item={editingItem}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
      />
    </div>
  );
};