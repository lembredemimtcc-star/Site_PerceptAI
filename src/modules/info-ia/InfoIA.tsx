import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Activity,
  Camera,
  CameraOff,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TopBar } from "../../shared/components";
import { Bed, MoodType } from "../../types";
import { tremorEvents, moodMeta, clinicalData } from "../../config/mockData";
import { useSinaisVitais, useExpressoes } from "../../hooks";
import { infoIAStyles as styles } from "./InfoIA.styles";
import {
  detectEmotion,
  captureFrame,
  dataUrlToBase64,
} from "../../lib/detection";

interface InfoIAProps {
  bed: Bed;
  onBack: () => void;
}

type CameraState = "idle" | "starting" | "active" | "error";

export const InfoIA: React.FC<InfoIAProps> = ({ bed, onBack }) => {
  const { data: vitals = [] } = useSinaisVitais(bed.internacaoId);
  const { data: expressions = [] } = useExpressoes(bed.internacaoId);

  // ─── Câmera ───────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [detectedConf, setDetectedConf] = useState<number>(0);
  const [lastDetectionTs, setLastDetectionTs] = useState<string>("");

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("idle");
    setIsDetecting(false);
  }, []);

  const runDetection = useCallback(async () => {
    if (!videoRef.current || !bed.internacaoId || isDetecting) return;
    const video = videoRef.current;
    if (video.readyState < 2) return; // vídeo ainda não está pronto

    try {
      setIsDetecting(true);
      const dataUrl = await captureFrame(video);
      const base64 = dataUrlToBase64(dataUrl);
      const result = await detectEmotion(base64, bed.internacaoId);
      setDetectedEmotion(result.Emotion);
      setDetectedConf(Math.round(result.Confidence * 100));
      setLastDetectionTs(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch {
      // Erros de rede ou backend não param a câmera — só silenciam essa rodada
    } finally {
      setIsDetecting(false);
    }
  }, [bed.internacaoId, isDetecting]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");
      // Captura a cada 3 segundos
      intervalRef.current = setInterval(runDetection, 3000);
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Permissão de câmera negada. Permita o acesso nas configurações do navegador."
          : err?.name === "NotFoundError"
          ? "Nenhuma câmera encontrada neste dispositivo."
          : "Não foi possível acessar a câmera.";
      setCameraError(msg);
      setCameraState("error");
    }
  }, [runDetection]);

  // Limpa ao desmontar
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // ─── Dados do Supabase ────────────────────────────────────────────────────
  const vitalsChartData = vitals.map((v: any) => ({
    t: new Date(v.registrado_em).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    hr: v.hr,
    spo2: v.spo2,
  }));

  const latestExpression = expressions[expressions.length - 1];
  // Campo correto: mood (coluna real no Supabase)
  const currentMood = (latestExpression?.mood ?? bed.mood) as MoodType;
  const currentConf = latestExpression?.confianca ?? bed.conf;

  const mood = moodMeta[currentMood] ?? moodMeta["neutro"]!;
  const MoodIcon = mood.icon;

  const clinical: import("../../types").ClinicalData =
    clinicalData[bed.id] ??
    clinicalData["default"] ?? {
      idade: 0,
      internacao: "Desconhecida",
      diagnostico: "Sem dados",
      medico: "Sem Médico",
      spo2: 0,
    };

  // Emoção detectada pela câmera em tempo real
  const liveMood = detectedEmotion
    ? (moodMeta[detectedEmotion] ?? moodMeta["neutro"]!)
    : null;
  const LiveMoodIcon = liveMood?.icon ?? null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title={`${bed.name} (Leito ${bed.id})`}
        subtitle="Análise IA e histórico clínico"
        onBack={onBack}
      />

      <div className="flex-1 grid grid-cols-2 gap-5 p-6 overflow-hidden">
        {/* ── ESQUERDA: gráficos e histórico ── */}
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
                  {mood.label} ({currentConf}%)
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
              <LineChart data={vitalsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={styles.chartGrid} />
                <XAxis dataKey="t" stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <YAxis stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={styles.chartTooltip} />
                <Line
                  type="monotone"
                  dataKey="hr"
                  stroke={styles.chartLineHr}
                  name="FC"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke={styles.chartLineSpo2}
                  name="SpO2"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Eventos neurológicos */}
          <div className="bg-white rounded-xl border p-4" style={styles.card}>
            <p className="text-xs font-bold mb-2" style={styles.chartTitle}>
              Eventos Neurológicos
            </p>
            <div className="space-y-2">
              {tremorEvents.map((evt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={styles.eventRow}
                >
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

        {/* ── DIREITA: câmera + detecção em tempo real ── */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Card da câmera */}
          <div className="bg-white rounded-xl border p-4 flex flex-col gap-3" style={styles.card}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold" style={styles.chartTitle}>
                Monitoramento em Tempo Real
              </p>
              {/* Indicador de status */}
              <div className="flex items-center gap-1.5">
                {cameraState === "active" && (
                  <>
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#22c55e" }}
                    />
                    <span className="text-[11px] font-semibold" style={{ color: "#22c55e" }}>
                      AO VIVO
                    </span>
                  </>
                )}
                {cameraState === "starting" && (
                  <span className="text-[11px]" style={{ color: "#f97316" }}>
                    Iniciando…
                  </span>
                )}
                {cameraState === "idle" && (
                  <span className="text-[11px]" style={styles.patientInfoLabel}>
                    Câmera inativa
                  </span>
                )}
                {cameraState === "error" && (
                  <span className="text-[11px] font-semibold" style={{ color: "#ef4444" }}>
                    Erro
                  </span>
                )}
              </div>
            </div>

            {/* Vídeo */}
            <div
              className="relative w-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center"
              style={{ aspectRatio: "4/3", minHeight: 200 }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  display: cameraState === "active" ? "block" : "none",
                  transform: "scaleX(-1)", // espelha horizontalmente
                }}
              />

              {cameraState !== "active" && (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  {cameraState === "starting" ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : cameraState === "error" ? (
                    <AlertTriangle size={32} color="#ef4444" />
                  ) : (
                    <CameraOff size={32} />
                  )}
                  <span className="text-xs text-center px-4">
                    {cameraState === "error"
                      ? cameraError
                      : cameraState === "starting"
                      ? "Acessando câmera…"
                      : "Câmera desligada"}
                  </span>
                </div>
              )}

              {/* Overlay de detecção em curso */}
              {cameraState === "active" && isDetecting && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 rounded-lg px-2 py-1">
                  <Loader2 size={12} color="white" className="animate-spin" />
                  <span className="text-[10px] text-white">Analisando…</span>
                </div>
              )}
            </div>

            {/* Botão iniciar / parar */}
            <button
              onClick={cameraState === "active" ? stopCamera : startCamera}
              disabled={cameraState === "starting"}
              className="w-full h-10 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all"
              style={{
                background: cameraState === "active" ? "#fee2e2" : "#f97316",
                color: cameraState === "active" ? "#ef4444" : "white",
                opacity: cameraState === "starting" ? 0.6 : 1,
                cursor: cameraState === "starting" ? "not-allowed" : "pointer",
              }}
            >
              {cameraState === "active" ? (
                <>
                  <CameraOff size={16} /> Parar monitoramento
                </>
              ) : cameraState === "starting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Iniciando…
                </>
              ) : (
                <>
                  <Camera size={16} /> Iniciar monitoramento
                </>
              )}
            </button>

            {!bed.internacaoId && (
              <p className="text-[11px] text-center" style={{ color: "#f97316" }}>
                ⚠️ Este leito não possui internação ativa — detecções não serão salvas.
              </p>
            )}
          </div>

          {/* Card de resultado da IA */}
          <div className="bg-white rounded-xl border p-4 flex flex-col gap-3" style={styles.card}>
            <p className="text-xs font-bold" style={styles.chartTitle}>
              Última Detecção IA
            </p>

            {liveMood && LiveMoodIcon ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${liveMood.color}18` }}
                >
                  <LiveMoodIcon size={24} color={liveMood.color} />
                </div>
                <div>
                  <p
                    className="font-bold text-[18px]"
                    style={{ color: liveMood.color }}
                  >
                    {liveMood.label}
                  </p>
                  <p className="text-xs" style={styles.patientInfoLabel}>
                    Confiança: {detectedConf}% · {lastDetectionTs}
                  </p>
                </div>
                <CheckCircle size={20} color="#22c55e" className="ml-auto shrink-0" />
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400">
                <Camera size={20} />
                <p className="text-xs">
                  {cameraState === "active"
                    ? "Aguardando primeira detecção…"
                    : "Inicie o monitoramento para ver as detecções."}
                </p>
              </div>
            )}

            {/* Histórico de expressões do Supabase */}
            {expressions.length > 0 && (
              <div className="mt-1">
                <p className="text-[11px] font-semibold mb-2" style={styles.patientInfoLabel}>
                  Histórico (Supabase)
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...expressions]
                    .reverse()
                    .slice(0, 8)
                    .map((exp: any, i: number) => {
                      const m = moodMeta[exp.mood as MoodType] ?? moodMeta["neutro"]!;
                      const ExpIcon = m.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px] px-2 py-1 rounded-lg"
                          style={styles.eventRow}
                        >
                          <ExpIcon size={12} color={m.color} />
                          <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                          <span className="ml-auto" style={styles.eventTime}>
                            {exp.confianca}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Informações rápidas */}
          <div className="bg-white rounded-xl border p-4" style={styles.card}>
            <p className="text-xs font-bold mb-2" style={styles.chartTitle}>
              Resumo Clínico
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  SpO2
                </p>
                <p className="font-bold text-sm" style={styles.patientInfoTitle}>
                  {clinical.spo2}%
                </p>
              </div>
              <div className="p-2 rounded-lg" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  Dias internado
                </p>
                <p className="font-bold text-sm" style={styles.patientInfoTitle}>
                  {clinical.internacao}
                </p>
              </div>
              <div className="p-2 rounded-lg" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  Emoção atual (DB)
                </p>
                <p className="font-bold text-sm" style={{ color: mood.color }}>
                  {mood.label}
                </p>
              </div>
              <div className="p-2 rounded-lg" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  Confiança (DB)
                </p>
                <p className="font-bold text-sm" style={styles.patientInfoTitle}>
                  {currentConf}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};