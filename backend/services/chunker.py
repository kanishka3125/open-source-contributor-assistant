"""
chunker.py
----------
Converts repository content into structured, metadata-rich chunks ready to be
consumed by Person C's indexing / embedding layer.

Responsibilities
----------------
- Walk the cloned repository directory tree.
- Identify supported text-based source / documentation files.
- Skip ignored directories (node_modules, .git, __pycache__, etc.).
- Detect and skip binary files.
- Read file contents safely.
- Detect the programming language from the file extension.
- Split large files into overlapping line-based chunks.
- Build commit chunks from extracted commit history.

This module does NOT implement embeddings, vector storage, or RAG logic.
Person C's indexer.py / rag.py are NOT imported here.
"""

import logging
import os
from typing import Any

from dotenv import load_dotenv

from services.git_service import CommitInfo, RepoMetadata

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (from environment variables with sensible defaults)
# ---------------------------------------------------------------------------

CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "100"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "20"))

# ---------------------------------------------------------------------------
# File-type configuration
# ---------------------------------------------------------------------------

SUPPORTED_EXTENSIONS: frozenset[str] = frozenset(
    {
        ".py", ".js", ".jsx", ".ts", ".tsx",
        ".java", ".go", ".cpp", ".c", ".h",
        ".md", ".txt", ".json", ".yaml", ".yml",
        ".html", ".css",
    }
)

IGNORED_DIRECTORIES: frozenset[str] = frozenset(
    {
        ".git", "node_modules", "__pycache__",
        "venv", ".venv", "dist", "build",
    }
)

EXTENSION_TO_LANGUAGE: dict[str, str] = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".java": "java",
    ".go": "go",
    ".cpp": "cpp",
    ".c": "c",
    ".h": "c",
    ".md": "markdown",
    ".txt": "text",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".html": "html",
    ".css": "css",
}

# ---------------------------------------------------------------------------
# Type alias
# ---------------------------------------------------------------------------

Chunk = dict[str, Any]   # {"content": str, "metadata": dict[str, Any]}

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------


def _detect_language(file_path: str) -> str:
    """Return a lowercase language label for *file_path* based on its extension."""
    ext = os.path.splitext(file_path)[1].lower()
    return EXTENSION_TO_LANGUAGE.get(ext, "unknown")


def _is_binary_file(file_path: str, sample_size: int = 8192) -> bool:
    """
    Heuristically determine whether a file is binary.

    Reads the first *sample_size* bytes and checks for null bytes,
    which are a reliable indicator of binary content.
    """
    try:
        with open(file_path, "rb") as fh:
            sample = fh.read(sample_size)
        return b"\x00" in sample
    except OSError:
        return True


def _read_file_safely(file_path: str) -> str | None:
    """
    Read a text file with UTF-8 encoding, falling back to latin-1.

    Returns ``None`` if the file cannot be read.
    """
    for encoding in ("utf-8", "latin-1"):
        try:
            with open(file_path, "r", encoding=encoding) as fh:
                return fh.read()
        except (UnicodeDecodeError, OSError):
            continue
    logger.warning("Could not read file (skipped): %s", file_path)
    return None


def _should_ignore_directory(dirname: str) -> bool:
    """Return True if *dirname* is in the set of directories to skip."""
    return dirname in IGNORED_DIRECTORIES


# ---------------------------------------------------------------------------
# Line-based chunking
# ---------------------------------------------------------------------------


def _chunk_lines(
    lines: list[str],
    chunk_size: int,
    overlap: int,
) -> list[tuple[int, int, str]]:
    """
    Split *lines* into overlapping segments.

    Parameters
    ----------
    lines : list[str]
        All lines from a single file.
    chunk_size : int
        Maximum number of lines per chunk.
    overlap : int
        Number of lines shared between consecutive chunks.

    Returns
    -------
    list[tuple[int, int, str]]
        Each element is ``(start_line_1indexed, end_line_1indexed, content)``.
    """
    if not lines:
        return []

    step = max(chunk_size - overlap, 1)
    results: list[tuple[int, int, str]] = []

    idx = 0
    total_lines = len(lines)
    while idx < total_lines:
        chunk_lines = lines[idx: idx + chunk_size]
        start_line = idx + 1                        # 1-indexed
        end_line = idx + len(chunk_lines)           # 1-indexed, inclusive
        content = "".join(chunk_lines)
        results.append((start_line, end_line, content))
        if end_line >= total_lines:
            break
        idx += step

    return results


# ---------------------------------------------------------------------------
# Source-file chunk creation
# ---------------------------------------------------------------------------


def chunk_file(
    file_path: str,
    relative_path: str,
    repo_full_name: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[Chunk]:
    """
    Read a single source file and split it into chunks with metadata.

    Parameters
    ----------
    file_path : str
        Absolute path to the file on disk.
    relative_path : str
        Path of the file relative to the repository root.
    repo_full_name : str
        ``"owner/repo"`` identifier for metadata.
    chunk_size : int
        Lines per chunk.
    overlap : int
        Overlapping lines between consecutive chunks.

    Returns
    -------
    list[Chunk]
        Zero or more chunk dicts.  Returns ``[]`` for binary / unreadable files.
    """
    if _is_binary_file(file_path):
        logger.debug("Skipping binary file: %s", relative_path)
        return []

    content = _read_file_safely(file_path)
    if content is None:
        return []

    language = _detect_language(file_path)
    content_type = "documentation" if language in {"markdown", "text"} else "code"

    lines = content.splitlines(keepends=True)
    if not lines:
        return []

    # For very small files, store as a single chunk
    if len(lines) <= chunk_size:
        return [
            {
                "content": content,
                "metadata": {
                    "file_path": relative_path,
                    "repo": repo_full_name,
                    "lines": f"1-{len(lines)}",
                    "language": language,
                    "type": content_type,
                },
            }
        ]

    # Larger files — split with overlap
    chunks: list[Chunk] = []
    for start, end, chunk_content in _chunk_lines(lines, chunk_size, overlap):
        chunks.append(
            {
                "content": chunk_content,
                "metadata": {
                    "file_path": relative_path,
                    "repo": repo_full_name,
                    "lines": f"{start}-{end}",
                    "language": language,
                    "type": content_type,
                },
            }
        )
    return chunks


# ---------------------------------------------------------------------------
# Repository walk & extraction
# ---------------------------------------------------------------------------


def extract_file_chunks(
    clone_path: str,
    metadata: RepoMetadata,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> tuple[list[Chunk], int]:
    """
    Walk the cloned repository and produce chunks for every supported text file.

    Parameters
    ----------
    clone_path : str
        Absolute path to the cloned repository directory.
    metadata : RepoMetadata
        Repository metadata (used to populate chunk metadata).
    chunk_size : int
        Lines per chunk.
    overlap : int
        Overlapping lines between consecutive chunks.

    Returns
    -------
    tuple[list[Chunk], int]
        ``(all_chunks, files_processed_count)``
    """
    all_chunks: list[Chunk] = []
    files_processed = 0

    for dirpath, dirnames, filenames in os.walk(clone_path):
        # Prune ignored directories in-place so os.walk does not recurse into them
        dirnames[:] = [
            d for d in dirnames
            if not _should_ignore_directory(d)
        ]

        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            abs_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(abs_path, clone_path).replace("\\", "/")

            file_chunks = chunk_file(
                file_path=abs_path,
                relative_path=rel_path,
                repo_full_name=metadata.full_name,
                chunk_size=chunk_size,
                overlap=overlap,
            )

            if file_chunks:
                all_chunks.extend(file_chunks)
                files_processed += 1
                logger.debug(
                    "Processed %s → %d chunk(s)", rel_path, len(file_chunks)
                )

    logger.info(
        "File extraction complete — files=%d  chunks=%d",
        files_processed, len(all_chunks),
    )
    return all_chunks, files_processed


# ---------------------------------------------------------------------------
# Commit chunk creation
# ---------------------------------------------------------------------------


def _format_commit_content(commit: CommitInfo) -> str:
    """
    Build a human-readable text block representing a single commit.

    The structured format makes it easy for Person C's embedding layer to
    understand and index commit information.
    """
    lines = [
        f"Commit: {commit.hash}",
        f"Author: {commit.author}",
        f"Date: {commit.date}",
        "",
        "Message:",
        commit.message,
    ]

    if commit.files_changed:
        lines.append("")
        lines.append("Files changed:")
        for f in commit.files_changed:
            lines.append(f"- {f}")

    return "\n".join(lines)


def create_commit_chunks(
    commits: list[CommitInfo],
    repo_full_name: str,
) -> list[Chunk]:
    """
    Convert extracted commit objects into searchable chunk dicts.

    Parameters
    ----------
    commits : list[CommitInfo]
        Commits produced by :func:`services.git_service.extract_commit_history`.
    repo_full_name : str
        ``"owner/repo"`` identifier.

    Returns
    -------
    list[Chunk]
        One chunk per commit.
    """
    chunks: list[Chunk] = []

    for commit in commits:
        content = _format_commit_content(commit)
        chunks.append(
            {
                "content": content,
                "metadata": {
                    "repo": repo_full_name,
                    "type": "commit",
                    "commit_hash": commit.hash,
                    "author": commit.author,
                    "date": commit.date,
                },
            }
        )

    logger.info("Created %d commit chunk(s).", len(chunks))
    return chunks
