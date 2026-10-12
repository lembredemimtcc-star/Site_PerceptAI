"""
PerceptAI — Configuração para Treinamento de 2 Modelos Separados
==================================================================

Arquitetura de Dois Estados:
  1. Modelo Fisiológico (Binary Classifier): "acordado" vs "dormindo"
  2. Modelo Emocional (6 Classes): "dor", "enjoo", "medo", "tristeza", "neutro", "sono"

Para o TREINAMENTO DE TESTE, mantenha:
    IMAGES_PER_CLASS = 150
    EPOCHS = 2

Para o TREINAMENTO DEFINITIVO, altere apenas:
    IMAGES_PER_CLASS = 1000
    EPOCHS = 50  (com early stopping ativado)
"""

import os

# ---------------------------------------------------------------------------
# Hiperparâmetros principais
# (ALTERE APENAS AQUI para o treinamento definitivo)
# ---------------------------------------------------------------------------

IMAGES_PER_CLASS: int = 1000   # Teste: 150  |  Definitivo: 1000
EPOCHS: int = 50               # Teste: 2    |  Definitivo: 50 (com early stopping)

# ---------------------------------------------------------------------------
# Hiperparâmetros fixos - regularização para evitar overfitting
# ---------------------------------------------------------------------------

IMAGE_SIZE: int = 224         # Resolução de entrada do MobileNetV2
BATCH_SIZE: int = 32          # Tamanho do mini-batch
LEARNING_RATE: float = 1e-4   # Adam optimizer learning rate
WEIGHT_DECAY: float = 1e-4    # L2 regularization (reduz overfitting)
DROPOUT_RATE: float = 0.3     # Dropout na camada classificadora
SEED: int = 42                # Seed para reprodutibilidade
TRAIN_RATIO: float = 0.80     # 80% treino, 20% validação

# ---------------------------------------------------------------------------
# Early Stopping (sai do treinamento se não melhorar por N épocas)
# ---------------------------------------------------------------------------

EARLY_STOPPING_PATIENCE: int = -1  # Desativado (-1 = todas as épocas)
EARLY_STOPPING_MIN_DELTA: float = 0.001  # Melhoria mínima para contar como progresso

# ---------------------------------------------------------------------------
# Classes - Modelo Fisiológico (Binary Classifier)
# ---------------------------------------------------------------------------

PHYSIO_CLASSES: list[str] = [
    "acordado",   # índice 0
    "dormindo",   # índice 1
]

PHYSIO_FOLDER_TO_CLASS: dict[str, str] = {
    "acordado":    "acordado",
    "desacordado": "dormindo",
}

# ---------------------------------------------------------------------------
# Classes - Modelo Emocional (6 Classes - exclui acordado/dormindo)
# ---------------------------------------------------------------------------

EMOTION_CLASSES: list[str] = [
    "dor",       # índice 0
    "enjoo",     # índice 1
    "medo",      # índice 2
    "sono",      # índice 3
    "tristeza",  # índice 4
    "neutro",    # índice 5
]

EMOTION_FOLDER_TO_CLASS: dict[str, str] = {
    "dor":         "dor",
    "enjoo":       "enjoo",
    "medo":        "medo",
    "sono":        "sono",
    "triste":      "tristeza",
    "neutro":      "neutro",
}

# ---------------------------------------------------------------------------
# Normalização ImageNet
# Deve ser idêntica ao preprocessing da API C# (ImagePreprocessingService.cs)
# ---------------------------------------------------------------------------

IMAGENET_MEAN: list[float] = [0.485, 0.456, 0.406]
IMAGENET_STD: list[float]  = [0.229, 0.224, 0.225]

# ---------------------------------------------------------------------------
# Extensões de imagem suportadas
# ---------------------------------------------------------------------------

SUPPORTED_EXTENSIONS: tuple[str, ...] = (".jpg", ".jpeg", ".png", ".bmp", ".webp")

# ---------------------------------------------------------------------------
# Caminhos do projeto (relativos ao script, sem caminhos absolutos fixos)
# ---------------------------------------------------------------------------

_TRAINING_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR      = os.path.dirname(_TRAINING_DIR)
PROJECT_ROOT  = os.path.dirname(_SRC_DIR)

DATASETS_DIR  = os.path.join(_SRC_DIR, "datasets")
OUTPUTS_DIR   = os.path.join(PROJECT_ROOT, "outputs")

# Diretórios separados para os 2 modelos
PHYSIO_CHECKPOINTS_DIR = os.path.join(OUTPUTS_DIR, "checkpoints_physio")
PHYSIO_METRICS_DIR     = os.path.join(OUTPUTS_DIR, "metrics_physio")
PHYSIO_PLOTS_DIR       = os.path.join(OUTPUTS_DIR, "plots_physio")
PHYSIO_ONNX_DIR        = os.path.join(OUTPUTS_DIR, "onnx_physio")

EMOTION_CHECKPOINTS_DIR = os.path.join(OUTPUTS_DIR, "checkpoints_emotion")
EMOTION_METRICS_DIR     = os.path.join(OUTPUTS_DIR, "metrics_emotion")
EMOTION_PLOTS_DIR       = os.path.join(OUTPUTS_DIR, "plots_emotion")
EMOTION_ONNX_DIR        = os.path.join(OUTPUTS_DIR, "onnx_emotion")

# Caminhos dos arquivos de modelo
PHYSIO_BEST_MODEL_PATH = os.path.join(PHYSIO_CHECKPOINTS_DIR, "best_model_physio.pth")
PHYSIO_LAST_MODEL_PATH = os.path.join(PHYSIO_CHECKPOINTS_DIR, "last_model_physio.pth")
PHYSIO_ONNX_MODEL_PATH = os.path.join(PHYSIO_ONNX_DIR, "perceptai_physio.onnx")
PHYSIO_REPORT_PATH     = os.path.join(PHYSIO_METRICS_DIR, "training_report_physio.json")

EMOTION_BEST_MODEL_PATH = os.path.join(EMOTION_CHECKPOINTS_DIR, "best_model_emotion.pth")
EMOTION_LAST_MODEL_PATH = os.path.join(EMOTION_CHECKPOINTS_DIR, "last_model_emotion.pth")
EMOTION_ONNX_MODEL_PATH = os.path.join(EMOTION_ONNX_DIR, "perceptai_emotion.onnx")
EMOTION_REPORT_PATH     = os.path.join(EMOTION_METRICS_DIR, "training_report_emotion.json")
