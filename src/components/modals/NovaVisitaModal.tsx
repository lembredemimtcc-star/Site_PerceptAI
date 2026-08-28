import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Visita } from "../../modules/visitas/visitas.types";
import { Bed } from "../../types";
import { novaVisitaModalStyles as styles } from "./styles/NovaVisitaModal.styles";

interface NovaVisitaModalProps {
  beds: Bed[];
  onClose: () => void;
  onSubmit: (visita: Visita) => void;
}

export const NovaVisitaModal: React.FC<NovaVisitaModalProps> = ({ beds, onClose, onSubmit }) => {
  const [leito, setLeito] = useState("");
  const [visitante, setVisitante] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const internados = beds.filter((b) => b.status === "internado");
  const pacienteSelecionado = internados.find((b) => (b.internacaoId || b.id) === leito);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!leito || !visitante || !parentesco || !entrada || !saida) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    const internacaoIdVal = pacienteSelecionado?.internacaoId;
    const pacienteIdVal = pacienteSelecionado?.pacienteId;
    onSubmit({
      ...(internacaoIdVal !== undefined ? { internacaoId: internacaoIdVal } : {}),
      ...(pacienteIdVal !== undefined ? { pacienteId: pacienteIdVal } : {}),
      leito: pacienteSelecionado?.id ?? leito,
      paciente: pacienteSelecionado?.name ?? "",
      visitante,
      parentesco,
      entrada,
      saida,
      status: "agendada",
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={styles.overlay} onClick={onClose}>
      <div className="w-full max-w-md border p-6" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="display text-[1.25rem] font-semibold" style={styles.modalTitle}>
              Agendar Visita
            </p>
            <p className="text-[12px] mt-0.5" style={styles.modalSubtitle}>
              Preencha os dados do visitante
            </p>
          </div>
          <button onClick={onClose}>
            <X size={18} color={styles.modalCloseColor} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
              Paciente / Leito
            </label>
            <select
              value={leito}
              onChange={(e) => setLeito(e.target.value)}
              className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
              style={styles.fieldInput}
            >
              <option value="">Selecione o paciente</option>
              {internados.map((bed) => (
                <option key={bed.internacaoId || bed.id} value={bed.internacaoId || bed.id}>
                  {bed.name} — Leito {bed.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
              Nome do visitante
            </label>
            <input
              type="text"
              value={visitante}
              onChange={(e) => setVisitante(e.target.value)}
              placeholder="Nome completo"
              className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
              style={styles.fieldInput}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
              Parentesco
            </label>
            <input
              type="text"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              placeholder="Ex.: Filho, Esposa"
              className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
              style={styles.fieldInput}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Entrada
              </label>
              <input
                type="time"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
                style={styles.fieldInput}
              />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Saída
              </label>
              <input
                type="time"
                value={saida}
                onChange={(e) => setSaida(e.target.value)}
                className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
                style={styles.fieldInput}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-11 border text-sm font-semibold" style={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-11 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed" style={styles.confirmButton}>
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
};