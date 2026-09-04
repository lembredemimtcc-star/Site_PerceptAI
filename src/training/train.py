# -*- coding: utf-8 -*-
"""
PerceptAI -- Script Principal de Treinamento
=============================================

Executa o pipeline completo:
  1. Configuracao (seed, device, diretorios)
  2. Varredura do dataset + deduplicacao (sem apagar arquivos originais)
  3. Selecao balanceada por classe
  4. Split 80/20 estratificado
  5. DataLoaders (augmentation apenas no treino)
  6. MobileNetV2 com Transfer Learning (ImageNet)
  7. Treinamento com CrossEntropyLoss + Adam
  8. Validacao por epoca
  9. Metricas finais + matriz de confusao + graficos
  10. Checkpoints (best e last)
  11. Exportacao ONNX
  12. Validacao ONNX com imagens reais
  13. Relatorio JSON final

Para alterar o treinamento, modifique APENAS config.py:
  IMAGES_PER_CLASS = 150   ->  1000
  EPOCHS = 2               ->  150

Uso:
  Executar a partir da raiz do projeto (Site_PerceptAI/):
      python src/training/train.py
"""

import io
import os
import sys
import time
from typing import Dict, List, Tuple

# ---------------------------------------------------------------------------
# Forca stdout/stderr a usar UTF-8 no Windows (evita UnicodeEncodeError
# com caracteres acentuados no terminal cp1252).
# ---------------------------------------------------------------------------
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
# Adiciona o diretorio training/ ao sys.path para que os imports relativos
# funcionem independente do diretorio de trabalho atual.
# ---------------------------------------------------------------------------
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

import random
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import transforms
from sklearn.model_selection import train_test_split

# Modulos do projeto
import config as cfg
from deduplication import scan_dataset, deduplicate_dataset, print_deduplication_report
from dataset import FacialExpressionDataset
from model import build_model, count_parameters
from metrics import compute_metrics, print_metrics, plot_confusion_matrix, plot_training_curves
from export_onnx import export_to_onnx, validate_onnx
from utils import set_seed, get_device, setup_output_dirs, save_json_report, format_time


# ===========================================================================
# TRANSFORMS
# ===========================================================================

def get_train_transform() -> transforms.Compose:
    """
    Augmentation aplicado SOMENTE no conjunto de treino.
    Seguindo a documentacao do TCC:
      - Rotacao +/-15 graus
      - Espelhamento horizontal
      - Variacao de brilho e contraste
      - Resize 224x224
      - Normalizacao ImageNet
    """
    return transforms.Compose([
        transforms.Resize((cfg.IMAGE_SIZE, cfg.IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3),
        transforms.ToTensor(),
        transforms.Normalize(mean=cfg.IMAGENET_MEAN, std=cfg.IMAGENET_STD),
    ])


def get_val_transform() -> transforms.Compose:
    """
    Preprocessing para validacao e inferencia -- SEM augmentation.
    Identico ao pipeline da API C# (ImagePreprocessingService.cs).
    """
    return transforms.Compose([
        transforms.Resize((cfg.IMAGE_SIZE, cfg.IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=cfg.IMAGENET_MEAN, std=cfg.IMAGENET_STD),
    ])


# ===========================================================================
# SELECAO BALANCEADA
# ===========================================================================

def select_images_per_class(
    unique_paths_by_class: Dict[str, List[str]],
    images_per_class: int,
    seed: int,
) -> Tuple[Dict[str, List[str]], List[str]]:
    """
    Embaralha e seleciona ate `images_per_class` imagens por classe.

    Se uma classe tiver menos imagens unicas disponiveis, usa todas
    e emite aviso. NAO faz oversampling nem duplicacao.

    Returns:
        (selected_by_class, warnings)
    """
    rng = random.Random(seed)
    selected_by_class: Dict[str, List[str]] = {}
    warnings: List[str] = []

    for class_name in cfg.CLASS_NAMES:
        paths = unique_paths_by_class.get(class_name, [])
        available = len(paths)

        # Embaralha de forma reprodutivel
        shuffled = list(paths)
        rng.shuffle(shuffled)

        if available < images_per_class:
            warnings.append(
                f"AVISO: Classe '{class_name}' possui apenas {available} imagens "
                f"unicas disponiveis (solicitadas: {images_per_class}). "
                f"Usando as {available} disponiveis."
            )
            selected = shuffled
        else:
            selected = shuffled[:images_per_class]

        selected_by_class[class_name] = selected

    return selected_by_class, warnings


# ===========================================================================
# SPLIT ESTRATIFICADO
# ===========================================================================

def build_split(
    selected_by_class: Dict[str, List[str]],
    train_ratio: float,
    seed: int,
) -> Tuple[List[Tuple[str, int]], List[Tuple[str, int]]]:
    """
    Cria o split estratificado 80/20 sem data leakage.

    A deduplicacao ja ocorreu antes desta etapa, entao nenhuma imagem
    duplicada pode aparecer nos dois conjuntos.

    Returns:
        (train_samples, val_samples) -- listas de (path, label_int)
    """
    all_paths: List[str] = []
    all_labels: List[int] = []

    for class_name in cfg.CLASS_NAMES:
        label = cfg.CLASS_NAMES.index(class_name)
        for path in selected_by_class[class_name]:
            all_paths.append(path)
            all_labels.append(label)

    train_paths, val_paths, train_labels, val_labels = train_test_split(
        all_paths,
        all_labels,
        test_size=1.0 - train_ratio,
        random_state=seed,
        stratify=all_labels,
    )

    train_samples = list(zip(train_paths, train_labels))
    val_samples   = list(zip(val_paths,   val_labels))

    return train_samples, val_samples


# ===========================================================================
# LOOP DE TREINAMENTO
# ===========================================================================

def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> Tuple[float, float]:
    """
    Executa uma epoca de treinamento.

    Returns:
        (avg_loss, accuracy)
    """
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)           # (B, 8) logits
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)

    avg_loss = total_loss / total if total > 0 else 0.0
    accuracy = correct / total if total > 0 else 0.0
    return avg_loss, accuracy


def evaluate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, float, List[int], List[int]]:
    """
    Avalia o modelo no conjunto de validacao.

    Returns:
        (avg_loss, accuracy, y_true, y_pred)
    """
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0
    y_true: List[int] = []
    y_pred: List[int] = []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            total_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)

            y_true.extend(labels.cpu().tolist())
            y_pred.extend(predicted.cpu().tolist())

    avg_loss = total_loss / total if total > 0 else 0.0
    accuracy = correct / total if total > 0 else 0.0
    return avg_loss, accuracy, y_true, y_pred


# ===========================================================================
# MAIN
# ===========================================================================

def main():
    start_time = time.time()

    # -----------------------------------------------------------------------
    # 1. CONFIGURACAO
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  PerceptAI - Treinamento do Modelo de IA")
    print("=" * 60)
    print(f"\n  Configuracao:")
    print(f"    IMAGES_PER_CLASS : {cfg.IMAGES_PER_CLASS}")
    print(f"    EPOCHS           : {cfg.EPOCHS}")
    print(f"    BATCH_SIZE       : {cfg.BATCH_SIZE}")
    print(f"    LEARNING_RATE    : {cfg.LEARNING_RATE}")
    print(f"    SEED             : {cfg.SEED}")
    print(f"    IMAGE_SIZE       : {cfg.IMAGE_SIZE}x{cfg.IMAGE_SIZE}")
    print(f"    TRAIN_RATIO      : {cfg.TRAIN_RATIO}")
    print(f"    NUM_CLASSES      : {cfg.NUM_CLASSES}")
    print(f"    Modelo           : MobileNetV2 (ImageNet)")
    print(f"    Optimizer        : Adam")
    print(f"    Loss             : CrossEntropyLoss")

    set_seed(cfg.SEED)
    device = get_device()

    setup_output_dirs(
        cfg.CHECKPOINTS_DIR,
        cfg.METRICS_DIR,
        cfg.PLOTS_DIR,
        cfg.ONNX_DIR,
    )

    # -----------------------------------------------------------------------
    # 2. VALIDACAO DO DIRETORIO DE DATASETS
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Dataset")
    print("=" * 60)

    if not os.path.isdir(cfg.DATASETS_DIR):
        print(f"\n  [ERRO] Diretorio de datasets nao encontrado:")
        print(f"         {cfg.DATASETS_DIR}")
        print(f"\n  Certifique-se de que a estrutura esta correta:")
        print(f"    Site_PerceptAI/src/datasets/")
        sys.exit(1)

    print(f"\n  Datasets localizados em: {cfg.DATASETS_DIR}")

    # -----------------------------------------------------------------------
    # 3. VARREDURA DO DATASET
    # -----------------------------------------------------------------------
    print("\n  Varrendo imagens...")
    raw_class_paths, scan_warnings = scan_dataset(
        datasets_dir=cfg.DATASETS_DIR,
        folder_to_class=cfg.FOLDER_TO_CLASS,
        class_names=cfg.CLASS_NAMES,
    )

    if scan_warnings:
        print("\n  [AVISOS da varredura]:")
        for w in scan_warnings:
            print(f"    [!] {w}")

    print("\n  Imagens encontradas (antes da deduplicacao):")
    print(f"  {'Classe':<12} {'Pasta':<15} {'Imagens':>10}")
    print("  " + "-" * 40)

    # Mapeamento reverso para mostrar nome da pasta
    class_to_folder = {v: k for k, v in cfg.FOLDER_TO_CLASS.items()}
    for class_name in cfg.CLASS_NAMES:
        folder = class_to_folder.get(class_name, "?")
        count = len(raw_class_paths.get(class_name, []))
        print(f"  {class_name:<12} ({folder:<12}) {count:>10}")

    total_raw = sum(len(v) for v in raw_class_paths.values())
    print(f"\n  Total encontrado: {total_raw} imagens")

    # -----------------------------------------------------------------------
    # 4. DEDUPLICACAO
    # -----------------------------------------------------------------------
    print("\n  Verificando duplicatas (hash MD5)...")
    unique_class_paths, dup_report = deduplicate_dataset(raw_class_paths)
    print_deduplication_report(dup_report)

    # -----------------------------------------------------------------------
    # 5. SELECAO BALANCEADA
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Selecao de Imagens")
    print("=" * 60)

    selected_by_class, selection_warnings = select_images_per_class(
        unique_paths_by_class=unique_class_paths,
        images_per_class=cfg.IMAGES_PER_CLASS,
        seed=cfg.SEED,
    )

    if selection_warnings:
        print("\n  [AVISOS da selecao]:")
        for w in selection_warnings:
            print(f"    [!] {w}")

    print(f"\n  Dataset final (apos deduplicacao e selecao):")
    print(f"  {'Classe':<12} {'Selecionadas':>14}")
    print("  " + "-" * 28)
    total_selected = 0
    for class_name in cfg.CLASS_NAMES:
        count = len(selected_by_class[class_name])
        total_selected += count
        print(f"  {class_name:<12} {count:>14}")
    print("  " + "-" * 28)
    print(f"  {'TOTAL':<12} {total_selected:>14}")

    if total_selected == 0:
        print("\n  [ERRO] Nenhuma imagem disponivel para treinamento.")
        sys.exit(1)

    # -----------------------------------------------------------------------
    # 6. SPLIT ESTRATIFICADO 80/20
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Split Treino / Validacao")
    print("=" * 60)

    train_samples, val_samples = build_split(
        selected_by_class=selected_by_class,
        train_ratio=cfg.TRAIN_RATIO,
        seed=cfg.SEED,
    )

    print(f"\n  Total selecionado : {total_selected}")
    print(f"  Treino (80%)      : {len(train_samples)}")
    print(f"  Validacao (20%)   : {len(val_samples)}")

    # Contagem por classe no split
    print(f"\n  {'Classe':<12} {'Treino':>8} {'Validacao':>10}")
    print("  " + "-" * 32)
    for class_name in cfg.CLASS_NAMES:
        label = cfg.CLASS_NAMES.index(class_name)
        tr_count = sum(1 for _, l in train_samples if l == label)
        vl_count = sum(1 for _, l in val_samples   if l == label)
        print(f"  {class_name:<12} {tr_count:>8} {vl_count:>10}")

    # -----------------------------------------------------------------------
    # 7. DATALOADERS
    # -----------------------------------------------------------------------
    train_dataset = FacialExpressionDataset(
        samples=train_samples,
        transform=get_train_transform(),
        class_names=cfg.CLASS_NAMES,
    )
    val_dataset = FacialExpressionDataset(
        samples=val_samples,
        transform=get_val_transform(),
        class_names=cfg.CLASS_NAMES,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=True,
        num_workers=0,         # compativel com Windows sem spawn issues
        pin_memory=device.type == "cuda",
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=device.type == "cuda",
    )

    print(f"\n  Batches de treino   : {len(train_loader)}")
    print(f"  Batches de validacao: {len(val_loader)}")

    # -----------------------------------------------------------------------
    # 8. MODELO
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Modelo")
    print("=" * 60)

    model = build_model(num_classes=cfg.NUM_CLASSES)
    model = model.to(device)

    params = count_parameters(model)
    print(f"\n  Arquitetura       : MobileNetV2")
    print(f"  Pre-treinado      : ImageNet")
    print(f"  Transfer Learning : Sim")
    print(f"  Classes (saida)   : {cfg.NUM_CLASSES}")
    print(f"  Parametros totais      : {params['total']:,}")
    print(f"  Parametros treinaveis  : {params['trainable']:,}")

    # -----------------------------------------------------------------------
    # 9. LOSS E OTIMIZADOR
    # -----------------------------------------------------------------------
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=cfg.LEARNING_RATE)

    # -----------------------------------------------------------------------
    # 10. TREINAMENTO
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Treinamento")
    print("=" * 60)

    history = {
        "train_loss": [],
        "val_loss":   [],
        "train_acc":  [],
        "val_acc":    [],
    }

    best_val_acc = 0.0
    best_epoch   = 0

    for epoch in range(1, cfg.EPOCHS + 1):
        epoch_start = time.time()

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device
        )
        val_loss, val_acc, _, _ = evaluate(
            model, val_loader, criterion, device
        )

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)

        elapsed = time.time() - epoch_start

        print(
            f"\n  Epoch {epoch:>3}/{cfg.EPOCHS}"
            f"  | Train Loss: {train_loss:.4f}  Train Acc: {train_acc*100:.2f}%"
            f"  | Val Loss: {val_loss:.4f}  Val Acc: {val_acc*100:.2f}%"
            f"  [{format_time(elapsed)}]"
        )

        # Salva best model (criterio: val_acc)
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch   = epoch
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_acc": val_acc,
                    "val_loss": val_loss,
                    "config": {
                        "images_per_class": cfg.IMAGES_PER_CLASS,
                        "epochs": cfg.EPOCHS,
                        "batch_size": cfg.BATCH_SIZE,
                        "learning_rate": cfg.LEARNING_RATE,
                        "seed": cfg.SEED,
                        "image_size": cfg.IMAGE_SIZE,
                        "num_classes": cfg.NUM_CLASSES,
                        "class_names": cfg.CLASS_NAMES,
                        "imagenet_mean": cfg.IMAGENET_MEAN,
                        "imagenet_std": cfg.IMAGENET_STD,
                    },
                },
                cfg.BEST_MODEL_PATH,
            )
            print(f"  [OK] Melhor modelo salvo (val_acc={val_acc*100:.2f}%)")

    # Salva last model
    torch.save(
        {
            "epoch": cfg.EPOCHS,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "val_acc": history["val_acc"][-1],
            "val_loss": history["val_loss"][-1],
            "config": {
                "images_per_class": cfg.IMAGES_PER_CLASS,
                "epochs": cfg.EPOCHS,
                "batch_size": cfg.BATCH_SIZE,
                "learning_rate": cfg.LEARNING_RATE,
                "seed": cfg.SEED,
                "image_size": cfg.IMAGE_SIZE,
                "num_classes": cfg.NUM_CLASSES,
                "class_names": cfg.CLASS_NAMES,
                "imagenet_mean": cfg.IMAGENET_MEAN,
                "imagenet_std": cfg.IMAGENET_STD,
            },
        },
        cfg.LAST_MODEL_PATH,
    )
    print(f"\n  Ultimo modelo salvo  : {cfg.LAST_MODEL_PATH}")
    print(f"  Melhor modelo        : {cfg.BEST_MODEL_PATH}")
    print(f"  Melhor Val Acc       : {best_val_acc*100:.2f}% (epoca {best_epoch})")

    # -----------------------------------------------------------------------
    # 11. METRICAS FINAIS (no melhor modelo)
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Metricas Finais (Melhor Modelo)")
    print("=" * 60)

    # Carrega o melhor modelo para calcular as metricas finais
    best_checkpoint = torch.load(cfg.BEST_MODEL_PATH, map_location=device)
    model.load_state_dict(best_checkpoint["model_state_dict"])

    _, _, y_true_all, y_pred_all = evaluate(
        model, val_loader, criterion, device
    )

    final_metrics = compute_metrics(y_true_all, y_pred_all, cfg.CLASS_NAMES)
    print_metrics(final_metrics, cfg.CLASS_NAMES)

    # -----------------------------------------------------------------------
    # 12. MATRIZ DE CONFUSAO E GRAFICOS
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Visualizacoes")
    print("=" * 60)

    cm_path = os.path.join(cfg.PLOTS_DIR, "confusion_matrix.png")
    plot_confusion_matrix(y_true_all, y_pred_all, cfg.CLASS_NAMES, cm_path)
    plot_training_curves(history, cfg.PLOTS_DIR)

    # -----------------------------------------------------------------------
    # 13. EXPORTACAO ONNX
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Exportacao ONNX")
    print("=" * 60)

    model.eval()
    export_to_onnx(model, cfg.ONNX_MODEL_PATH, device)

    # -----------------------------------------------------------------------
    # 14. VALIDACAO ONNX (com imagens reais da validacao)
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Validacao ONNX vs PyTorch")
    print("=" * 60)

    onnx_validation = validate_onnx(
        pytorch_model=model,
        onnx_path=cfg.ONNX_MODEL_PATH,
        validation_samples=val_samples,
        device=device,
        class_names=cfg.CLASS_NAMES,
        tolerance=1e-5,
        num_samples=3,
    )

    # -----------------------------------------------------------------------
    # 15. RELATORIO JSON
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  Relatorio JSON")
    print("=" * 60)

    total_duration = time.time() - start_time

    # Dataset statistics
    dataset_stats = {}
    for class_name in cfg.CLASS_NAMES:
        folder = class_to_folder.get(class_name, "?")
        label = cfg.CLASS_NAMES.index(class_name)
        dataset_stats[class_name] = {
            "folder":             folder,
            "raw_count":          dup_report.total_found.get(class_name, 0),
            "unique_count":       dup_report.total_unique.get(class_name, 0),
            "duplicates_removed": dup_report.total_duplicates.get(class_name, 0),
            "selected":           len(selected_by_class.get(class_name, [])),
            "train_count":        sum(1 for _, l in train_samples if l == label),
            "val_count":          sum(1 for _, l in val_samples   if l == label),
        }

    report = {
        # Configuracao
        "images_per_class": cfg.IMAGES_PER_CLASS,
        "epochs":           cfg.EPOCHS,
        "image_size":       cfg.IMAGE_SIZE,
        "batch_size":       cfg.BATCH_SIZE,
        "learning_rate":    cfg.LEARNING_RATE,
        "seed":             cfg.SEED,
        "train_ratio":      cfg.TRAIN_RATIO,
        "num_classes":      cfg.NUM_CLASSES,
        "class_names":      cfg.CLASS_NAMES,
        "class_mapping":    cfg.FOLDER_TO_CLASS,

        # Preprocessing (para referencia da API C#)
        "preprocessing": {
            "image_size":         f"{cfg.IMAGE_SIZE}x{cfg.IMAGE_SIZE}",
            "channels":           "RGB",
            "normalization":      "ImageNet",
            "mean":               cfg.IMAGENET_MEAN,
            "std":                cfg.IMAGENET_STD,
            "tensor_format":      "NCHW",
            "augmentation_train": [
                "RandomHorizontalFlip",
                "RandomRotation(15)",
                "ColorJitter(brightness=0.3, contrast=0.3)",
            ],
            "augmentation_val":   "None",
        },

        # Modelo
        "model": {
            "architecture":          "MobileNetV2",
            "pretrained":            "ImageNet",
            "transfer_learning":     True,
            "num_outputs":           cfg.NUM_CLASSES,
            "parameters_total":      params["total"],
            "parameters_trainable":  params["trainable"],
        },

        # Treinamento
        "training": {
            "optimizer":                "Adam",
            "loss_function":            "CrossEntropyLoss",
            "device":                   str(device),
            "total_duration_seconds":   round(total_duration, 2),
            "total_duration_formatted": format_time(total_duration),
            "best_epoch":               best_epoch,
            "best_val_acc":             round(best_val_acc * 100, 4),
        },

        # Dataset
        "dataset_statistics": dataset_stats,

        # Deduplicacao
        "duplicate_statistics": {
            "total_found":      dup_report.grand_total_found,
            "total_duplicates": dup_report.grand_total_duplicates,
            "total_unique":     dup_report.grand_total_unique,
            "duplicate_groups": len(dup_report.duplicate_groups),
        },

        # Split
        "split": {
            "total_selected": total_selected,
            "train_count":    len(train_samples),
            "val_count":      len(val_samples),
        },

        # Historico por epoca
        "epoch_history": {
            "train_loss": [round(v, 6) for v in history["train_loss"]],
            "val_loss":   [round(v, 6) for v in history["val_loss"]],
            "train_acc":  [round(v * 100, 4) for v in history["train_acc"]],
            "val_acc":    [round(v * 100, 4) for v in history["val_acc"]],
        },

        # Metricas de validacao
        "validation_metrics": {
            "accuracy":        round(final_metrics["accuracy"] * 100, 4),
            "macro_precision": round(final_metrics["macro_precision"] * 100, 4),
            "macro_recall":    round(final_metrics["macro_recall"] * 100, 4),
            "macro_f1":        round(final_metrics["macro_f1"] * 100, 4),
            "per_class": {
                name: {
                    "precision": round(m["precision"] * 100, 4),
                    "recall":    round(m["recall"]    * 100, 4),
                    "f1":        round(m["f1"]        * 100, 4),
                    "count":     m["count"],
                }
                for name, m in final_metrics["per_class"].items()
            },
        },

        # Caminhos dos outputs
        "outputs": {
            "best_model":        cfg.BEST_MODEL_PATH,
            "last_model":        cfg.LAST_MODEL_PATH,
            "onnx_model":        cfg.ONNX_MODEL_PATH,
            "confusion_matrix":  cm_path,
            "plots_dir":         cfg.PLOTS_DIR,
            "report":            cfg.REPORT_PATH,
        },

        # Validacao ONNX
        "onnx_validation": onnx_validation,
    }

    save_json_report(report, cfg.REPORT_PATH)

    # -----------------------------------------------------------------------
    # 16. SUMARIO FINAL
    # -----------------------------------------------------------------------
    onnx_ok = onnx_validation.get("all_predictions_match", False)

    print("\n" + "=" * 60)
    print("  SUMARIO FINAL")
    print("=" * 60)
    print(f"\n  Duracao total          : {format_time(total_duration)}")
    print(f"  Dataset total          : {total_selected} imagens")
    print(f"  Treino                 : {len(train_samples)} imagens")
    print(f"  Validacao              : {len(val_samples)} imagens")
    print(f"  Duplicatas removidas   : {dup_report.grand_total_duplicates}")
    print(f"  Melhor epoca           : {best_epoch}")
    print(f"  Melhor Val Acc         : {best_val_acc*100:.2f}%")
    print(f"\n  Metricas finais (conjunto de validacao):")
    print(f"    Accuracy             : {final_metrics['accuracy']*100:.2f}%")
    print(f"    Macro Precision      : {final_metrics['macro_precision']*100:.2f}%")
    print(f"    Macro Recall         : {final_metrics['macro_recall']*100:.2f}%")
    print(f"    Macro F1             : {final_metrics['macro_f1']*100:.2f}%")
    print(f"\n  Arquivos gerados:")
    print(f"    Best model           : {cfg.BEST_MODEL_PATH}")
    print(f"    Last model           : {cfg.LAST_MODEL_PATH}")
    print(f"    ONNX                 : {cfg.ONNX_MODEL_PATH}")
    print(f"    Confusion matrix     : {cm_path}")
    print(f"    Loss curve           : {os.path.join(cfg.PLOTS_DIR, 'loss_curve.png')}")
    print(f"    Accuracy curve       : {os.path.join(cfg.PLOTS_DIR, 'accuracy_curve.png')}")
    print(f"    Report JSON          : {cfg.REPORT_PATH}")
    print(f"\n  ONNX Validation        : {'PASSED [OK]' if onnx_ok else 'FAILED [!!]'}")

    print("\n" + "=" * 60)
    print("  Pipeline concluido com sucesso.")
    print("=" * 60 + "\n")

    # -----------------------------------------------------------------------
    # CHECKLIST FINAL
    # -----------------------------------------------------------------------
    print("  CHECKLIST:")
    print(f"  [OK] Dataset localizado em src/datasets")
    print(f"  [OK] Classes identificadas: {cfg.NUM_CLASSES} classes")
    print(f"  [OK] Deduplicacao: {dup_report.grand_total_duplicates} duplicatas removidas da lista")
    print(f"  [OK] Arquivos originais preservados (nenhum deletado)")
    print(f"  [OK] Maximo de {cfg.IMAGES_PER_CLASS} imagens por classe")
    print(f"  [OK] Total: {total_selected} imagens")
    print(f"  [OK] Split 80/20 reproduzivel (seed={cfg.SEED})")
    print(f"  [OK] RGB + 224x224 + ImageNet normalization")
    print(f"  [OK] Augmentation apenas no treino")
    print(f"  [OK] MobileNetV2 + ImageNet + Transfer Learning")
    print(f"  [OK] CrossEntropyLoss + Adam (lr={cfg.LEARNING_RATE})")
    print(f"  [OK] {cfg.EPOCHS} epocas concluidas")
    print(f"  [OK] Metricas calculadas")
    print(f"  [OK] Matriz de confusao gerada")
    print(f"  [OK] Graficos gerados")
    print(f"  [OK] best_model.pth salvo")
    print(f"  [OK] last_model.pth salvo")
    print(f"  [OK] ONNX exportado")
    status_onnx = "PASSED" if onnx_ok else "FAILED [!!]"
    print(f"  [{'OK' if onnx_ok else '!!'}] ONNX validado vs PyTorch: {status_onnx}")
    print(f"  [OK] training_report.json salvo")
    print()


if __name__ == "__main__":
    main()
