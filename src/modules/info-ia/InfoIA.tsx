import React /* , { useState } */ from "react";
import { /* Send, */ Activity, Thermometer, ClipboardList } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TopBar } from "../../shared/components";
import { Bed } from "../../types";
import {
  vitalsData,
  painData,
  tremorEvents,
  // copilotMsgs,
  // suggestedQs,
  moodMeta,
  clinicalData,
} from "../../config/mockData";
import { infoIAStyles as styles } from "./InfoIA.styles";

interface InfoIAProps {
  bed: Bed;
  onBack: () => void;
}

export const InfoIA: React.FC<InfoIAProps> = ({ bed, onBack }) => {
  // const [question, setQuestion] = useState("");
  // const [messages, setMessages] = useState<string[]>(copilotMsgs);

  const mood = moodMeta[bed.mood];
  const clinical = clinicalData[bed.id];
  const MoodIcon = mood.icon;

  // const handleSendQuestion = (q?: string) => {
  //   const query = q || question;
  //   if (query.trim()) {
  //     setMessages([...messages, query]);
  //     setQuestion("");
  //   }
  // };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title={`${bed.name} (Leito ${bed.id})`} subtitle="Análise IA e histórico clínico" onBack={onBack} />

      <div className="flex-1 grid grid-cols-1 gap-6 p-6 overflow-hidden">
        {/* Esquerda: Gráficos e dados */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Info do paciente */}
          <div className="bg-white rounded-xl border p-4" style={styles.card}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs" style={styles.patientInfoLabel}>
                  Idade: {clinical.idade} | Internação: {clinical.internacao}
                </p>
                <p className="font-semibold text-sm" style={styles.patientInfoTitle}>
                  {clinical.diagnostico}
                </p>
                <p className="text-xs mt-1" style={styles.patientInfoLabel}>
                  Médico: {clinical.medico}
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg" style={styles.moodBox}>
                <MoodIcon size={16} color={mood.color} />
                <span className="text-xs font-semibold" style={styles.moodText}>
                  {mood.label} ({bed.conf}%)
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de vitais */}
          <div className="bg-white rounded-xl border p-4" style={styles.card}>
            <p className="text-xs font-bold mb-2" style={styles.chartTitle}>
              Sinais Vitais (24h)
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={styles.chartGrid} />
                <XAxis dataKey="t" stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <YAxis stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={styles.chartTooltip} />
                <Line type="monotone" dataKey="hr" stroke={styles.chartLineHr} name="FC" strokeWidth={2} />
                <Line type="monotone" dataKey="spo2" stroke={styles.chartLineSpo2} name="SpO2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de dor */}
          <div className="bg-white rounded-xl border p-4" style={styles.card}>
            <p className="text-xs font-bold mb-2" style={styles.chartTitle}>
              Intensidade de Dor (24h)
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={painData}>
                <CartesianGrid strokeDasharray="3 3" stroke={styles.chartGrid} />
                <XAxis dataKey="t" stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <YAxis stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={styles.chartTooltip} />
                <Bar dataKey="intensidade" fill={styles.chartBarPain} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Eventos de tremor */}
          <div className="bg-white rounded-xl border p-4" style={styles.card}>
            <p className="text-xs font-bold mb-2" style={styles.chartTitle}>
              Eventos Neurológicos
            </p>
            <div className="space-y-2">
              {tremorEvents.map((evt, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={styles.eventRow}>
                  <Activity size={14} color={styles.eventIconColor} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={styles.eventTitle}>
                      {evt.tipo}
                    </p>
                    <p className="text-[11px]" style={styles.eventTime}>
                      {evt.t}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Direita: Copilot IA */}
        {/*
        <div className="flex flex-col rounded-xl border overflow-hidden" style={styles.copilotPanel}>
          <div className="p-4 border-b" style={styles.copilotHeader}>
            <p className="text-sm font-bold" style={styles.copilotTitle}>
              PerceptAI Copilot
            </p>
            <p className="text-xs mt-1" style={styles.copilotSubtitle}>
              Análise inteligente em tempo real
            </p>
          </div>

          {/* Mensagens *\/}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="p-3 rounded-lg text-xs leading-relaxed" style={styles.message}>
                {msg}
              </div>
            ))}
          </div>

          {/* Sugestões *\/}
          <div className="p-4 border-t space-y-2" style={styles.suggestionsFooter}>
            <p className="text-[11px] font-semibold" style={styles.suggestionsLabel}>
              Sugestões:
            </p>
            {suggestedQs.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendQuestion(q)}
                className="w-full text-left text-[11px] p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={styles.suggestionButton}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input *\/}
          <div className="p-4 border-t" style={styles.inputFooter}>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendQuestion()}
                placeholder="Faça uma pergunta..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border"
                style={styles.input}
              />
              <button onClick={() => handleSendQuestion()} className="p-2 rounded-lg text-white" style={styles.sendButton}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};