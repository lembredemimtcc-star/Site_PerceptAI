"""
PerceptAI — Métricas de Avaliação
====================================

Calcula accuracy, precision, recall, F1-score (por classe e macro)
e gera a matriz de confusão para o classificador de 8 classes.
"""

import os
from typing import Dict, List

import matplotlib
matplotlib.use("Agg")  # backend sem GUI para salvar figuras em arquivo
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


def compute_metrics(
    y_true: List[int],
    y_pred: List[int],
    class_names: List[str],
) -> Dict:
    """
    Calcula todas as métricas de avaliação multiclasse.

    Args:
        y_true:      rótulos reais
        y_pred:      rótulos preditos
        class_names: nomes das classes (na mesma ordem dos índices)

    Returns:
        dicionário com métricas gerais, por classe e contagem de exemplos
    """
    y_true_np = np.array(y_true)
    y_pred_np = np.array(y_pred)

    accuracy = accuracy_score(y_true_np, y_pred_np)

    macro_precision = precision_score(
        y_true_np, y_pred_np, average="macro", zero_division=0
    )
    macro_recall = recall_score(
        y_true_np, y_pred_np, average="macro", zero_division=0
    )
    macro_f1 = f1_score(
        y_true_np, y_pred_np, average="macro", zero_division=0
    )

    # Métricas por classe
    per_class_precision = precision_score(
        y_true_np, y_pred_np, average=None, zero_division=0
    )
    per_class_recall = recall_score(
        y_true_np, y_pred_np, average=None, zero_division=0
    )
    per_class_f1 = f1_score(
        y_true_np, y_pred_np, average=None, zero_division=0
    )

    # Contagem real de exemplos por classe no conjunto avaliado
    class_counts = {}
    for idx, name in enumerate(class_names):
        class_counts[name] = int(np.sum(y_true_np == idx))

    per_class_metrics = {}
    for idx, name in enumerate(class_names):
        per_class_metrics[name] = {
            "precision": float(per_class_precision[idx]) if idx < len(per_class_precision) else 0.0,
            "recall":    float(per_class_recall[idx])    if idx < len(per_class_recall)    else 0.0,
            "f1":        float(per_class_f1[idx])        if idx < len(per_class_f1)        else 0.0,
            "count":     class_counts[name],
        }

    return {
        "accuracy":        float(accuracy),
        "macro_precision": float(macro_precision),
        "macro_recall":    float(macro_recall),
        "macro_f1":        float(macro_f1),
        "per_class":       per_class_metrics,
    }


def print_metrics(metrics: Dict, class_names: List[str]) -> None:
    """Imprime as métricas de forma legível no console."""
    print(f"\n  Accuracy:        {metrics['accuracy'] * 100:.2f}%")
    print(f"  Macro Precision: {metrics['macro_precision'] * 100:.2f}%")
    print(f"  Macro Recall:    {metrics['macro_recall'] * 100:.2f}%")
    print(f"  Macro F1:        {metrics['macro_f1'] * 100:.2f}%")
    print()
    print(f"  {'Classe':<12} {'Precision':>10} {'Recall':>10} {'F1':>10} {'Exemplos':>10}")
    print("  " + "-" * 52)
    for name in class_names:
        m = metrics["per_class"][name]
        print(
            f"  {name:<12}"
            f"  {m['precision']*100:>8.2f}%"
            f"  {m['recall']*100:>8.2f}%"
            f"  {m['f1']*100:>8.2f}%"
            f"  {m['count']:>8}"
        )


def plot_confusion_matrix(
    y_true: List[int],
    y_pred: List[int],
    class_names: List[str],
    save_path: str,
) -> None:
    """
    Gera e salva a matriz de confusão como imagem PNG.

    Args:
        y_true:      rótulos reais
        y_pred:      rótulos preditos
        class_names: nomes das classes
        save_path:   caminho completo para salvar o PNG
    """
    cm = confusion_matrix(y_true, y_pred)
    n = len(class_names)

    fig, ax = plt.subplots(figsize=(10, 8))

    # Normaliza para percentual por linha (recall por classe)
    cm_normalized = cm.astype(float)
    row_sums = cm.sum(axis=1, keepdims=True)
    # Evita divisão por zero para classes sem exemplos na validação
    row_sums_safe = np.where(row_sums == 0, 1, row_sums)
    cm_normalized = cm_normalized / row_sums_safe

    im = ax.imshow(cm_normalized, interpolation="nearest", cmap=plt.cm.Blues)
    plt.colorbar(im, ax=ax, label="Proporção (por linha)")

    ax.set(
        xticks=np.arange(n),
        yticks=np.arange(n),
        xticklabels=class_names,
        yticklabels=class_names,
        ylabel="Rótulo Real",
        xlabel="Rótulo Predito",
        title="Matriz de Confusão — PerceptAI",
    )
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    # Anota cada célula com a contagem absoluta
    thresh = cm_normalized.max() / 2.0
    for i in range(n):
        for j in range(n):
            ax.text(
                j, i,
                f"{cm[i, j]}",
                ha="center", va="center",
                color="white" if cm_normalized[i, j] > thresh else "black",
                fontsize=10,
            )

    fig.tight_layout()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  Matriz de confusao salva em: {save_path}")


def plot_training_curves(
    history: Dict,
    save_dir: str,
) -> None:
    """
    Gera e salva os graficos de loss e accuracy por epoca.

    Args:
        history:  dicionario com listas {"train_loss", "val_loss",
                                          "train_acc",  "val_acc"}
        save_dir: diretorio onde os PNGs serao salvos
    """
    os.makedirs(save_dir, exist_ok=True)
    epochs = range(1, len(history["train_loss"]) + 1)

    # --- Loss ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(epochs, history["train_loss"], "b-o", label="Train Loss")
    ax.plot(epochs, history["val_loss"],   "r-o", label="Val Loss")
    ax.set_title("Loss por Epoca - PerceptAI")
    ax.set_xlabel("Epoca")
    ax.set_ylabel("Loss")
    ax.legend()
    ax.grid(True, alpha=0.3)
    loss_path = os.path.join(save_dir, "loss_curve.png")
    fig.tight_layout()
    plt.savefig(loss_path, dpi=150)
    plt.close(fig)
    print(f"  Grafico de loss salvo em: {loss_path}")

    # --- Accuracy ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(epochs, [a * 100 for a in history["train_acc"]], "b-o", label="Train Acc")
    ax.plot(epochs, [a * 100 for a in history["val_acc"]],   "r-o", label="Val Acc")
    ax.set_title("Accuracy por Epoca - PerceptAI")
    ax.set_xlabel("Epoca")
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(0, 100)
    ax.legend()
    ax.grid(True, alpha=0.3)
    acc_path = os.path.join(save_dir, "accuracy_curve.png")
    fig.tight_layout()
    plt.savefig(acc_path, dpi=150)
    plt.close(fig)
    print(f"  Grafico de accuracy salvo em: {acc_path}")
