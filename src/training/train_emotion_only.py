# -*- coding: utf-8 -*-
"""
Script Rápido para Treinar Apenas o Modelo Emocional
====================================================

Use este script se já tiver o modelo fisiológico e só precisar
do modelo emocional (perceptai_emotion.onnx).
"""

import io
import os
import sys
import time
from typing import Dict, List, Tuple

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

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

import config_dual_state as cfg
from deduplication import scan_dataset, deduplicate_dataset, print_deduplication_report
from dataset import FacialExpressionDataset
from model_dual_state import build_model, count_parameters, load_checkpoint
from metrics import compute_metrics, print_metrics, plot_confusion_matrix, plot_training_curves
from export_onnx import export_to_onnx, validate_onnx
from utils import set_seed, get_device, setup_output_dirs, save_json_report, format_time
from transforms_custom import GaussianNoise


class EarlyStopping:
    def __init__(self, patience: int = 10, min_delta: float = 0.001):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False

    def __call__(self, val_loss: float) -> bool:
        if self.patience <= 0:
            return False

        if self.best_loss is None:
            self.best_loss = val_loss
            return False

        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
                return True

        return False


def get_train_transform() -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((cfg.IMAGE_SIZE, cfg.IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
        transforms.RandomApply([transforms.GaussianBlur(kernel_size=3)], p=0.2),
        transforms.ToTensor(),
        transforms.RandomApply([GaussianNoise(mean=0.0, std=0.1)], p=0.1),
        transforms.Normalize(mean=cfg.IMAGENET_MEAN, std=cfg.IMAGENET_STD),
    ])


def get_val_transform() -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((cfg.IMAGE_SIZE, cfg.IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=cfg.IMAGENET_MEAN, std=cfg.IMAGENET_STD),
    ])


def select_images_per_class(
    unique_paths_by_class: Dict[str, List[str]],
    images_per_class: int,
    seed: int,
) -> Tuple[Dict[str, List[str]], List[str]]:
    rng = random.Random(seed)
    selected_by_class: Dict[str, List[str]] = {}
    warnings: List[str] = []

    for class_name in unique_paths_by_class.keys():
        paths = unique_paths_by_class.get(class_name, [])
        available = len(paths)

        shuffled = list(paths)
        rng.shuffle(shuffled)

        if available < images_per_class:
            warnings.append(
                f"AVISO: Classe '{class_name}' possui apenas {available} imagens "
                f"(solicitadas: {images_per_class}). Usando as {available} disponiveis."
            )
            selected = shuffled
        else:
            selected = shuffled[:images_per_class]

        selected_by_class[class_name] = selected

    return selected_by_class, warnings


def build_split(
    selected_by_class: Dict[str, List[str]],
    train_ratio: float,
    seed: int,
) -> Tuple[List[Tuple[str, int]], List[Tuple[str, int]]]:
    all_paths: List[str] = []
    all_labels: List[int] = []

    for class_name, paths in selected_by_class.items():
        label = list(selected_by_class.keys()).index(class_name)
        for path in paths:
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


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> Tuple[float, float]:
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
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


def main():
    start_time = time.time()

    print("\n" + "=" * 80)
    print("  Treinando Apenas Modelo Emocional")
    print("=" * 80)
    print(f"\n  Configuracao:")
    print(f"    IMAGES_PER_CLASS : {cfg.IMAGES_PER_CLASS}")
    print(f"    EPOCHS           : {cfg.EPOCHS}")
    print(f"    BATCH_SIZE       : {cfg.BATCH_SIZE}")
    print(f"    LEARNING_RATE    : {cfg.LEARNING_RATE}")
    print(f"    WEIGHT_DECAY     : {cfg.WEIGHT_DECAY}")
    print(f"    DROPOUT_RATE     : {cfg.DROPOUT_RATE}")
    print(f"    EARLY_STOPPING   : {cfg.EARLY_STOPPING_PATIENCE} épocas")
    print(f"    SEED             : {cfg.SEED}")

    set_seed(cfg.SEED)
    device = get_device()

    setup_output_dirs(
        cfg.EMOTION_CHECKPOINTS_DIR,
        cfg.EMOTION_METRICS_DIR,
        cfg.EMOTION_PLOTS_DIR,
        cfg.EMOTION_ONNX_DIR,
    )

    if not os.path.isdir(cfg.DATASETS_DIR):
        print(f"\n  [ERRO] Diretorio de datasets nao encontrado: {cfg.DATASETS_DIR}")
        sys.exit(1)

    print(f"\n  Varrendo imagens para emotion...")
    raw_class_paths, scan_warnings = scan_dataset(
        datasets_dir=cfg.DATASETS_DIR,
        folder_to_class=cfg.EMOTION_FOLDER_TO_CLASS,
        class_names=cfg.EMOTION_CLASSES,
    )

    if scan_warnings:
        print("\n  [AVISOS da varredura]:")
        for w in scan_warnings:
            print(f"    [!] {w}")

    print("\n  Imagens encontradas (antes da deduplicacao):")
    for class_name in cfg.EMOTION_CLASSES:
        count = len(raw_class_paths.get(class_name, []))
        print(f"    {class_name}: {count}")

    print("\n  Verificando duplicatas...")
    unique_class_paths, dup_report = deduplicate_dataset(raw_class_paths)
    print_deduplication_report(dup_report)

    print("\n  Selecionando imagens por classe...")
    selected_by_class, selection_warnings = select_images_per_class(
        unique_paths_by_class=unique_class_paths,
        images_per_class=cfg.IMAGES_PER_CLASS,
        seed=cfg.SEED,
    )

    if selection_warnings:
        print("\n  [AVISOS da selecao]:")
        for w in selection_warnings:
            print(f"    [!] {w}")

    total_selected = sum(len(v) for v in selected_by_class.values())
    print(f"\n  Total selecionado: {total_selected}")

    if total_selected == 0:
        print("\n  [ERRO] Nenhuma imagem disponivel para treinamento.")
        sys.exit(1)

    train_samples, val_samples = build_split(
        selected_by_class=selected_by_class,
        train_ratio=cfg.TRAIN_RATIO,
        seed=cfg.SEED,
    )

    print(f"  Treino: {len(train_samples)} | Validacao: {len(val_samples)}")

    train_dataset = FacialExpressionDataset(
        samples=train_samples,
        transform=get_train_transform(),
        class_names=cfg.EMOTION_CLASSES,
    )
    val_dataset = FacialExpressionDataset(
        samples=val_samples,
        transform=get_val_transform(),
        class_names=cfg.EMOTION_CLASSES,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=True,
        num_workers=0,
        pin_memory=device.type == "cuda",
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=device.type == "cuda",
    )

    model = build_model(num_classes=len(cfg.EMOTION_CLASSES), dropout_rate=cfg.DROPOUT_RATE)
    model = model.to(device)

    params = count_parameters(model)
    print(f"\n  Parametros totais: {params['total']:,}")
    print(f"  Parametros treinaveis: {params['trainable']:,}")

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=cfg.LEARNING_RATE,
        weight_decay=cfg.WEIGHT_DECAY
    )

    early_stopping = EarlyStopping(
        patience=cfg.EARLY_STOPPING_PATIENCE,
        min_delta=cfg.EARLY_STOPPING_MIN_DELTA
    )

    history = {
        "train_loss": [],
        "val_loss":   [],
        "train_acc":  [],
        "val_acc":    [],
    }

    best_val_acc = 0.0
    best_epoch   = 0

    print("\n" + "=" * 80)
    print("  TREINAMENTO")
    print("=" * 80)

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

        if early_stopping(val_loss):
            print(f"\n  [EARLY STOPPING] Interrompendo treinamento na epoca {epoch}")
            print(f"  Melhor val_loss: {early_stopping.best_loss:.4f}")
            break

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
                        "model_name": "emotion",
                        "num_classes": len(cfg.EMOTION_CLASSES),
                        "class_names": cfg.EMOTION_CLASSES,
                        "images_per_class": cfg.IMAGES_PER_CLASS,
                        "epochs": cfg.EPOCHS,
                        "batch_size": cfg.BATCH_SIZE,
                        "learning_rate": cfg.LEARNING_RATE,
                        "weight_decay": cfg.WEIGHT_DECAY,
                        "dropout_rate": cfg.DROPOUT_RATE,
                        "seed": cfg.SEED,
                        "image_size": cfg.IMAGE_SIZE,
                        "imagenet_mean": cfg.IMAGENET_MEAN,
                        "imagenet_std": cfg.IMAGENET_STD,
                    },
                },
                cfg.EMOTION_BEST_MODEL_PATH,
            )
            print(f"  [OK] Melhor modelo salvo (val_acc={val_acc*100:.2f}%)")

    torch.save(
        {
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "val_acc": history["val_acc"][-1],
            "val_loss": history["val_loss"][-1],
            "config": {
                "model_name": "emotion",
                "num_classes": len(cfg.EMOTION_CLASSES),
                "class_names": cfg.EMOTION_CLASSES,
            },
        },
        cfg.EMOTION_LAST_MODEL_PATH,
    )

    print(f"\n  Melhor modelo: {cfg.EMOTION_BEST_MODEL_PATH}")
    print(f"  Melhor Val Acc: {best_val_acc*100:.2f}% (epoca {best_epoch})")

    print("\n" + "=" * 80)
    print("  AVALIAÇÃO FINAL (Melhor Modelo)")
    print("=" * 80)

    checkpoint = load_checkpoint(model, cfg.EMOTION_BEST_MODEL_PATH, device)
    model.eval()

    val_loss, val_acc, y_true, y_pred = evaluate(
        model, val_loader, criterion, device
    )

    print(f"\n  Val Loss: {val_loss:.4f}")
    print(f"  Val Acc:  {val_acc*100:.2f}%")

    metrics = compute_metrics(y_true, y_pred, cfg.EMOTION_CLASSES)
    print_metrics(metrics, cfg.EMOTION_CLASSES)

    plot_confusion_matrix(
        y_true, y_pred, cfg.EMOTION_CLASSES,
        save_path=os.path.join(cfg.EMOTION_PLOTS_DIR, "confusion_matrix_emotion.png")
    )

    plot_training_curves(
        history["train_loss"], history["val_loss"],
        history["train_acc"], history["val_acc"],
        save_path=os.path.join(cfg.EMOTION_PLOTS_DIR, "training_curves_emotion.png")
    )

    print("\n" + "=" * 80)
    print("  EXPORTAÇÃO ONNX")
    print("=" * 80)

    export_to_onnx(model, cfg.EMOTION_ONNX_MODEL_PATH, device)

    validate_onnx(
        pytorch_model=model,
        onnx_path=cfg.EMOTION_ONNX_MODEL_PATH,
        validation_samples=val_samples,
        device=device,
        class_names=cfg.EMOTION_CLASSES,
        num_samples=3,
    )

    report = {
        "model_name": "emotion",
        "num_classes": len(cfg.EMOTION_CLASSES),
        "class_names": cfg.EMOTION_CLASSES,
        "images_per_class": cfg.IMAGES_PER_CLASS,
        "epochs_trained": epoch,
        "best_epoch": best_epoch,
        "train_samples": len(train_samples),
        "val_samples": len(val_samples),
        "best_val_acc": float(best_val_acc),
        "final_val_loss": float(val_loss),
        "metrics": metrics,
        "history": history,
        "model_path": cfg.EMOTION_BEST_MODEL_PATH,
        "onnx_path": cfg.EMOTION_ONNX_MODEL_PATH,
    }

    save_json_report(report, cfg.EMOTION_REPORT_PATH)
    print(f"\n  Relatorio salvo: {cfg.EMOTION_REPORT_PATH}")

    total_time = time.time() - start_time
    print("\n" + "=" * 80)
    print("  TREINAMENTO CONCLUÍDO")
    print("=" * 80)
    print(f"\n  Tempo total: {format_time(total_time)}")
    print(f"\n  Modelo Emocional:")
    print(f"    Val Acc: {best_val_acc*100:.2f}%")
    print(f"    ONNX: {cfg.EMOTION_ONNX_MODEL_PATH}")
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
