import React, { useState } from "react";
import { X, CalendarPlus } from "lucide-react";
import { eventTypeMeta } from "../../modules/calendario/calendarioData";
import { TipoEventoKey } from "../../modules/calendario/calendario.types";
import {
  novoEventoModalStyles as styles,
  getTypeChipStyle,
} from "./styles/NovoEventoModal.styles";

export interface NovoEventoFormData {
  tipo: TipoEventoKey;
  titulo: string;
  data: string; // ISO "2026-07-27"
  hora: string;
  observacoes: string;
}

interface NovoEventoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (evento: NovoEventoFormData) => void;
}

const tipoKeys = Object.keys(eventTypeMeta) as TipoEventoKey[];

export const NovoEventoModal: React.FC<NovoEventoModalProps> = ({ open, onClose, onSave }) => {
  const [tipo, setTipo] = useState<TipoEventoKey>(tipoKeys[0]!);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!titulo.trim() || !hora.trim()) return;

    setIsSubmitting(true);
    onSave({ tipo, titulo, data, hora, observacoes });

    setTipo(tipoKeys[0]!);
    setTitulo("");
    setData(new Date().toISOString().slice(0, 10));
    setHora("");
    setObservacoes("");
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={styles.overlay}>
      <div className="w-[440px] max-w-[92vw] rounded-2xl bg-white overflow-hidden" style={styles.card}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={styles.header}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={styles.headerIconWrap}>
              <CalendarPlus size={16} color={styles.headerIconColor} />
            </div>
            <p className="text-[15px] font-bold" style={styles.title}>
              Novo Evento
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center">
            <X size={16} color={styles.closeIconColor} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-semibold" style={styles.label}>
              Tipo de evento
            </label>
            <div className="flex flex-wrap gap-2">
              {tipoKeys.map((k) => {
                const meta = eventTypeMeta[k];
                const selected = tipo === k;
                return (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setTipo(k)}
                    className="px-3 h-8 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
                    style={getTypeChipStyle(meta.color, selected)}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-semibold" style={styles.label}>
              Título
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Consulta pós-operatória"
              className="h-10 rounded-lg px-3 text-[13px] border outline-none"
              style={styles.input}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[11.5px] font-semibold" style={styles.label}>
                Horário
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="h-10 rounded-lg px-3 text-[13px] border outline-none"
                style={styles.input}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-semibold" style={styles.label}>
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Detalhes adicionais sobre o evento..."
              className="rounded-lg px-3 py-2 text-[13px] border outline-none resize-none"
              style={styles.input}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-[13px] font-semibold" style={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="h-10 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed" style={styles.saveButton}>
              Salvar evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};