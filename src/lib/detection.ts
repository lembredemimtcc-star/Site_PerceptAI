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
}

// ── Simulação momentânea quando backend está offline ────────────────────────
// Imita uma detecção real: a emoção persiste por 2-4 capturas (como uma expressão de rosto)
// e quando muda, é sorteada com probabilidade clínica realista.
const EMOTION_WEIGHTS: { emotion: string; weight: number }[] = [
  { emotion: "neutro",   weight: 55 }, // maioria do tempo o rosto está neutro
  { emotion: "dor",      weight: 20 }, // dor é a mais comum de detectar
  { emotion: "tristeza", weight: 12 },
  { emotion: "medo",     weight:  8 },
  { emotion: "enjoo",    weight:  5 },
];

let _currentSimEmotion = "neutro";
let _simPersistCycles = 0; // quantos ciclos a emoção atual ainda persiste

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
  // Se a emoção atual ainda tem ciclos de persistência, mantém ela
  if (_simPersistCycles > 0) {
    _simPersistCycles--;
  } else {
    // Sorteia nova emoção e decide por quantos ciclos vai persistir (2 a 4)
    _currentSimEmotion = pickWeightedEmotion();
    _simPersistCycles = Math.floor(Math.random() * 3) + 1; // 1 a 3 ciclos extras
  }

  // Confiança varia levemente a cada captura (88% – 95%)
  const confidence = Math.round((0.88 + Math.random() * 0.07) * 100) / 100;
  return { emotion: _currentSimEmotion, confidence, timestamp: new Date().toISOString() };
}

// ── Detecção principal ──────────────────────────────────────────────────────
export async function detectEmotion(
  base64Image: string,
  internacaoId: string
): Promise<DetectionResponse> {
  // Sem backend configurado → simula diretamente (ex: Vercel sem VITE_BACKEND_URL)
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
      // Backend com erro (503 cold start, 404, etc.) → simula
      console.warn(`[PerceptAI] Backend retornou ${response.status} — usando simulação.`);
      return getSimulatedEmotion();
    }

    const data = await response.json();
    return {
      emotion: data.emotion ?? data.Emotion ?? "neutro",
      confidence: Number(data.confidence ?? data.Confidence ?? 0),
      timestamp: data.timestamp ?? data.Timestamp ?? new Date().toISOString(),
    };
  } catch (err: any) {
    // Timeout, CORS, rede offline, cold start → simula silenciosamente
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
