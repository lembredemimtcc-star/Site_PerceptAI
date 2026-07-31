import React, { useState } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { EstoqueItem } from "./estoque.types";

const mockEstoque: EstoqueItem[] = [
  { id: "1", nome: "Luvas látex P", categoria: "EPI", quantidade: 450, minimo: 200, unidade: "caixa" },
  { id: "2", nome: "Máscara N95", categoria: "EPI", quantidade: 80, minimo: 150, unidade: "un" },
  { id: "3", nome: "Gaze estéril", categoria: "Curativo", quantidade: 320, minimo: 100, unidade: "caixa" },
  { id: "4", nome: "Soro fisiológico", categoria: "Medicamento", quantidade: 150, minimo: 100, unidade: "L" },
  { id: "5", nome: "Cateter IV 20G", categoria: "Equipamento", quantidade: 45, minimo: 50, unidade: "un" },
];

export const Estoque: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items] = useState<EstoqueItem[]>(mockEstoque);

  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantidade < item.minimo);

  const categories = Array.from(new Set(items.map(i => i.categoria)));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Estoque" subtitle="Controle de medicamentos e insumos" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Alerta de estoque baixo */}
        {lowStockItems.length > 0 && (
          <div className="p-4 rounded-xl border-2 flex items-center gap-3" style={{ background: COLORS.redSoft, borderColor: COLORS.red }}>
            <AlertTriangle size={20} color={COLORS.red} className="shrink-0" />
            <div>
              <p className="font-semibold text-sm" style={{ color: COLORS.red }}>
                {lowStockItems.length} item{lowStockItems.length > 1 ? "ns" : ""} com estoque baixo
              </p>
              <p className="text-xs mt-1" style={{ color: COLORS.red }}>
                Reposição necessária
              </p>
            </div>
          </div>
        )}

        {/* Busca */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={COLORS.slateSoft} />
          <input
            type="text"
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm"
            style={{ borderColor: COLORS.line, background: COLORS.card }}
          />
        </div>

        {/* Itens por categoria */}
        {categories.map(category => {
          const categoryItems = filteredItems.filter(i => i.categoria === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <p className="text-sm font-bold mb-2" style={{ color: COLORS.ink }}>
                {category}
              </p>
              <div className="space-y-2">
                {categoryItems.map(item => {
                  const isLow = item.quantidade < item.minimo;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border flex items-center justify-between"
                      style={{ borderColor: COLORS.line, background: COLORS.card }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                          {item.nome}
                        </p>
                        <p className="text-xs mt-1" style={{ color: COLORS.slateSoft }}>
                          {item.quantidade} {item.unidade} • Mín: {item.minimo}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-bold px-3 py-1 rounded-lg inline-block"
                          style={{
                            background: isLow ? COLORS.redSoft : COLORS.greenSoft,
                            color: isLow ? COLORS.red : COLORS.green,
                          }}
                        >
                          {isLow ? "Baixo" : "OK"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm"
          style={{ background: COLORS.orange }}
        >
          <Plus size={16} /> Adicionar item
        </button>
      </div>
    </div>
  );
};
