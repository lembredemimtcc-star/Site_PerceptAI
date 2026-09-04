"""
PerceptAI — Exportação e Validação ONNX
=========================================

Exporta o modelo PyTorch treinado para ONNX e valida que as saídas
são compatíveis entre PyTorch e ONNX Runtime, usando uma imagem real
do conjunto de validação.

Compatibilidade com a API C# (EmotionDetectionService.cs):
  - input_names  = ["images"]   (NamedOnnxValue.CreateFromTensor("images", ...))
  - output_names = ["logits"]
  - Formato:     NCHW (1, 3, 224, 224)
  - Saída:       8 logits (Softmax é aplicado pela API C#, não aqui)
  - opset:       12
"""

import os
from typing import List, Tuple

import numpy as np
import torch
import torch.nn as nn
import onnxruntime as ort
from PIL import Image
from torchvision import transforms

from config import (
    CLASS_NAMES,
    IMAGE_SIZE,
    IMAGENET_MEAN,
    IMAGENET_STD,
)


# ---------------------------------------------------------------------------
# Preprocessing idêntico ao da validação e à API C#
# (sem augmentation — apenas resize, tensor e normalização ImageNet)
# ---------------------------------------------------------------------------
_INFERENCE_TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


def export_to_onnx(
    model: nn.Module,
    output_path: str,
    device: torch.device,
) -> None:
    """
    Exporta o modelo PyTorch para ONNX.

    Args:
        model:       modelo PyTorch (deve estar em modo eval)
        output_path: caminho de saída do arquivo .onnx
        device:      device do modelo
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    model.eval()

    # Dummy input com shape (1, 3, 224, 224) — mesmo shape da API C#
    dummy_input = torch.zeros(1, 3, IMAGE_SIZE, IMAGE_SIZE, device=device)

    print(f"  Exportando modelo para ONNX...")
    print(f"  Input shape: {list(dummy_input.shape)}")
    print(f"  Input name:  'images'")
    print(f"  Output name: 'logits'")
    print(f"  Opset:       12")

    with torch.no_grad():
        torch.onnx.export(
            model,
            dummy_input,
            output_path,
            input_names=["images"],
            output_names=["logits"],
            opset_version=12,
            dynamic_axes={
                "images": {0: "batch_size"},
                "logits": {0: "batch_size"},
            },
            do_constant_folding=True,
        )

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  ONNX exportado: {output_path}")
    print(f"  Tamanho do arquivo: {size_mb:.1f} MB")


def validate_onnx(
    pytorch_model: nn.Module,
    onnx_path: str,
    validation_samples: List[Tuple[str, int]],
    device: torch.device,
    class_names: List[str] = CLASS_NAMES,
    tolerance: float = 1e-5,
    num_samples: int = 3,
) -> dict:
    """
    Valida o modelo ONNX comparando suas saídas com o modelo PyTorch,
    usando imagens reais do conjunto de validação.

    A mesma imagem passa pelo mesmo preprocessing nos dois modelos.

    Args:
        pytorch_model:      modelo PyTorch em modo eval
        onnx_path:          caminho do arquivo .onnx exportado
        validation_samples: lista de (caminho, label) do conjunto de validação
        device:             device do PyTorch
        class_names:        nomes das classes
        tolerance:          tolerância máxima aceitável de diferença numérica
        num_samples:        número de imagens reais a comparar (padrão: 3)

    Returns:
        dicionário com resultado da validação
    """
    print(f"\n  Carregando ONNX Runtime a partir de: {onnx_path}")
    ort_session = ort.InferenceSession(
        onnx_path,
        providers=["CPUExecutionProvider"],
    )

    pytorch_model.eval()

    # Seleciona até `num_samples` imagens reais da validação
    samples_to_test = validation_samples[:num_samples]
    if len(samples_to_test) == 0:
        return {"error": "Nenhuma imagem disponível para validação ONNX."}

    results = []
    all_compatible = True

    for i, (img_path, true_label) in enumerate(samples_to_test):
        # Carrega e pré-processa a imagem (idêntico para ambos os modelos)
        image = Image.open(img_path).convert("RGB")
        tensor = _INFERENCE_TRANSFORM(image)                       # (3, 224, 224)
        input_batch = tensor.unsqueeze(0)                          # (1, 3, 224, 224)

        # --- PyTorch ---
        with torch.no_grad():
            pt_input = input_batch.to(device)
            pt_logits = pytorch_model(pt_input).cpu().numpy()     # (1, 8)

        pt_pred_idx = int(np.argmax(pt_logits[0]))
        pt_pred_class = class_names[pt_pred_idx]

        # --- ONNX Runtime ---
        onnx_input = {"images": input_batch.numpy()}
        onnx_logits = ort_session.run(None, onnx_input)[0]        # (1, 8)

        onnx_pred_idx = int(np.argmax(onnx_logits[0]))
        onnx_pred_class = class_names[onnx_pred_idx]

        # --- Comparação numérica ---
        max_abs_diff = float(np.max(np.abs(pt_logits - onnx_logits)))
        compatible = pt_pred_class == onnx_pred_class

        if not compatible:
            all_compatible = False

        result = {
            "sample": i + 1,
            "image_path": img_path,
            "true_label": class_names[true_label],
            "pytorch_prediction": pt_pred_class,
            "onnx_prediction": onnx_pred_class,
            "max_absolute_difference": max_abs_diff,
            "numerically_close": bool(max_abs_diff < tolerance),
            "predictions_match": compatible,
        }
        results.append(result)

        # --- Log no console ---
        print(f"\n  Amostra {i + 1}: {os.path.basename(img_path)}")
        print(f"    Rótulo real:              {class_names[true_label]}")
        print(f"    PyTorch prediction:       {pt_pred_class}")
        print(f"    ONNX prediction:          {onnx_pred_class}")
        print(f"    Maximum absolute diff:    {max_abs_diff:.2e}")
        compat_str = "YES [OK]" if compatible else "NO [!!]"
        print(f"    Compatible:               {compat_str}")

    summary = {
        "onnx_path": onnx_path,
        "num_samples_tested": len(results),
        "all_predictions_match": all_compatible,
        "tolerance_used": tolerance,
        "samples": results,
    }

    print("\n" + "=" * 60)
    if all_compatible:
        print("  ONNX VALIDATION: PASSED [OK]")
        print("  Todas as predicoes PyTorch e ONNX sao compativeis.")
    else:
        print("  ONNX VALIDATION: FAILED [!!]")
        print("  ATENCAO: Predicoes divergentes entre PyTorch e ONNX!")
    print("=" * 60)

    return summary
