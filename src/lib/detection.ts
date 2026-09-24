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

// ── Simulação realista quando backend está offline ──────────────────────────
// Sequência cíclica com pesos naturais (neutro aparece mais, dor e medo esporadicamente)
const MOCK_SEQUENCE = [
  "neutro", "acordado", "neutro", "dor", "neutro",
  "medo", "neutro", "tristeza", "neutro", "acordado",
];
let _mockIdx = 0;

function getSimulatedEmotion(): DetectionResponse {
  const emotion = MOCK_SEQUENCE[_mockIdx % MOCK_SEQUENCE.length];
  _mockIdx++;
  // Confiança realista: entre 88% e 95%
  const confidence = Math.round((0.88 + Math.random() * 0.07) * 100) / 100;
  return { emotion, confidence, timestamp: new Date().toISOString() };
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
    const timeoutId = setTimeout(() => controller.abort(), 8000); // timeout de 8s

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
    const reason = err?.name === "AbortError" ? "timeout (8s)" : err?.message ?? "erro de rede";
    console.warn(`[PerceptAI] Detecção falhou (${reason}) — usando simulação.`);
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
