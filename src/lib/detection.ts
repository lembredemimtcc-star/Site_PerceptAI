import { supabase } from './supabase';

const BACKEND_URL = import.meta.env['VITE_BACKEND_URL'] || 'http://localhost:5198';

export interface DetectionRequest {
  Image: string;
  PatientId?: string;
  InternacaoId?: string;
}

export interface DetectionResponse {
  Emotion: string;
  Confidence: number;
  Timestamp: string;
}

export async function detectEmotion(
  base64Image: string,
  internacaoId: string
): Promise<DetectionResponse> {
  const response = await fetch(`${BACKEND_URL}/api/detection/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Image: base64Image,
      InternacaoId: internacaoId,
    } as DetectionRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

export async function saveDetectionToSupabase(
  internacaoId: string,
  emotion: string,
  confidence: number
): Promise<boolean> {
  const { error } = await supabase
    .from('expressoes_faciais')
    .insert({
      internacao_id: parseInt(internacaoId, 10),
      emocao: emotion,
      confianca: Math.round(confidence * 100),
      timestamp: new Date().toISOString(),
    });

  return !error;
}

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] || dataUrl;
}

export async function captureFrame(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}