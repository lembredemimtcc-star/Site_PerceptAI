"""
PerceptAI — Arquitetura do Modelo
===================================

MobileNetV2 com Transfer Learning (pesos ImageNet) e cabeça classificadora
ajustada para NUM_CLASSES saídas.

Compatível com a API C# (EmotionDetectionService.cs):
  - Input:  (1, 3, 224, 224) — NCHW, float32
  - Output: (1, 8) — 8 logits (softmax aplicado pela API C#)
"""

import torch
import torch.nn as nn
import torchvision
import torchvision.models as models
from torchvision.models import MobileNet_V2_Weights


def build_model(num_classes: int = 8) -> nn.Module:
    """
    Constrói o MobileNetV2 com Transfer Learning.

    Carrega os pesos pré-treinados no ImageNet e substitui a camada
    classificadora final para ter `num_classes` saídas.

    Args:
        num_classes: número de classes de saída (padrão: 8)

    Returns:
        modelo PyTorch pronto para treinamento
    """
    # Carrega MobileNetV2 com pesos ImageNet
    model = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)

    # Substitui a camada classificadora final
    # model.last_channel = 1280 (dimensão do feature extractor do MobileNetV2)
    model.classifier[1] = nn.Linear(model.last_channel, num_classes)

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
