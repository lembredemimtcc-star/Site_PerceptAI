import React, { useState } from "react";
import { Send, Activity, Thermometer, ClipboardList } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TopBar } from "../../shared/components";
import { COLORS } from "../../config/colors";
import { Bed } from "../../types";
import { vitalsData, painData, tremorEvents, copilotMsgs, suggestedQs, moodMeta, clinicalData } from "../../config/mockData";

interface InfoIAProps {
  bed: Bed;
  onBack: () => void;
}

export const InfoIA: React.FC<InfoIAProps> = ({ bed, onBack }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<string[]>(copilotMsgs);

  const mood = moodMeta[bed.mood];
  const clinical = clinicalData[bed.id];
  const MoodIcon = mood.icon;

  const handleSendQuestion = (q?: string) => {
    const query = q || question;
    if (query.trim()) {
      setMessages([...messages, query]);
      setQuestion("");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title={`${bed.name} (Leito ${bed.id})`} subtitle="Análise IA e histórico clínico" onBack={onBack} />

      <div className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-hidden">
        {/* Esquerda: Gráficos e dados */}
        <div className="col-span-2 flex flex-col gap-4 overflow-y-auto">
          {/* Info do paciente */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: COLORS.line }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs" style={{ color: COLORS.slateSoft }}>
                  Idade: {clinical.idade} | Internação: {clinical.internacao}
                </p>
                <p className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                  {clinical.diagnostico}
                </p>
                <p className="text-xs mt-1" style={{ color: COLORS.slateSoft }}>
                  Médico: {clinical.medico}
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: COLORS.orangeSoft }}>
                <MoodIcon size={16} color={mood.color} />
                <span className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                  {mood.label} ({bed.conf}%)
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de vitais */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: COLORS.line }}>
            <p className="text-xs font-bold mb-2" style={{ color: COLORS.ink }}>
              Sinais Vitais (24h)
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
                <XAxis dataKey="t" stroke={COLORS.slateSoft} style={{ fontSize: 12 }} />
                <YAxis stroke={COLORS.slateSoft} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }} />
                <Line type="monotone" dataKey="hr" stroke={COLORS.red} name="FC" strokeWidth={2} />
                <Line type="monotone" dataKey="spo2" stroke={COLORS.green} name="SpO2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de dor */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: COLORS.line }}>
            <p className="text-xs font-bold mb-2" style={{ color: COLORS.ink }}>
              Intensidade de Dor (24h)
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={painData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
                <XAxis dataKey="t" stroke={COLORS.slateSoft} style={{ fontSize: 12 }} />
                <YAxis stroke={COLORS.slateSoft} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }} />
                <Bar dataKey="intensidade" fill={COLORS.orange} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Eventos de tremor */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: COLORS.line }}>
            <p className="text-xs font-bold mb-2" style={{ color: COLORS.ink }}>
              Eventos Neurológicos
            </p>
            <div className="space-y-2">
              {tremorEvents.map((evt, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: COLORS.bg }}>
                  <Activity size={14} color={COLORS.orange} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                      {evt.tipo}
                    </p>
                    <p className="text-[11px]" style={{ color: COLORS.slateSoft }}>
                      {evt.t}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Direita: Copilot IA */}
        <div className="flex flex-col rounded-xl border overflow-hidden" style={{ borderColor: COLORS.line, background: COLORS.card }}>
          <div className="p-4 border-b" style={{ borderColor: COLORS.line }}>
            <p className="text-sm font-bold" style={{ color: COLORS.ink }}>
              PerceptAI Copilot
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.slateSoft }}>
              Análise inteligente em tempo real
            </p>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="p-3 rounded-lg text-xs leading-relaxed"
                style={{
                  background: COLORS.bg,
                  color: COLORS.slate,
                  borderLeft: `3px solid ${COLORS.orange}`,
                }}
              >
                {msg}
              </div>
            ))}
          </div>

          {/* Sugestões */}
          <div className="p-4 border-t space-y-2" style={{ borderColor: COLORS.line }}>
            <p className="text-[11px] font-semibold" style={{ color: COLORS.slateSoft }}>
              Sugestões:
            </p>
            {suggestedQs.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendQuestion(q)}
                className="w-full text-left text-[11px] p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ background: COLORS.bg, color: COLORS.slate }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendQuestion()}
                placeholder="Faça uma pergunta..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border"
                style={{ borderColor: COLORS.line, background: COLORS.bg }}
              />
              <button
                onClick={() => handleSendQuestion()}
                className="p-2 rounded-lg text-white"
                style={{ background: COLORS.orange }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
