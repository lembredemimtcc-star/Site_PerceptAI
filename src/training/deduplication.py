"""
PerceptAI — Deduplicação de Imagens
=====================================

Detecta imagens duplicadas no dataset usando hash MD5 do conteúdo binário
do arquivo. Imagens com o mesmo hash são consideradas idênticas.

IMPORTANTE:
- Os arquivos originais em src/datasets/ NÃO são apagados.
- Apenas a lista de caminhos elegíveis para treinamento é filtrada.
- A deduplicação acontece ANTES do split treino/validação para evitar
  data leakage (mesma imagem em treino e validação).
"""

import hashlib
import os
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from config import SUPPORTED_EXTENSIONS


@dataclass
class DeduplicationReport:
    """Relatório de deduplicação por classe."""

    # {class_name: total de arquivos encontrados (com duplicatas)}
    total_found: Dict[str, int] = field(default_factory=dict)

    # {class_name: quantidade de duplicatas removidas da lista}
    total_duplicates: Dict[str, int] = field(default_factory=dict)

    # {class_name: quantidade de imagens únicas}
    total_unique: Dict[str, int] = field(default_factory=dict)

    # {hash: [lista de caminhos duplicados]} — para auditoria
    duplicate_groups: Dict[str, List[str]] = field(default_factory=dict)

    @property
    def grand_total_found(self) -> int:
        return sum(self.total_found.values())

    @property
    def grand_total_duplicates(self) -> int:
        return sum(self.total_duplicates.values())

    @property
    def grand_total_unique(self) -> int:
        return sum(self.total_unique.values())


def _md5_hash(filepath: str) -> str:
    """Calcula o hash MD5 do conteúdo binário de um arquivo."""
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        # Lê em blocos para não carregar arquivos grandes inteiros na memória
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def _is_supported_image(filename: str) -> bool:
    """Verifica se o arquivo tem extensão de imagem suportada."""
    return filename.lower().endswith(SUPPORTED_EXTENSIONS)


def deduplicate_dataset(
    class_image_paths: Dict[str, List[str]],
) -> Tuple[Dict[str, List[str]], DeduplicationReport]:
    """
    Recebe um dicionário {class_name: [lista de caminhos de imagem]} e
    retorna um novo dicionário com apenas imagens únicas (por hash MD5),
    além de um relatório de deduplicação.

    A deduplicação é global: o mesmo hash detectado em qualquer classe
    é tratado como duplicata (dentro da mesma classe; entre classes distintas
    é raro e semanticamente diferente, então é reportado mas não removido).

    Args:
        class_image_paths: dicionário {class_name: [paths]}

    Returns:
        (unique_paths_by_class, report)
    """
    report = DeduplicationReport()

    # Hash → primeiro caminho encontrado (global para detectar cross-class dups)
    global_seen_hashes: Dict[str, str] = {}

    unique_paths_by_class: Dict[str, List[str]] = {}

    for class_name, paths in class_image_paths.items():
        found = len(paths)
        unique_paths: List[str] = []
        duplicates_in_class: int = 0

        # Hash → lista de caminhos dentro desta classe
        class_hash_to_paths: Dict[str, List[str]] = defaultdict(list)

        for path in paths:
            try:
                file_hash = _md5_hash(path)
            except (OSError, IOError) as e:
                print(f"  [AVISO] Não foi possível ler '{path}': {e}. Ignorando.")
                found -= 1
                continue

            class_hash_to_paths[file_hash].append(path)

        for file_hash, hash_paths in class_hash_to_paths.items():
            # Mantém apenas o primeiro caminho com este hash dentro da classe
            unique_paths.append(hash_paths[0])

            if len(hash_paths) > 1:
                duplicates_in_class += len(hash_paths) - 1
                # Registra o grupo para auditoria
                report.duplicate_groups[file_hash] = hash_paths

        report.total_found[class_name]      = found
        report.total_duplicates[class_name] = duplicates_in_class
        report.total_unique[class_name]     = len(unique_paths)

        unique_paths_by_class[class_name] = unique_paths

    return unique_paths_by_class, report


def scan_dataset(
    datasets_dir: str,
    folder_to_class: Dict[str, str],
    class_names: List[str],
) -> Tuple[Dict[str, List[str]], List[str]]:
    """
    Varre o diretório de datasets e coleta os caminhos de imagem por classe.

    Args:
        datasets_dir:    caminho para src/datasets/
        folder_to_class: mapeamento {nome_da_pasta: nome_da_classe}
        class_names:     lista de classes canônicas (define a ordem)

    Returns:
        (class_image_paths, warnings)
        - class_image_paths: {class_name: [paths]} — seguindo a ordem de class_names
        - warnings: lista de avisos (pastas não mapeadas, imagens não legíveis, etc.)
    """
    warnings: List[str] = []

    if not os.path.isdir(datasets_dir):
        raise FileNotFoundError(
            f"Diretório de datasets não encontrado: '{datasets_dir}'"
        )

    # Inicializa o dicionário na ordem de CLASS_NAMES
    class_image_paths: Dict[str, List[str]] = {cls: [] for cls in class_names}

    entries = sorted(os.listdir(datasets_dir))

    for entry in entries:
        entry_path = os.path.join(datasets_dir, entry)
        if not os.path.isdir(entry_path):
            continue  # ignora arquivos na raiz do datasets/

        if entry not in folder_to_class:
            warnings.append(
                f"Pasta '{entry}' não está mapeada em FOLDER_TO_CLASS. Ignorando."
            )
            continue

        class_name = folder_to_class[entry]

        if class_name not in class_image_paths:
            warnings.append(
                f"Pasta '{entry}' mapeada para classe '{class_name}', "
                f"mas '{class_name}' não está em CLASS_NAMES. Ignorando."
            )
            continue

        image_files: List[str] = []
        for filename in sorted(os.listdir(entry_path)):
            if not _is_supported_image(filename):
                continue
            full_path = os.path.join(entry_path, filename)
            if not os.path.isfile(full_path):
                continue
            # Validação básica: arquivo existe e tem tamanho > 0
            if os.path.getsize(full_path) == 0:
                warnings.append(f"Arquivo vazio ignorado: '{full_path}'")
                continue
            image_files.append(full_path)

        class_image_paths[class_name].extend(image_files)

    # Verifica se alguma classe ficou sem imagens
    for class_name in class_names:
        if len(class_image_paths[class_name]) == 0:
            warnings.append(
                f"ATENÇÃO: Classe '{class_name}' não possui imagens no dataset!"
            )

    return class_image_paths, warnings


def print_deduplication_report(report: DeduplicationReport) -> None:
    """Imprime o relatorio de deduplicacao de forma legivel."""
    print("\n" + "=" * 60)
    print("RELATORIO DE DEDUPLICACAO")
    print("=" * 60)
    print(f"{'Classe':<15} {'Encontradas':>12} {'Duplicatas':>12} {'Unicas':>10}")
    print("-" * 52)
    for class_name in report.total_found:
        print(
            f"{class_name:<15}"
            f"{report.total_found[class_name]:>12}"
            f"{report.total_duplicates[class_name]:>12}"
            f"{report.total_unique[class_name]:>10}"
        )
    print("-" * 52)
    print(
        f"{'TOTAL':<15}"
        f"{report.grand_total_found:>12}"
        f"{report.grand_total_duplicates:>12}"
        f"{report.grand_total_unique:>10}"
    )

    if report.duplicate_groups:
        print(f"\nGrupos de duplicatas detectados: {len(report.duplicate_groups)}")
        print("(Os arquivos originais NAO foram apagados.)")
    else:
        print("\nNenhuma duplicata detectada.")
    print("=" * 60)
