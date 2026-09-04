"""
PerceptAI — Configuração Centralizada do Treinamento
=====================================================

Para o TREINAMENTO DE TESTE, mantenha:
    IMAGES_PER_CLASS = 150
    EPOCHS = 2

Para o TREINAMENTO DEFINITIVO, altere apenas:
    IMAGES_PER_CLASS = 1000
    EPOCHS = 150

Nenhum outro arquivo precisa ser modificado para essa transição.
"""

import os

# ---------------------------------------------------------------------------
# Hiperparâmetros principais
# (ALTERE APENAS AQUI para o treinamento definitivo)
# ---------------------------------------------------------------------------

IMAGES_PER_CLASS: int = 150   # Teste: 150  |  Definitivo: 1000
EPOCHS: int = 2               # Teste: 2    |  Definitivo: 150

# ---------------------------------------------------------------------------
# Hiperparâmetros fixos
# ---------------------------------------------------------------------------

IMAGE_SIZE: int = 224         # Resolução de entrada do MobileNetV2
BATCH_SIZE: int = 32          # Tamanho do mini-batch
LEARNING_RATE: float = 1e-4   # Adam optimizer learning rate (documentado no TCC)
SEED: int = 42                # Seed para reprodutibilidade
TRAIN_RATIO: float = 0.80     # 80% treino, 20% validação
NUM_CLASSES: int = 8          # Número de classes de saída

# ---------------------------------------------------------------------------
# Classes (ORDEM FIXA — não alterar)
# Compatível com o mapeamento da API C# (EmotionDetectionService.cs)
#   0: dor | 1: enjoo | 2: medo | 3: sono
#   4: tristeza | 5: neutro | 6: acordado | 7: dormindo
# ---------------------------------------------------------------------------

CLASS_NAMES: list[str] = [
    "dor",       # índice 0
    "enjoo",     # índice 1
    "medo",      # índice 2
    "sono",      # índice 3
    "tristeza",  # índice 4
    "neutro",    # índice 5
    "acordado",  # índice 6
    "dormindo",  # índice 7
]

# ---------------------------------------------------------------------------
# Mapeamento: nome da pasta do dataset → nome canônico da classe
# As pastas originais NÃO são renomeadas.
# ---------------------------------------------------------------------------

FOLDER_TO_CLASS: dict[str, str] = {
    "dor":         "dor",
    "enjoo":       "enjoo",
    "medo":        "medo",
    "sono":        "sono",
    "triste":      "tristeza",   # pasta "triste" → classe "tristeza"
    "neutro":      "neutro",
    "acordado":    "acordado",
    "desacordado": "dormindo",   # pasta "desacordado" → classe "dormindo"
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

# Raiz: dois níveis acima deste arquivo (src/training/ → src/ → Site_PerceptAI/)
_TRAINING_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR      = os.path.dirname(_TRAINING_DIR)
PROJECT_ROOT  = os.path.dirname(_SRC_DIR)

DATASETS_DIR  = os.path.join(_SRC_DIR, "datasets")
OUTPUTS_DIR   = os.path.join(PROJECT_ROOT, "outputs")

CHECKPOINTS_DIR = os.path.join(OUTPUTS_DIR, "checkpoints")
METRICS_DIR     = os.path.join(OUTPUTS_DIR, "metrics")
PLOTS_DIR       = os.path.join(OUTPUTS_DIR, "plots")
ONNX_DIR        = os.path.join(OUTPUTS_DIR, "onnx")

BEST_MODEL_PATH = os.path.join(CHECKPOINTS_DIR, "best_model.pth")
LAST_MODEL_PATH = os.path.join(CHECKPOINTS_DIR, "last_model.pth")
ONNX_MODEL_PATH = os.path.join(ONNX_DIR, "perceptai_mobilenetv2.onnx")
REPORT_PATH     = os.path.join(METRICS_DIR, "training_report.json")
