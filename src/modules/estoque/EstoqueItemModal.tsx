import React, { useEffect, useState } from "react";
import { X, Package, PackagePlus } from "lucide-react";
import { EstoqueItem } from "./estoque.types";
import {
  estoqueItemModalStyles as styles,
} from "./EstoqueItemModal.styles";

interface EstoqueItemModalProps {
  open: boolean;
  mode: "novo" | "editar";
  item?: EstoqueItem | null;
  categories: string[];
  onClose: () => void;
  onSave: (item: EstoqueItem) => void;
}

const emptyForm = {
  nome: "",
  categoria: "",
  quantidade: "",
  minimo: "",
  unidade: "",
};

export const EstoqueItemModal: React.FC<EstoqueItemModalProps> = ({
  open,
  mode,
  item,
  categories,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (mode === "editar" && item) {
      setForm({
        nome: item.nome,
        categoria: item.categoria,
        quantidade: String(item.quantidade),
        minimo: String(item.minimo),
        unidade: item.unidade,
      });
    } else {
      setForm(emptyForm);
    }
  }, [mode, item, open]);

  if (!open) return null;

  const handleNumericChange = (field: "quantidade" | "minimo") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
    setForm((f) => ({ ...f, [field]: onlyDigits }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.categoria.trim() || !form.unidade.trim()) return;

    const quantidade = Number(form.quantidade);
    const minimo = Number(form.minimo);
    if (Number.isNaN(quantidade) || Number.isNaN(minimo) || form.quantidade === "" || form.minimo === "") return;

    onSave({
      id: mode === "editar" && item ? item.id : crypto.randomUUID(),
      nome: form.nome.trim(),
      categoria: form.categoria.trim(),
      quantidade,
      minimo,
      unidade: form.unidade.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={styles.overlay}>
      <div
        className="w-[500px] max-w-[92vw] max-h-[85vh] rounded-2xl bg-white overflow-hidden flex flex-col"
        style={styles.card}
      >
        {/* Header (fixo) */}
        <div className="flex items-center justify-between px-6 py-5 border-b shrink-0" style={styles.header}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={styles.headerIconWrap}>
              {mode === "novo" ? (
                <PackagePlus size={16} color={styles.headerIconColor} />
              ) : (
                <Package size={16} color={styles.headerIconColor} />
              )}
            </div>
            <p className="text-[15px] font-bold" style={styles.title}>
              {mode === "novo" ? "Adicionar item" : "Editar item"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center">
            <X size={16} color={styles.closeIconColor} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Campos (rolável) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Nome do item
              </label>
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Máscara N95"
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Categoria
              </label>
              <input
                list="categorias-existentes"
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                placeholder="Ex: EPI, Curativo, Medicamento..."
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
              <datalist id="categorias-existentes">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Quantidade
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.quantidade}
                onChange={handleNumericChange("quantidade")}
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Mínimo
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.minimo}
                onChange={handleNumericChange("minimo")}
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Unidade
              </label>
              <input
                value={form.unidade}
                onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                placeholder="un, caixa, L..."
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
            </div>
          </div>

          {/* Ações (fixas) */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0" style={styles.header}>
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-[13px] font-semibold" style={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className="h-10 px-4 rounded-lg text-[13px] font-semibold" style={styles.saveButton}>
              {mode === "novo" ? "Adicionar" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};