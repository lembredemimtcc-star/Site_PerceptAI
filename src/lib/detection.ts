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

export async function detectEmotion(
  base64Image: string,
  internacaoId: string
): Promise<DetectionResponse> {
  const response = await fetch(`${BACKEND_URL}/api/detection/detect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
      internacaoId,
      Image: base64Image,
      InternacaoId: internacaoId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  const data = await response.json();
  return {
    emotion: data.emotion ?? data.Emotion ?? "neutro",
    confidence: Number(data.confidence ?? data.Confidence ?? 0),
    timestamp: data.timestamp ?? data.Timestamp ?? new Date().toISOString(),
  };
}

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
