import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Camera,
  CameraOff,
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
import { moodMeta, vitalsData, tremorEvents } from "../../config/mockData";
import { useBeds, useSinaisVitais, useExpressoes } from "../../hooks";
import { infoIAStyles as styles } from "./InfoIA.styles";
import { COLORS } from "../../config/colors";
import { detectEmotion, captureFrame, dataUrlToBase64 } from "../../lib/detection";
import { idadeFrom, diasInternacao } from "../../lib/db";

interface InfoIAProps {
  bed?: Bed | null;
  onBack: () => void;
}

type CameraState = "idle" | "starting" | "active" | "error";

export const InfoIA: React.FC<InfoIAProps> = ({ bed, onBack }) => {
  const { data: beds = [] } = useBeds(false);
  const internados = useMemo(
    () => beds.filter((b) => b.status === "internado" && b.internacaoId),
    [beds]
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(bed?.internacaoId);

  useEffect(() => {
    if (bed?.internacaoId) setSelectedId(bed.internacaoId);
  }, [bed?.internacaoId]);

  const liveBed =
    internados.find((b) => b.internacaoId === selectedId) ??
    internados[0] ??
    bed ??
    internados[0];

  const internacaoId = liveBed?.internacaoId;
  const { data: vitals = [] } = useSinaisVitais(internacaoId);
  const { data: expressions = [] } = useExpressoes(internacaoId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectingRef = useRef(false);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [detectedConf, setDetectedConf] = useState(0);
  const [lastDetectionTs, setLastDetectionTs] = useState("");

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
    setIsDetecting(false);
    detectingRef.current = false;
  }, []);

  const runDetection = useCallback(async () => {
    if (!videoRef.current || !internacaoId || detectingRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      detectingRef.current = true;
      setIsDetecting(true);
      const dataUrl = await captureFrame(video);
      const result = await detectEmotion(dataUrlToBase64(dataUrl), internacaoId);
      setDetectedEmotion(result.emotion);
      setDetectedConf(Math.round(result.confidence * 100));
      setLastDetectionTs(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch {
      /* a câmera continua; esta rodada falhou */
    } finally {
      detectingRef.current = false;
      setIsDetecting(false);
    }
  }, [internacaoId]);

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
      intervalRef.current = setInterval(runDetection, 3000);
    } catch (err: any) {
      setCameraError(
        err?.name === "NotAllowedError"
          ? "Permissão de câmera negada. Permita o acesso nas configurações do navegador."
          : err?.name === "NotFoundError"
            ? "Nenhuma câmera encontrada neste dispositivo."
            : "Não foi possível acessar a câmera."
      );
      setCameraState("error");
    }
  }, [runDetection]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const latestVital = vitals[vitals.length - 1];
  const latestExpression = expressions[expressions.length - 1];
  const currentMood = (latestExpression?.mood ?? liveBed?.mood ?? "neutro") as MoodType;
  const currentConf = latestExpression?.confianca ?? liveBed?.conf ?? 0;
  const mood = moodMeta[currentMood] ?? moodMeta["neutro"]!;
  const MoodIcon = mood.icon;

  const vitalsChartData =
    vitals.length > 0
      ? vitals.map((v: any) => ({
          t: new Date(v.registrado_em || v.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          hr: v.hr,
          spo2: v.spo2,
        }))
      : vitalsData;

  const neuroEvents =
    expressions.length > 0
      ? expressions
          .filter((e: any) => ["dor", "medo", "enjoo", "tristeza"].includes(e.mood))
          .slice(-5)
          .reverse()
          .map((e: any) => ({
            t: new Date(e.timestamp || e.registrado_em).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            tipo: moodMeta[e.mood as MoodType]?.label ?? e.mood,
          }))
      : tremorEvents;

  const idade = idadeFrom(liveBed?.dataNascimento);
  const internacaoLabel = diasInternacao(liveBed?.dataEntrada);
  const diagnostico = liveBed?.diagnostico || "Sem diagnóstico informado";
  const medico = liveBed?.medicoNome || "Sem médico vinculado";
  const spo2 = latestVital?.spo2 ?? 0;

  const copilotText = latestExpression
    ? `Última expressão detectada: ${mood.label} (${currentConf}%). ${latestVital?.hr ? `FC ${latestVital.hr} bpm.` : ""} ${spo2 ? `SpO2 ${spo2}%.` : ""} ${diagnostico !== "Sem diagnóstico informado" ? `Diagnóstico: ${diagnostico}.` : ""}`
    : `${liveBed?.name ?? "Paciente"} em leito ${liveBed?.id ?? "—"}. ${diagnostico}. Inicie o monitoramento para registrar expressões no banco.`;

  const liveMood = detectedEmotion ? moodMeta[detectedEmotion] ?? moodMeta["neutro"]! : null;
  const LiveMoodIcon = liveMood?.icon ?? null;

  if (!liveBed) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Info IA" subtitle="Análise IA e histórico clínico" onBack={onBack} />
        <div className="flex-1 flex items-center justify-center px-8">
          <p className="text-sm" style={styles.patientInfoLabel}>
            Cadastre uma internação no módulo Cadastro para abrir a ficha da IA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title={`${liveBed.name} (Leito ${liveBed.id})`}
        subtitle="Análise IA e histórico clínico"
        onBack={onBack}
      />

      <div className="flex-1 grid grid-cols-2 gap-6 px-8 py-7 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white border p-4" style={styles.card}>
            {internados.length > 1 && (
              <select
                value={liveBed.internacaoId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full h-9 border px-2 text-[12px] mb-3 outline-none"
                style={styles.eventRow}
              >
                {internados.map((b) => (
                  <option key={b.internacaoId} value={b.internacaoId}>
                    {b.name} — Leito {b.id}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs" style={styles.patientInfoLabel}>
                  Idade: {idade || "—"} | Internação: {internacaoLabel}
                  {liveBed.convenio ? ` | ${liveBed.convenio}` : ""}
                </p>
                <p className="font-semibold text-sm" style={styles.patientInfoTitle}>
                  {diagnostico}
                </p>
                <p className="text-xs mt-1" style={styles.patientInfoLabel}>
                  Médico: {medico}
                  {liveBed.cpf ? ` · CPF ${liveBed.cpf}` : ""}
                </p>
                {liveBed.alergias ? (
                  <p className="text-xs mt-1" style={styles.patientInfoLabel}>
                    Alergias: {liveBed.alergias}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 p-3" style={styles.moodBox}>
                <MoodIcon size={16} color={mood.color} />
                <span className="text-xs font-semibold" style={styles.moodText}>
                  {mood.label} ({currentConf}%)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border p-4" style={styles.card}>
            <p className="kicker mb-3" style={styles.chartTitle}>
              Sinais Vitais (24h)
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={vitalsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={styles.chartGrid} />
                <XAxis dataKey="t" stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <YAxis stroke={styles.chartAxis} style={{ fontSize: 12 }} />
                <Tooltip contentStyle={styles.chartTooltip} />
                <Line type="monotone" dataKey="hr" stroke={styles.chartLineHr} name="FC" strokeWidth={2} />
                <Line type="monotone" dataKey="spo2" stroke={styles.chartLineSpo2} name="SpO2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            {vitals.length === 0 && (
              <p className="text-[11px] mt-2" style={styles.eventTime}>
                Sem leituras no banco ainda — gráfico de referência. Salve sinais no prontuário para gravar a série real.
              </p>
            )}
          </div>

          <div className="bg-white border p-4" style={styles.card}>
            <p className="kicker mb-3" style={styles.chartTitle}>
              Eventos Neurológicos
            </p>
            <div className="space-y-2">
              {neuroEvents.map((evt, i) => (
                <div key={i} className="flex items-center gap-2 p-2" style={styles.eventRow}>
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

        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white border p-4 flex flex-col gap-3" style={styles.card}>
            <div className="flex items-center justify-between">
              <p className="kicker" style={styles.chartTitle}>
                Monitoramento em Tempo Real
              </p>
              <div className="flex items-center gap-1.5">
                {cameraState === "active" && (
                  <>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.orange }} />
                    <span className="text-[11px] font-semibold" style={{ color: COLORS.orange }}>
                      AO VIVO
                    </span>
                  </>
                )}
                {cameraState === "starting" && (
                  <span className="text-[11px]" style={{ color: COLORS.orange }}>
                    Iniciando…
                  </span>
                )}
                {cameraState === "idle" && (
                  <span className="text-[11px]" style={styles.patientInfoLabel}>
                    Câmera inativa
                  </span>
                )}
                {cameraState === "error" && (
                  <span className="text-[11px] font-semibold" style={{ color: COLORS.red }}>
                    Erro
                  </span>
                )}
              </div>
            </div>

            <div
              className="relative w-full overflow-hidden flex items-center justify-center"
              style={{ aspectRatio: "4/3", minHeight: 200, background: COLORS.orangePainel }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  display: cameraState === "active" ? "block" : "none",
                  transform: "scaleX(-1)",
                }}
              />

              {cameraState !== "active" && (
                <div className="flex flex-col items-center gap-2" style={{ color: COLORS.orangeSoft }}>
                  {cameraState === "starting" ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : cameraState === "error" ? (
                    <AlertTriangle size={32} color={COLORS.red} />
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

              {cameraState === "active" && isDetecting && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1">
                  <Loader2 size={12} color="white" className="animate-spin" />
                  <span className="text-[10px] text-white">Analisando…</span>
                </div>
              )}
            </div>

            <button
              onClick={cameraState === "active" ? stopCamera : startCamera}
              disabled={cameraState === "starting"}
              className="w-full h-10 font-semibold text-[13px] flex items-center justify-center gap-2"
              style={{
                background: cameraState === "active" ? COLORS.redSoft : COLORS.orange,
                color: cameraState === "active" ? COLORS.red : COLORS.card,
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
          </div>

          <div className="bg-white border p-4 flex flex-col gap-3" style={styles.card}>
            <p className="kicker" style={styles.chartTitle}>
              Última Detecção IA
            </p>

            {liveMood && LiveMoodIcon ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center shrink-0"
                  style={{ background: `${liveMood.color}18` }}
                >
                  <LiveMoodIcon size={24} color={liveMood.color} />
                </div>
                <div>
                  <p className="display font-semibold text-[1.35rem]" style={{ color: liveMood.color }}>
                    {liveMood.label}
                  </p>
                  <p className="text-xs" style={styles.patientInfoLabel}>
                    Confiança: {detectedConf}% · {lastDetectionTs}
                  </p>
                </div>
                <CheckCircle size={20} color={COLORS.orange} className="ml-auto shrink-0" />
              </div>
            ) : (
              <div className="flex items-center gap-3" style={{ color: COLORS.slateSoft }}>
                <Camera size={20} />
                <p className="text-xs">
                  {cameraState === "active"
                    ? "Aguardando primeira detecção…"
                    : "Inicie o monitoramento para ver as detecções."}
                </p>
              </div>
            )}

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
                        <div key={exp.id ?? i} className="flex items-center gap-2 text-[11px] px-2 py-1" style={styles.eventRow}>
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

          <div className="bg-white border p-4" style={styles.card}>
            <p className="kicker mb-3" style={styles.chartTitle}>
              Resumo Clínico
            </p>
            <p className="text-[12px] leading-relaxed mb-3" style={styles.patientInfoLabel}>
              {copilotText}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  SpO2
                </p>
                <p className="font-semibold text-sm" style={styles.patientInfoTitle}>
                  {spo2 ? `${spo2}%` : "—"}
                </p>
              </div>
              <div className="p-2" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  Dias internado
                </p>
                <p className="font-semibold text-sm" style={styles.patientInfoTitle}>
                  {internacaoLabel}
                </p>
              </div>
              <div className="p-2" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  Emoção atual (DB)
                </p>
                <p className="font-semibold text-sm" style={{ color: mood.color }}>
                  {mood.label}
                </p>
              </div>
              <div className="p-2" style={styles.eventRow}>
                <p className="text-[10px] font-semibold" style={styles.patientInfoLabel}>
                  Confiança (DB)
                </p>
                <p className="font-semibold text-sm" style={styles.patientInfoTitle}>
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
