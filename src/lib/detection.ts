import { PATIENT_MOCK_EMOTIONS, DEFAULT_MOCK_EMOTION } from "../config/mockEmotions";

// Se VITE_BACKEND_URL nao estiver definido, usa o MESMO host que serve o site
// (em dev/tunel o proxy do Vite encaminha /api para o backend local; em producao,
// o VITE_BACKEND_URL continua mandando). Sem isso, o app caia na simulacao.
const BACKEND_URL =
  (import.meta.env["VITE_BACKEND_URL"] as string | undefined)?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

export interface DetectionRequest {
  image: string;
  internacaoId?: string;
  patientId?: string;
}

export interface DetectionResponse {
  emotion: string;
  confidence: number;
  timestamp: string;
  estadoFisiologico: "acordado" | "dormindo";
  confiancaFisiologica?: number;
  estadoEmocional?: string | null;
  confiancaEmocional?: number | null;
}

// ── Mock de emoções definidas por paciente (internação) ─────────────────────
function getMockEmotionForPatient(internacaoId: string): DetectionResponse {
  const mock = PATIENT_MOCK_EMOTIONS[internacaoId] || { emotion: DEFAULT_MOCK_EMOTION, isSleeping: false };
  const confidence = 0.95;

  if (mock.isSleeping) {
    return {
      emotion: "dormindo",
      confidence,
      estadoFisiologico: "dormindo",
      confiancaFisiologica: confidence,
      estadoEmocional: null,
      confiancaEmocional: null,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    emotion: mock.emotion,
    confidence,
    estadoFisiologico: "acordado",
    confiancaFisiologica: 0.95,
    estadoEmocional: mock.emotion,
    confiancaEmocional: confidence,
    timestamp: new Date().toISOString(),
  };
}

// ── Detecção principal ──────────────────────────────────────────────────────
export async function detectEmotion(
  base64Image: string,
  internacaoId: string
): Promise<DetectionResponse> {
  // Sem backend configurado → usa emoção mockada definida por paciente
  if (!BACKEND_URL) {
    console.warn("[PerceptAI] VITE_BACKEND_URL não configurado — usando emoção mockada por paciente.");
    return getMockEmotionForPatient(internacaoId);
  }

  try {
    const controller = new AbortController();
    // Timeout de 60s (O Render pode demorar até 50s para acordar na primeira vez)
    const timeoutId = setTimeout(() => controller.abort(), 60000); 

    const response = await fetch(`${BACKEND_URL}/api/detection/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        internacaoId,
        Image: base64Image,
        InternacaoId: internacaoId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[PerceptAI] Backend retornou ${response.status} — usando emoção mockada por paciente.`);
      return getMockEmotionForPatient(internacaoId);
    }

    const data = await response.json();
    const rawEmotion = data.emotion ?? data.Emotion ?? "neutro";
    const rawConfidence = Number(data.confidence ?? data.Confidence ?? 0);

    // Identifica estado fisiológico vindo da API ou fallback inteligente
    const rawPhysio = data.estadoFisiologico ?? data.EstadoFisiologico;
    const estadoFisiologico: "acordado" | "dormindo" =
      rawPhysio === "dormindo" || rawEmotion === "dormindo" ? "dormindo" : "acordado";

    // Se dormindo, não há emoção aplicável
    let estadoEmocional: string | null = null;
    let confiancaEmocional: number | null = null;

    if (estadoFisiologico === "acordado") {
      estadoEmocional =
        data.estadoEmocional ?? data.EstadoEmocional ?? (rawEmotion === "acordado" ? "neutro" : rawEmotion);
      confiancaEmocional = Number(data.confiancaEmocional ?? data.ConfiancaEmocional ?? rawConfidence);
    }

    const confiancaFisiologica = Number(
      data.confiancaFisiologica ?? data.ConfiancaFisiologica ?? rawConfidence
    );

    return {
      emotion: rawEmotion,
      confidence: rawConfidence,
      estadoFisiologico,
      confiancaFisiologica,
      estadoEmocional,
      confiancaEmocional,
      timestamp: data.timestamp ?? data.Timestamp ?? new Date().toISOString(),
    };
  } catch (err: any) {
    const reason = err?.name === "AbortError" ? "timeout (60s) - O Render ainda não acordou!" : err?.message ?? "erro de rede";
    console.warn(`[PerceptAI] Detecção falhou (${reason}) — usando emoção mockada por paciente.`);
    return getMockEmotionForPatient(internacaoId);
  }
}

// ── Utilitários ─────────────────────────────────────────────────────────────
export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] || dataUrl;
}

export async function captureFrame(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.8);
}
