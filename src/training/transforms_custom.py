"""
PerceptAI — Transforms Personalizados para Data Augmentation
==============================================================

Inclui GaussianNoise para aumentar a robustez do modelo a ruído de imagem.
"""

import torch
import torch.nn as nn
from torchvision import transforms


class GaussianNoise(nn.Module):
    """
    Adiciona ruído gaussiano à imagem para melhorar generalização.
    """

    def __init__(self, mean: float = 0.0, std: float = 0.1):
        super().__init__()
        self.mean = mean
        self.std = std

    def forward(self, tensor: torch.Tensor) -> torch.Tensor:
        """
        Args:
            tensor: Tensor da imagem (C, H, W) no range [0, 1]

        Returns:
            Tensor com ruído gaussiano adicionado
        """
        if self.std == 0:
            return tensor

        noise = torch.randn_like(tensor) * self.std + self.mean
        return torch.clamp(tensor + noise, 0.0, 1.0)

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(mean={self.mean}, std={self.std})"
