"""
PerceptAI — Dataset PyTorch
============================

FacialExpressionDataset: carrega imagens de uma lista de (path, label),
aplica as transformações configuradas e garante conversão para RGB.
"""

from typing import List, Tuple

from PIL import Image, UnidentifiedImageError
import torch
from torch.utils.data import Dataset


class FacialExpressionDataset(Dataset):
    """
    Dataset de classificação facial para o PerceptAI.

    Parâmetros:
        samples:   lista de (caminho_da_imagem, label_inteiro)
        transform: torchvision.transforms a aplicar (treino ou validação)
        class_names: lista de nomes de classe (para referência)
    """

    def __init__(
        self,
        samples: List[Tuple[str, int]],
        transform=None,
        class_names: List[str] = None,
    ):
        self.samples = samples
        self.transform = transform
        self.class_names = class_names or []

        # Filtra imagens corrompidas logo na inicialização
        self.samples = self._validate_samples(samples)

    def _validate_samples(
        self, samples: List[Tuple[str, int]]
    ) -> List[Tuple[str, int]]:
        """
        Tenta abrir cada imagem para verificar se não está corrompida.
        Imagens corrompidas são ignoradas com aviso.
        """
        valid = []
        skipped = 0
        for path, label in samples:
            try:
                with Image.open(path) as img:
                    img.verify()  # verifica integridade sem decodificar totalmente
                valid.append((path, label))
            except (UnidentifiedImageError, OSError, Exception):
                print(f"  [AVISO] Imagem corrompida ignorada: '{path}'")
                skipped += 1
        if skipped > 0:
            print(f"  [AVISO] {skipped} imagem(ns) corrompida(s) ignorada(s).")
        return valid

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]

        # Carrega a imagem e força conversão para RGB
        # (garante 3 canais mesmo para imagens em escala de cinza ou RGBA)
        image = Image.open(path).convert("RGB")

        if self.transform is not None:
            image = self.transform(image)

        return image, label
