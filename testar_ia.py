r"""
PerceptAI — Teste rapido do modelo ONNX com uma imagem
=====================================================
Uso:
    python testar_ia.py caminho/da/foto.jpg

Exemplo:
    python testar_ia.py C:\Users\Solange\Pictures\foto.jpg
"""

import sys
import os
import numpy as np
from PIL import Image

# Garante suporte a utf-8 no terminal Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

CLASSES = ['dor', 'enjoo', 'medo', 'sono', 'tristeza', 'neutro', 'acordado', 'dormindo']
# Procura o modelo no diretorio back/ML/model.onnx
_candidatos = [
    os.path.join(os.path.dirname(__file__), 'back', 'ML', 'model.onnx'),
    os.path.join(os.path.dirname(__file__), '..', 'back', 'ML', 'model.onnx'),
    r'C:\Users\Solange\Desktop\TCC\back\ML\model.onnx',
]
MODEL_PATH = next((p for p in _candidatos if os.path.exists(p)), _candidatos[0])
MIN_EMOTION_THRESHOLD = 0.30  # limiar minimo de 30%

def testar_imagem(img_path: str):
    try:
        import onnxruntime as ort
    except ImportError:
        print("[ERRO] onnxruntime nao instalado.")
        print("       Rode: pip install onnxruntime Pillow")
        return

    if not os.path.exists(MODEL_PATH):
        print(f"[ERRO] modelo nao encontrado em: {MODEL_PATH}")
        return

    if not os.path.exists(img_path):
        print(f"[ERRO] imagem nao encontrada: {img_path}")
        return

    print(f"\n[*] Testando imagem: {img_path}")
    print(f"[*] Modelo: {MODEL_PATH}")
    print()

    # 1. Carrega e preprocessa (igual ao ImagePreprocessingService da API)
    img = Image.open(img_path).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0

    # Normalizacao ImageNet
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std

    # HWC -> CHW -> NCHW
    arr = arr.transpose(2, 0, 1)
    inp = arr[np.newaxis, ...].astype(np.float32)

    # 2. Inferencia ONNX
    session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    logits = session.run(None, {'images': inp})[0][0]
    probs = softmax(logits)

    # 3. Exibe resultado completo
    print("=" * 60)
    print("PROBABILIDADES POR CLASSE:")
    print("=" * 60)
    ranking = sorted(enumerate(probs), key=lambda x: x[1], reverse=True)
    for idx, prob in ranking:
        bar = "#" * int(prob * 25)
        marker = " <-- MAIOR" if idx == ranking[0][0] else ""
        print(f"  {CLASSES[idx]:12s}: {prob*100:6.2f}%  [{bar:<25}] {marker}")

    print()
    print("=" * 60)
    print("RESULTADO FINAL (Regra de 2 Estados):")
    print("=" * 60)

    p_dormindo = probs[7]
    p_acordado = probs[6]

    # Melhor emocao entre 0 e 5 (dor, enjoo, medo, sono, tristeza, neutro)
    best_emotion_idx = max(range(6), key=lambda i: probs[i])
    max_emotion_conf = probs[best_emotion_idx]

    # Vencedor absoluto global
    global_max_idx = int(np.argmax(probs))

    # Criterio de estado fisiologico
    is_dormindo = (global_max_idx == 7) or (p_dormindo > p_acordado and p_dormindo > max_emotion_conf)

    if is_dormindo:
        print(f"  [1] Estado Fisiologico : DORMINDO  ({p_dormindo*100:.1f}%)")
        print(f"  [2] Estado Emocional   : (Nao aplicavel - paciente dormindo)")
    else:
        print(f"  [1] Estado Fisiologico : ACORDADO  ({p_acordado*100:.1f}%)")
        if max_emotion_conf >= MIN_EMOTION_THRESHOLD:
            emocao = CLASSES[best_emotion_idx]
            print(f"  [2] Estado Emocional   : {emocao.upper()}  ({max_emotion_conf*100:.1f}%)")
        else:
            emocao_topo = CLASSES[best_emotion_idx]
            print(f"  [2] Estado Emocional   : NEUTRO (maior emocao foi '{emocao_topo}' com {max_emotion_conf*100:.1f}%, abaixo de {int(MIN_EMOTION_THRESHOLD*100)}%)")

    print("=" * 60)
    print()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python testar_ia.py <caminho_da_foto>")
        print("Exemplo: python testar_ia.py foto.jpg")
        sys.exit(1)

    testar_imagem(sys.argv[1])
