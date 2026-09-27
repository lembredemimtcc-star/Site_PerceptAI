import React, { useRef, useState, useCallback } from "react";
import { Camera, CameraOff, Zap, Loader2, X } from "lucide-react";
import { captureFrame, dataUrlToBase64, detectEmotion } from "../../lib/detection";
import { moodMeta } from "../../config/mockData";
import { MoodType } from "../../types";

interface TestCameraModalProps {
  internacaoId?: string;
  onClose: () => void;
}

type Status = "idle" | "starting" | "ready" | "capturing" | "error";

export const TestCameraModal: React.FC<TestCameraModalProps> = ({ internacaoId = "teste", onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState<{ emotion: string; confidence: number } | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);

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

    try {
      const dataUrl = await captureFrame(videoRef.current);
      setLastFrame(dataUrl); // guarda a foto tirada para exibir

      const detection = await detectEmotion(dataUrlToBase64(dataUrl), internacaoId);

      setResult({
        emotion: detection.emotion,
        confidence: Math.round(detection.confidence * 100),
      });
    } catch (err) {
      setCameraError("Falha ao capturar ou enviar a imagem.");
    } finally {
      setStatus("ready");
    }
  }, [status, internacaoId]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const mood = result ? (moodMeta[result.emotion as MoodType] ?? moodMeta["neutro"]!) : null;
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
            <span className="font-semibold text-[15px]">Teste de Detecção IA</span>
          </div>
          <button onClick={handleClose} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={20} color="#fff" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex flex-col items-center gap-4 p-5 overflow-y-auto">
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
                  Ligue a câmera e clique em <br /><strong>"Capturar Emoção"</strong> para testar a IA
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
                Frame enviado para a IA
              </p>
              <img
                src={lastFrame}
                alt="Frame capturado"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: 180 }}
              />
            </div>
          )}

          {/* Resultado */}
          {result && mood && MoodIcon && (
            <div
              className="w-full rounded-xl p-4 flex items-center gap-4"
              style={{ background: "#f9fafb", border: `2px solid ${mood.color}` }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: mood.color + "22" }}
              >
                <MoodIcon size={24} color={mood.color} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Emoção Detectada
                </p>
                <p className="text-xl font-bold" style={{ color: mood.color }}>
                  {mood.label}
                </p>
                <p className="text-sm text-gray-500">Confiança: {result.confidence}%</p>
              </div>
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
                  <><Zap size={16} color="#f97316" /> Capturar Emoção</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
