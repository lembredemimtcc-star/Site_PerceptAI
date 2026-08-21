import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Medicamento } from "../../modules/medicamentos/medicamentos.types";
import { beds } from "../../config/mockData";
import { novoMedicamentoModalStyles as styles } from "./styles/NovoMedicamentoModal.styles";

interface NovoMedicamentoModalProps {
  onClose: () => void;
  onSubmit: (medicamento: Omit<Medicamento, "id" | "status">) => void;
}

const VIA_OPTIONS = ["EV", "VO", "SC", "IM", "Inalatória", "Tópica"];

export const NovoMedicamentoModal: React.FC<NovoMedicamentoModalProps> = ({ onClose, onSubmit }) => {
  const [leito, setLeito] = useState("");
  const [nome, setNome] = useState("");
  const [via, setVia] = useState(VIA_OPTIONS[0]);
  const [horario, setHorario] = useState("");
  const [recorrente, setRecorrente] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const internados = beds.filter(b => b.status === "internado");
  const pacienteSelecionado = internados.find(b => b.id === leito);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!leito || !nome || !via || !horario) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      leito,
      paciente: pacienteSelecionado?.name ?? "",
      nome,
      via,
      horario,
      recorrente,
    });

    toast.success(
      recorrente
        ? "Medicamento adicionado à rotina diária!"
        : "Medicamento agendado!"
    );
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={styles.overlay} onClick={onClose}>
      <div className="w-full max-w-md border p-6" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="display text-[1.25rem] font-semibold" style={styles.modalTitle}>
              Novo Medicamento
            </p>
            <p className="text-[12px] mt-0.5" style={styles.modalSubtitle}>
              Cadastre um medicamento e horário de administração
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
              {internados.map(bed => (
                <option key={bed.id} value={bed.id}>
                  {bed.name} — Leito {bed.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
              Medicamento
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Dipirona 1g"
              className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
              style={styles.fieldInput}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Via
              </label>
              <select
                value={via}
                onChange={(e) => setVia(e.target.value)}
                className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
                style={styles.fieldInput}
              >
                {VIA_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12.5px] font-semibold" style={styles.fieldLabel}>
                Horário
              </label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full h-11 border px-3 text-sm outline-none mt-1.5"
                style={styles.fieldInput}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={recorrente}
              onChange={(e) => setRecorrente(e.target.checked)}
            />
            <span className="text-[13px]" style={styles.checkboxLabel}>
              Repetir todos os dias neste horário
            </span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-11 border text-sm font-semibold" style={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-11 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed" style={styles.confirmButton}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};