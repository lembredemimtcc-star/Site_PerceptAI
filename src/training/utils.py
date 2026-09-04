"""
PerceptAI — Utilitários Gerais
================================

Funções de apoio: seeds, device, diretórios de output, relatório JSON.
"""

import json
import os
import random
from typing import Dict

import numpy as np
import torch


def set_seed(seed: int) -> None:
    """
    Configura seeds em Python, NumPy, PyTorch e CUDA para reprodutibilidade.

    Args:
        seed: valor da seed (ex: 42)
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)  # para multi-GPU, se houver
    # Garante determinismo nas operações CUDA (pode reduzir performance levemente)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def get_device() -> torch.device:
    """
    Retorna o device disponível (CUDA ou CPU) e exibe no console.

    Returns:
        torch.device("cuda") ou torch.device("cpu")
    """
    if torch.cuda.is_available():
        device = torch.device("cuda")
        gpu_name = torch.cuda.get_device_name(0)
        print(f"  Device: CUDA ({gpu_name})")
    else:
        device = torch.device("cpu")
        print("  Device: CPU")
    return device


def setup_output_dirs(*dirs: str) -> None:
    """
    Cria os diretórios de output caso não existam.

    Args:
        *dirs: caminhos dos diretórios a criar
    """
    for d in dirs:
        os.makedirs(d, exist_ok=True)


def save_json_report(report: Dict, path: str) -> None:
    """
    Serializa e salva o relatório de treinamento em JSON.

    Args:
        report: dicionário com dados do treinamento
        path:   caminho completo do arquivo .json
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)

    def _convert(obj):
        """Converte tipos NumPy/PyTorch para Python nativo."""
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        raise TypeError(f"Tipo não serializável: {type(obj)}")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2, default=_convert)

    print(f"  Relatório JSON salvo em: {path}")


def format_time(seconds: float) -> str:
    """Formata duração em segundos para string legível."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    secs = seconds % 60
    if minutes < 60:
        return f"{minutes}m {secs:.0f}s"
    hours = int(minutes // 60)
    minutes = minutes % 60
    return f"{hours}h {minutes}m {secs:.0f}s"
