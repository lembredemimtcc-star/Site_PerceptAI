const BACKEND_URL = (import.meta.env["VITE_BACKEND_URL"] as string | undefined)?.replace(/\/$/, "") || "";

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

// ── Simulação momentânea quando backend está offline ────────────────────────
const EMOTION_WEIGHTS: { emotion: string; weight: number }[] = [
  { emotion: "neutro",   weight: 50 },
  { emotion: "dor",      weight: 22 },
  { emotion: "tristeza", weight: 12 },
  { emotion: "medo",     weight:  9 },
  { emotion: "enjoo",    weight:  7 },
];

let _currentSimPhysio: "acordado" | "dormindo" = "acordado";
let _currentSimEmotion = "neutro";
let _simPersistCycles = 0;

function pickWeightedEmotion(): string {
  const total = EMOTION_WEIGHTS.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of EMOTION_WEIGHTS) {
    r -= e.weight;
    if (r <= 0) return e.emotion;
  }
  return "neutro";
}

function getSimulatedEmotion(): DetectionResponse {
  if (_simPersistCycles > 0) {
    _simPersistCycles--;
  } else {
    // 85% de chance acordado, 15% dormindo
    _currentSimPhysio = Math.random() < 0.15 ? "dormindo" : "acordado";
    _currentSimEmotion = pickWeightedEmotion();
    _simPersistCycles = Math.floor(Math.random() * 3) + 1;
  }

  const confidence = Math.round((0.88 + Math.random() * 0.08) * 100) / 100;

  if (_currentSimPhysio === "dormindo") {
    return {
      emotion: "dormindo",
      confidence,
      estadoFisiologico: "dormindo",
      confiancaFisiologica: confidence,
      estadoEmocional: null, // sem emoção quando dormindo
      confiancaEmocional: null,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    emotion: _currentSimEmotion,
    confidence,
    estadoFisiologico: "acordado",
    confiancaFisiologica: 0.95,
    estadoEmocional: _currentSimEmotion,
    confiancaEmocional: confidence,
    timestamp: new Date().toISOString(),
  };
}

// ── Detecção principal ──────────────────────────────────────────────────────
export async function detectEmotion(
  base64Image: string,
  internacaoId: string
): Promise<DetectionResponse> {
  // Sem backend configurado → simula diretamente
  if (!BACKEND_URL) {
    console.warn("[PerceptAI] VITE_BACKEND_URL não configurado — usando simulação de emoção.");
    return getSimulatedEmotion();
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
      console.warn(`[PerceptAI] Backend retornou ${response.status} — usando simulação.`);
      return getSimulatedEmotion();
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
    console.warn(`[PerceptAI] Detecção falhou (${reason}) — ativando simulação local por enquanto.`);
    return getSimulatedEmotion();
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
