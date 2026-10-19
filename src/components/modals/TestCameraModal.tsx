import React, { useRef, useState, useCallback } from "react";
import { Camera, CameraOff, Zap, Loader2, X, Moon, Eye } from "lucide-react";
import { captureFrame } from "../../lib/detection";
import { moodMeta } from "../../config/mockData";
import { MoodType } from "../../types";

interface TestCameraModalProps {
  internacaoId?: string;
  onClose: () => void;
}

type Status = "idle" | "starting" | "ready" | "capturing" | "error";

const MOCK_EMOTIONS = [
  { value: "neutro", label: "Neutro" },
  { value: "dor", label: "Dor" },
  { value: "tristeza", label: "Tristeza" },
  { value: "medo", label: "Medo" },
  { value: "enjoo", label: "Enjoo" },
  { value: "sono", label: "Sono" },
  { value: "dormindo", label: "Dormindo" },
];

export const TestCameraModal: React.FC<TestCameraModalProps> = ({ internacaoId = "teste", onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [cameraError, setCameraError] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("dor");
  const [result, setResult] = useState<{
    emotion: string;
    confidence: number;
    estadoFisiologico: "acordado" | "dormindo";
    confiancaFisiologica?: number;
    estadoEmocional?: string | null;
    confiancaEmocional?: number | null;
  } | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [debugRanking, setDebugRanking] = useState<{ emocao: string; confianca: number }[] | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setStatus("starting");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
    } catch (err: any) {
      setCameraError(
        err?.name === "NotAllowedError"
          ? "Permissão de câmera negada. Permita o acesso nas configurações."
          : "Não foi possível acessar a câmera."
      );
      setStatus("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setResult(null);
    setLastFrame(null);
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || status !== "ready") return;
    setStatus("capturing");
    setResult(null);
    setDebugRanking(null);

    try {
      const dataUrl = await captureFrame(videoRef.current);
      setLastFrame(dataUrl);

      // Usa a emoção selecionada no dropdown em vez de chamar a IA
      const isSleeping = selectedEmotion === "dormindo";
      const confidence = 95;

      setResult({
        emotion: selectedEmotion,
        confidence,
        estadoFisiologico: isSleeping ? "dormindo" : "acordado",
        confiancaFisiologica: confidence,
        estadoEmocional: isSleeping ? null : selectedEmotion,
        confiancaEmocional: isSleeping ? null : confidence,
      });
    } catch (err) {
      setCameraError("Falha ao capturar a imagem.");
    } finally {
      setStatus("ready");
    }
  }, [status, selectedEmotion]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const activeEmotionName = result?.estadoEmocional || result?.emotion || "neutro";
  const mood = moodMeta[activeEmotionName as MoodType] ?? moodMeta["neutro"]!;
  const MoodIcon = mood?.icon ?? null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "#fff", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "#1a1a2e", color: "#fff" }}
        >
          <div className="flex items-center gap-2">
            <Zap size={18} color="#f97316" />
            <span className="font-semibold text-[15px]">Análise IA de Paciente</span>
          </div>
          <button onClick={handleClose} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={20} color="#fff" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex flex-col items-center gap-4 p-5 overflow-y-auto">
          {/* Dropdown de seleção de emoção */}
          <div className="w-full">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Emoção a Simular
            </label>
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm outline-none focus:border-orange-500"
              disabled={status === "capturing"}
            >
              {MOCK_EMOTIONS.map((emo) => (
                <option key={emo.value} value={emo.value}>
                  {emo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Área da câmera */}
          <div
            className="w-full rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: "#0f0f1a", minHeight: 240, position: "relative" }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full object-cover"
              style={{ display: status === "ready" || status === "capturing" ? "block" : "none", maxHeight: 320 }}
            />

            {/* Placeholder quando câmera inativa */}
            {status === "idle" && (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <Camera size={40} color="#f97316" />
                <p className="text-sm text-white opacity-70">
                  Ligue a câmera e clique em <br /><strong>"Analisar Paciente"</strong> para testar os dois estados
                </p>
              </div>
            )}

            {status === "starting" && (
              <Loader2 size={36} className="animate-spin" color="#f97316" />
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <CameraOff size={36} color="#ef4444" />
                <p className="text-sm text-red-400">{cameraError}</p>
              </div>
            )}

            {/* Flash overlay durante captura */}
            {status === "capturing" && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(249,115,22,0.15)" }}
              >
                <Loader2 size={40} className="animate-spin" color="#f97316" />
              </div>
            )}
          </div>

          {/* Foto tirada */}
          {lastFrame && (
            <div className="w-full">
              <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1 tracking-wide">
                Frame capturado
              </p>
              <img
                src={lastFrame}
                alt="Frame capturado"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: 160 }}
              />
            </div>
          )}

          {/* Resultado: DOIS ESTADOS (Fisiológico + Emocional) */}
          {result && (
            <div className="w-full space-y-3">
              {/* 1º ESTADO FISIOLÓGICO: Dormindo ou Acordado */}
              {result.estadoFisiologico === "dormindo" ? (
                <div
                  className="w-full rounded-xl p-4 flex items-center gap-4"
                  style={{ background: "#eef2ff", border: "2px solid #6366f1" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#c7d2fe" }}
                  >
                    <Moon size={24} color="#4338ca" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">
                        1º Estado Fisiológico
                      </p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {result.confiancaFisiologica ?? result.confidence}%
                      </span>
                    </div>
                    <p className="text-xl font-bold text-indigo-950">
                      Dormindo
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      Paciente em repouso. Análise de emoção não necessária durante o sono.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Paciente ACORDADO */}
                  <div
                    className="w-full rounded-xl p-4 flex items-center gap-4"
                    style={{ background: "#ecfdf5", border: "2px solid #10b981" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "#a7f3d0" }}
                    >
                      <Eye size={24} color="#047857" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                          1º Estado Fisiológico
                        </p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {result.confiancaFisiologica ?? 95}%
                        </span>
                      </div>
                      <p className="text-xl font-bold text-emerald-950">
                        Acordado
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Paciente consciente e em vigília.
                      </p>
                    </div>
                  </div>

                  {/* 2º ESTADO EMOCIONAL: Aparece logo em baixo de Acordado */}
                  {MoodIcon && (
                    <div
                      className="w-full rounded-xl p-4 flex items-center gap-4 transition-all"
                      style={{ background: "#fff", border: `2px solid ${mood.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: mood.color + "22" }}
                      >
                        <MoodIcon size={24} color={mood.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                            2º Estado Emocional
                          </p>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: mood.color + "20", color: mood.color }}
                          >
                            {result.confiancaEmocional ?? result.confidence}%
                          </span>
                        </div>
                        <p className="text-xl font-bold" style={{ color: mood.color }}>
                          {mood.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Expressão facial avaliada pela rede neural.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Ranking de probabilidades — diagnóstico */}
          {debugRanking && (
            <div className="w-full rounded-xl p-4" style={{ background: "#f0f4ff" }}>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                📊 Probabilidade por emoção (diagnóstico)
              </p>
              <div className="space-y-2">
                {debugRanking.map((item) => (
                  <div key={item.emocao}>
                    <div className="flex justify-between text-[12px] mb-0.5">
                      <span className="font-medium capitalize">{item.emocao}</span>
                      <span className="text-gray-500">{item.confianca}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: "#e2e8f0" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${item.confianca}%`,
                          background: item.confianca > 50 ? "#f97316" : item.confianca > 20 ? "#f59e0b" : "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {result?.emotion === "neutro" && result.confidence > 80 && (
                <p className="text-[11px] text-amber-600 mt-3 font-medium">
                  ⚠️ Modelo com forte viés para "neutro". Pode indicar problema na ordem das classes ou normalização BGR/RGB.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 px-5 pb-5">
          {status === "idle" || status === "error" ? (
            <button
              onClick={startCamera}
              className="flex-1 h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              style={{ background: "#f97316", color: "#fff" }}
            >
              <Camera size={16} /> Ligar Câmera
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="h-11 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: "#fee2e2", color: "#ef4444" }}
              >
                <CameraOff size={16} /> Desligar
              </button>
              <button
                onClick={captureAndDetect}
                disabled={status === "capturing" || status === "starting"}
                className="flex-1 h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "#1a1a2e", color: "#fff" }}
              >
                {status === "capturing" ? (
                  <><Loader2 size={16} className="animate-spin" /> Analisando...</>
                ) : (
                  <><Zap size={16} color="#f97316" /> Analisar Paciente</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
