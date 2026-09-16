"""
git_service.py
--------------
Handles all interactions with GitHub repositories:
  - URL validation and parsing
  - Repository cloning via GitPython
  - Repository limit checks (size / file count)
  - Commit history extraction
  - Temporary directory lifecycle management

This module is intentionally free of any RAG / embedding / vector-DB logic.
Person C's indexer.py and rag.py are NOT imported here.
"""

import logging
import os
import re
import shutil
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from git import GitCommandError, InvalidGitRepositoryError, Repo
from git.exc import NoSuchPathError

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (from environment variables with sensible defaults)
# ---------------------------------------------------------------------------

MAX_REPO_SIZE_MB: int = int(os.getenv("MAX_REPO_SIZE_MB", "100"))
MAX_FILES: int = int(os.getenv("MAX_FILES", "500"))
MAX_COMMITS: int = int(os.getenv("MAX_COMMITS", "100"))

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------


@dataclass
class RepoMetadata:
    """Basic metadata about a cloned repository."""

    owner: str
    name: str
    full_name: str          # "owner/name"
    url: str
    clone_path: str         # Absolute path to the temporary clone directory
    size_mb: float
    total_files: int


@dataclass
class CommitInfo:
    """Structured representation of a single Git commit."""

    hash: str
    author: str
    date: str               # ISO-8601 date string "YYYY-MM-DD"
    message: str
    files_changed: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# URL validation
# ---------------------------------------------------------------------------

# Matches: https://github.com/owner/repo  (with optional trailing slash / .git)
_GITHUB_URL_RE = re.compile(
    r"^https://github\.com/([A-Za-z0-9_.\-]+)/([A-Za-z0-9_.\-]+?)(?:\.git)?/?$"
)


def validate_github_url(url: str) -> tuple[str, str]:
    """
    Validate a GitHub repository URL and extract owner / repo name.

    Parameters
    ----------
    url : str
        The raw URL provided by the user.

    Returns
    -------
    tuple[str, str]
        ``(owner, repo_name)`` on success.

    Raises
    ------
    ValueError
        If the URL is not a valid public GitHub repository URL.
    """
    if not url or not isinstance(url, str):
        raise ValueError("Repository URL must be a non-empty string.")

    url = url.strip()

    match = _GITHUB_URL_RE.match(url)
    if not match:
        raise ValueError(
            f"Invalid GitHub repository URL: '{url}'. "
            "Expected format: https://github.com/owner/repository"
        )

    owner, repo_name = match.group(1), match.group(2)
    logger.info("Validated GitHub URL — owner=%s  repo=%s", owner, repo_name)
    return owner, repo_name


# ---------------------------------------------------------------------------
# Repository cloning
# ---------------------------------------------------------------------------


def clone_repository(repo_url: str) -> tuple[Repo, str]:
    """
    Clone a public GitHub repository into a temporary directory.

    Parameters
    ----------
    repo_url : str
        Validated GitHub HTTPS URL.

    Returns
    -------
    tuple[Repo, str]
        ``(git.Repo object, absolute path to temporary clone directory)``

    Raises
    ------
    FileNotFoundError
        If the remote repository does not exist (HTTP 128 / 404-equivalent).
    PermissionError
        If the repository requires authentication.
    RuntimeError
        For any other clone failure.
    """
    tmp_dir = tempfile.mkdtemp(prefix="oca_repo_")
    logger.info("Cloning %s into %s …", repo_url, tmp_dir)

    try:
        repo = Repo.clone_from(repo_url, tmp_dir, depth=MAX_COMMITS + 1)
        logger.info("Clone successful: %s", tmp_dir)
        return repo, tmp_dir

    except GitCommandError as exc:
        # Clean up before raising
        shutil.rmtree(tmp_dir, ignore_errors=True)

        error_message = str(exc).lower()
        if "repository not found" in error_message or "not found" in error_message:
            raise FileNotFoundError(
                f"Repository not found or inaccessible: {repo_url}"
            ) from exc
        if "authentication failed" in error_message or "could not read" in error_message:
            raise PermissionError(
                "This repository requires authentication. "
                "Only public repositories are supported."
            ) from exc

        logger.exception("Git clone failed for %s", repo_url)
        raise RuntimeError(f"Failed to clone repository: {exc}") from exc

    except Exception as exc:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        logger.exception("Unexpected error while cloning %s", repo_url)
        raise RuntimeError(f"Unexpected cloning error: {exc}") from exc


# ---------------------------------------------------------------------------
# Repository limit checks
# ---------------------------------------------------------------------------


def get_repo_size_mb(clone_path: str) -> float:
    """Return the total disk size of *clone_path* in megabytes."""
    total_bytes = 0
    for dirpath, _dirnames, filenames in os.walk(clone_path):
        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            try:
                total_bytes += os.path.getsize(fpath)
            except OSError:
                pass
    return total_bytes / (1024 * 1024)


def count_repo_files(clone_path: str) -> int:
    """Return the total number of files inside *clone_path* (including .git)."""
    count = 0
    for _dirpath, _dirnames, filenames in os.walk(clone_path):
        count += len(filenames)
    return count


def check_repository_limits(clone_path: str) -> tuple[float, int]:
    """
    Check whether a cloned repository is within the configured size and
    file-count limits.

    Parameters
    ----------
    clone_path : str
        Absolute path to the cloned repository directory.

    Returns
    -------
    tuple[float, int]
        ``(size_mb, file_count)``

    Raises
    ------
    ValueError
        If the repository exceeds the configured limits.
    """
    size_mb = get_repo_size_mb(clone_path)
    file_count = count_repo_files(clone_path)

    logger.info(
        "Repository stats — size=%.2f MB  files=%d  limits=[%d MB, %d files]",
        size_mb, file_count, MAX_REPO_SIZE_MB, MAX_FILES,
    )

    if size_mb > MAX_REPO_SIZE_MB:
        raise ValueError(
            f"Repository size ({size_mb:.1f} MB) exceeds the configured limit "
            f"of {MAX_REPO_SIZE_MB} MB."
        )

    if file_count > MAX_FILES:
        raise ValueError(
            f"Repository file count ({file_count}) exceeds the configured limit "
            f"of {MAX_FILES} files."
        )

    return size_mb, file_count


# ---------------------------------------------------------------------------
# Repository metadata
# ---------------------------------------------------------------------------


def get_repo_metadata(
    repo: Repo,
    owner: str,
    repo_name: str,
    repo_url: str,
    clone_path: str,
    size_mb: float,
    file_count: int,
) -> RepoMetadata:
    """Assemble a :class:`RepoMetadata` object for the cloned repository."""
    return RepoMetadata(
        owner=owner,
        name=repo_name,
        full_name=f"{owner}/{repo_name}",
        url=repo_url,
        clone_path=clone_path,
        size_mb=size_mb,
        total_files=file_count,
    )


# ---------------------------------------------------------------------------
# Commit history extraction
# ---------------------------------------------------------------------------


def _format_date(commit) -> str:
    """Return commit date as a ``YYYY-MM-DD`` string (UTC)."""
    try:
        # GitPython provides committed_datetime (tz-aware)
        dt: datetime = commit.committed_datetime
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%d")
    except Exception:
        return "unknown"


def _get_changed_files(commit) -> list[str]:
    """
    Return a list of file paths changed in *commit*.

    For the very first commit (no parents) we list all files tracked.
    For subsequent commits we diff against the first parent.
    """
    try:
        if not commit.parents:
            # Initial commit — all tracked blobs are "changed"
            return [item.path for item in commit.tree.traverse()
                    if item.type == "blob"]

        diff = commit.parents[0].diff(commit)
        paths: list[str] = []
        for diff_item in diff:
            if diff_item.a_path:
                paths.append(diff_item.a_path)
            if diff_item.b_path and diff_item.b_path != diff_item.a_path:
                paths.append(diff_item.b_path)
        return list(set(paths))  # deduplicate

    except Exception as exc:
        logger.warning("Could not determine changed files for commit %s: %s",
                       commit.hexsha[:8], exc)
        return []


def extract_commit_history(repo: Repo) -> list[CommitInfo]:
    """
    Extract up to ``MAX_COMMITS`` commits from the repository's active branch.

    Parameters
    ----------
    repo : git.Repo
        An open GitPython repository object.

    Returns
    -------
    list[CommitInfo]
        Commits ordered from newest to oldest.
    """
    commits: list[CommitInfo] = []

    try:
        for commit in repo.iter_commits(max_count=MAX_COMMITS):
            changed_files = _get_changed_files(commit)
            commits.append(
                CommitInfo(
                    hash=commit.hexsha,
                    author=str(commit.author),
                    date=_format_date(commit),
                    message=commit.message.strip(),
                    files_changed=changed_files,
                )
            )
    except Exception as exc:
        logger.warning("Error extracting commit history: %s", exc)

    logger.info("Extracted %d commits.", len(commits))
    return commits


# ---------------------------------------------------------------------------
# Temporary directory cleanup
# ---------------------------------------------------------------------------


def cleanup_repo(clone_path: str) -> None:
    """
    Remove the temporary clone directory from disk.

    Parameters
    ----------
    clone_path : str
        Absolute path to the directory created by :func:`clone_repository`.
    """
    if clone_path and os.path.isdir(clone_path):
        try:
            shutil.rmtree(clone_path, ignore_errors=True)
            logger.info("Cleaned up temporary directory: %s", clone_path)
        except Exception as exc:
            logger.warning("Failed to clean up %s: %s", clone_path, exc)


# ---------------------------------------------------------------------------
# High-level pipeline entry point
# ---------------------------------------------------------------------------


def process_repository(repo_url: str) -> tuple[RepoMetadata, list[CommitInfo], str]:
    """
    Validate, clone, check limits, and extract metadata + commit history for
    a public GitHub repository.

    Parameters
    ----------
    repo_url : str
        Raw GitHub URL from the user.

    Returns
    -------
    tuple[RepoMetadata, list[CommitInfo], str]
        ``(metadata, commits, clone_path)``
        The caller is responsible for calling :func:`cleanup_repo` after
        processing the cloned directory.

    Raises
    ------
    ValueError
        Invalid URL or repository exceeds configured limits.
    FileNotFoundError
        Repository not found / inaccessible.
    RuntimeError
        Clone failure or unexpected error.
    """
    # 1. Validate URL
    owner, repo_name = validate_github_url(repo_url)

    # 2. Clone
    repo, clone_path = clone_repository(repo_url)

    try:
        # 3. Check limits
        size_mb, file_count = check_repository_limits(clone_path)

        # 4. Metadata
        metadata = get_repo_metadata(
            repo=repo,
            owner=owner,
            repo_name=repo_name,
            repo_url=repo_url,
            clone_path=clone_path,
            size_mb=size_mb,
            file_count=file_count,
        )

        # 5. Commit history
        commits = extract_commit_history(repo)

        return metadata, commits, clone_path

    except Exception:
        # If anything after the clone fails, clean up immediately
        cleanup_repo(clone_path)
        raise
