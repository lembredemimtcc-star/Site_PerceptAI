import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../../shared/components";
import { EstoqueItem } from "./estoque.types";
import { EstoqueItemModal } from "../../components/modals/EstoqueItemModal";
import { AlertBanner } from "../../components/AlertBanner";
import { SearchInput } from "../../components/SearchInput";
import { estoqueStyles as styles, getStockBadgeStyle } from "./Estoque.styles";

import { useEstoque, useMedicamentos } from "../../hooks";
import { supabase } from "../../lib/supabase";

export const Estoque: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"novo" | "editar">("novo");
  const [editingItem, setEditingItem] = useState<EstoqueItem | null>(null);

  const { data: supabaseItems, refetch, isError, error, isLoading } = useEstoque();
  const { data: medicamentos = [] } = useMedicamentos();

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
          <p className="text-gray-500">Carregando estoque...</p>
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
      if (modalMode === "novo") {
        // Buscar ou criar medicamento pelo nome
        let med = medicamentos.find(m => m.nome.toLowerCase() === item.nome.toLowerCase());
        if (!med) {
          // Criar novo medicamento
          const { data: newMed, error: medError } = await supabase
            .from("medicamentos")
            .insert({
              nome: item.nome,
              categoria: item.categoria,
              unidade_medida: item.unidade,
              principio_ativo: item.nome,
              forma_farmaceutica: "outro",
              concentracao: "",
            })
            .select()
            .single();
          if (medError) throw medError;
          med = newMed;
        }

        // Inserir estoque com medicamento_id
        const { error } = await supabase.from("estoque").insert({
          medicamento_id: med.id,
          quantidade_atual: item.quantidade,
          quantidade_minima: item.minimo,
        });
        if (error) throw error;
      } else {
        // Apenas atualizar quantidade (estoque table só tem essas colunas editáveis)
        const { error } = await supabase
          .from("estoque")
          .update({
            quantidade_atual: item.quantidade,
            quantidade_minima: item.minimo,
          })
          .eq("id", item.id);
        if (error) throw error;
      }

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

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
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
        onClose={handleCloseModal}
        onSave={handleSaveItem}
      />
    </div>
  );
};