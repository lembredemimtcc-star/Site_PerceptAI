import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../../shared/components";
import { EstoqueItem } from "./estoque.types";
import { EstoqueItemModal } from "../../components/modals/EstoqueItemModal";
import { AlertBanner } from "../../components/AlertBanner";
import { SearchInput } from "../../components/SearchInput";
import { COLORS } from "../../config/colors";
import { estoqueStyles as styles, getStockBadgeStyle } from "./Estoque.styles";

import { useEstoque } from "../../hooks";
import { garantirMedicamento, salvarEstoque } from "../../lib/mutations";

export const Estoque: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"novo" | "editar">("novo");
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);

  const { data: supabaseItems, refetch, isError, error, isLoading } = useEstoque();

  // Transform DB rows to local EstoqueItem
  const items: EstoqueItem[] = (supabaseItems || []).map((dbItem: any) => ({
    id: dbItem.id,
    nome: dbItem.nome,
    categoria: dbItem.categoria,
    quantidade: dbItem.quantidade,
    minimo: dbItem.minimo,
    unidade: dbItem.unidade,
  }));

  if (isError) {
    console.error("Estoque query error:", error);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Estoque" subtitle="Controle de medicamentos e insumos" />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: COLORS.slateSoft }}>Carregando estoque...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Estoque" subtitle="Controle de medicamentos e insumos" />
        <AlertBanner
          variant="warning"
          title="Erro ao carregar estoque"
          subtitle="Verifique a conexão ou tente novamente"
        />
      </div>
    );
  }

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

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = async (item: EstoqueItem) => {
    try {
      let medicamentoId: string | undefined;
      try {
        const med = await garantirMedicamento(item.nome, item.categoria, item.unidade);
        medicamentoId = med?.id ? String(med.id) : undefined;
      } catch {
        medicamentoId = undefined;
      }
      await salvarEstoque(modalMode, item, medicamentoId);
      toast.success(modalMode === "novo" ? "Item adicionado ao estoque" : "Item atualizado");
      setModalOpen(false);
      setEditingItem(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar item");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Estoque" subtitle="Controle de medicamentos e insumos" />

      <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
        {lowStockItems.length > 0 && (
          <AlertBanner
            variant="warning"
            title={`${lowStockItems.length} ${lowStockItems.length > 1 ? "itens" : "item"} com estoque baixo`}
            subtitle="Reposição necessária"
          />
        )}

        {/* Busca */}
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar item..."
        />

        {/* Itens por categoria */}
        {categories.map(category => {
          const categoryItems = filteredItems.filter(i => i.categoria === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <p className="text-[13px] font-semibold mb-3" style={styles.categoryTitle}>
                {category}
              </p>
              <div className="space-y-2">
                {categoryItems.map(item => {
                  const isLow = item.quantidade < item.minimo;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleOpenEditar(item)}
                      className="w-full p-4 border flex items-center justify-between text-left"
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
                          className="text-xs font-semibold px-2 py-0.5 inline-block"
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
          className="w-full py-2.5 text-white font-semibold flex items-center justify-center gap-2 text-sm"
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
        onClose={handleCloseModal}
        onSave={handleSaveItem}
      />
    </div>
  );
};