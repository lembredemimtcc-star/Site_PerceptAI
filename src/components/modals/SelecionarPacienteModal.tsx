import { useMemo, useState } from "react";
import { Search, X, User, ChevronRight } from "lucide-react";
import { Paciente } from "../../modules/prontuario/Prontuario.types";
import {
  selecionarPacienteStyles as styles,
  getPatientRowStyle,
} from "./styles/SelecionarPacienteModal.styles";

interface SelecionarPacienteModalProps {
  onSelect: (paciente: Paciente) => void;
  onClose?: () => void;
}

const pacientes: Paciente[] = [
  { id: "1", nome: "Maria Silva", idade: 28, leito: "12A", sexo: "F", condicao: "Pós-operatório" },
  { id: "2", nome: "João Pereira", idade: 64, leito: "07B", sexo: "M", condicao: "Insuficiência respiratória" },
  { id: "3", nome: "Ana Costa", idade: 45, leito: "03A", sexo: "F", condicao: "Sepse" },
  { id: "4", nome: "Carlos Mendes", idade: 71, leito: "09C", sexo: "M", condicao: "AVC isquêmico" },
  { id: "5", nome: "Beatriz Santos", idade: 33, leito: "05A", sexo: "F", condicao: "Observação clínica" },
  { id: "6", nome: "Roberto Lima", idade: 58, leito: "11B", sexo: "M", condicao: "Politrauma" },
];

export function SelecionarPacienteModal({
  onSelect,
  onClose,
}: SelecionarPacienteModalProps) {
  const [busca, setBusca] = useState("");

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.leito.toLowerCase().includes(termo)
    );
  }, [busca]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={styles.overlay}>
      <div
        className="w-full max-w-md bg-white border flex flex-col max-h-[80vh]"
        style={styles.modalCard}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={styles.header}>
          <div>
            <h2 className="display text-[1.25rem] font-semibold" style={styles.title}>
              Selecionar paciente
            </h2>
            <p className="text-[12px]" style={styles.subtitle}>
              Escolha o paciente para abrir o prontuário
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5" style={styles.closeButton}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="px-5 py-3 shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              color={styles.searchIconColor as string}
            />
            <input
              autoFocus
              className="w-full border pl-9 pr-3 py-2.5 text-[13px] outline-none"
              style={styles.searchInput}
              placeholder="Buscar por nome ou leito..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {pacientesFiltrados.length === 0 ? (
            <p className="text-center text-[13px] py-8" style={styles.emptyText}>
              Nenhum paciente encontrado.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {pacientesFiltrados.map((paciente) => (
                <button
                  key={paciente.id}
                  onClick={() => onSelect(paciente)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 border"
                  style={getPatientRowStyle()}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center shrink-0"
                    style={styles.avatar}
                  >
                    <User size={16} color={styles.avatarIconColor as string} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={styles.patientName}>
                      {paciente.nome}
                    </p>
                    <p className="text-[11.5px] truncate" style={styles.patientMeta}>
                      Leito {paciente.leito} · {paciente.idade} anos
                      {paciente.condicao ? ` · ${paciente.condicao}` : ""}
                    </p>
                  </div>
                  <ChevronRight size={16} color={styles.chevronColor as string} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}