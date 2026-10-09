"""
PerceptAI — Arquitetura do Modelo com Regularização
===================================================

MobileNetV2 com Transfer Learning (pesos ImageNet) e cabeça classificadora
ajustada com Dropout para evitar overfitting.

Compatível com a API C# (EmotionDetectionService.cs):
  - Input:  (1, 3, 224, 224) — NCHW, float32
  - Output: (1, num_classes) — logits (softmax aplicado pela API C#)
"""

import torch
import torch.nn as nn
import torchvision
import torchvision.models as models
from torchvision.models import MobileNet_V2_Weights


def build_model(num_classes: int = 8, dropout_rate: float = 0.3) -> nn.Module:
    """
    Constrói o MobileNetV2 com Transfer Learning e Dropout.

    Carrega os pesos pré-treinados no ImageNet e substitui a camada
    classificadora final por uma camada com Dropout para regularização.

    Args:
        num_classes: número de classes de saída (padrão: 8)
        dropout_rate: taxa de dropout para regularização (padrão: 0.3)

    Returns:
        modelo PyTorch pronto para treinamento
    """
    # Carrega MobileNetV2 com pesos ImageNet
    model = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)

    # model.last_channel = 1280 (dimensão do feature extractor do MobileNetV2)
    # Substitui a camada classificadora final com Dropout
    model.classifier = nn.Sequential(
        nn.Dropout(p=dropout_rate),
        nn.Linear(model.last_channel, num_classes)
    )

    return model


def load_checkpoint(model: nn.Module, checkpoint_path: str, device: torch.device) -> dict:
    """
    Carrega pesos de um checkpoint salvo.

    Args:
        model:           instância do modelo
        checkpoint_path: caminho para o arquivo .pth
        device:          device alvo (CPU ou CUDA)

    Returns:
        dicionário com metadados do checkpoint (epochs, best_val_acc, etc.)
    """
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    return checkpoint


def count_parameters(model: nn.Module) -> dict:
    """
    Conta parâmetros totais e treináveis do modelo.

    Returns:
        {"total": int, "trainable": int}
    """
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {"total": total, "trainable": trainable}
