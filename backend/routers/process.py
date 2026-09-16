"""
routers/process.py
------------------
POST /api/process

Accepts a public GitHub repository URL, orchestrates the full
repository-processing pipeline, and returns processing statistics.

Pipeline
--------
1. Validate the GitHub URL (git_service)
2. Clone the repository           (git_service)
3. Check repository limits        (git_service)
4. Extract source-file chunks     (chunker)
5. Extract commit history         (git_service)
6. Build commit chunks            (chunker)
7. Combine all chunks
8. [INTEGRATION POINT] — call Person C's index_chunks() when available
9. Clean up temporary directory
10. Return statistics

This router does NOT implement embeddings, vector storage, or LLM logic.
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from services import chunker, git_service
from services.git_service import cleanup_repo

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ProcessRequest(BaseModel):
    repo_url: str

    @field_validator("repo_url")
    @classmethod
    def repo_url_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("repo_url must not be empty.")
        return v.strip()


class ProcessResponse(BaseModel):
    success: bool
    message: str
    repo_name: str
    repo_url: str
    files_processed: int
    commits_processed: int
    chunks_created: int


class ErrorResponse(BaseModel):
    success: bool = False
    error: str


# ---------------------------------------------------------------------------
# Integration boundary for Person C
# ---------------------------------------------------------------------------

def _index_chunks(chunks: list[dict]) -> None:
    """
    Integration point — connect Person C's indexing layer here.

    When Person C's ``indexer.py`` is ready, replace the body of this
    function with:

        from services.indexer import index_chunks
        index_chunks(chunks)

    Until then, we log the chunk count so the pipeline is exercisable
    end-to-end without the RAG layer.

    DO NOT implement embeddings or vector storage here.
    """
    # TODO (Person C): Replace the log statement below with the real call:
    #   from services.indexer import index_chunks
    #   index_chunks(chunks)
    logger.info(
        "[INTEGRATION POINT] %d chunk(s) ready for Person C's indexer. "
        "Connect services/indexer.py here.",
        len(chunks),
    )


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/api/process",
    response_model=ProcessResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Process a GitHub Repository",
    description=(
        "Clone, extract, and chunk a public GitHub repository. "
        "Returns processing statistics."
    ),
)
async def process_repository(request: ProcessRequest):
    """
    Main repository-processing endpoint.

    Validates the URL, clones the repo, checks limits, extracts files and
    commit history, creates chunks, and returns statistics.
    """
    repo_url = request.repo_url
    clone_path: str | None = None

    try:
        # ------------------------------------------------------------------ #
        # Step 1-3: Validate URL, clone, check limits                        #
        # ------------------------------------------------------------------ #
        logger.info("Processing repository: %s", repo_url)
        metadata, commits, clone_path = git_service.process_repository(repo_url)

        # ------------------------------------------------------------------ #
        # Step 4: Extract source-file chunks                                 #
        # ------------------------------------------------------------------ #
        file_chunks, files_processed = chunker.extract_file_chunks(
            clone_path=clone_path,
            metadata=metadata,
        )

        # ------------------------------------------------------------------ #
        # Step 5-6: Create commit chunks                                     #
        # ------------------------------------------------------------------ #
        commit_chunks = chunker.create_commit_chunks(
            commits=commits,
            repo_full_name=metadata.full_name,
        )

        # ------------------------------------------------------------------ #
        # Step 7: Combine all chunks                                         #
        # ------------------------------------------------------------------ #
        all_chunks = file_chunks + commit_chunks
        chunks_created = len(all_chunks)

        # ------------------------------------------------------------------ #
        # Step 8: Pass to Person C's indexer (integration point)             #
        # ------------------------------------------------------------------ #
        _index_chunks(all_chunks)

        logger.info(
            "Repository processed successfully — %s | files=%d commits=%d chunks=%d",
            metadata.full_name, files_processed, len(commits), chunks_created,
        )

        return ProcessResponse(
            success=True,
            message="Repository processed successfully",
            repo_name=metadata.name,
            repo_url=repo_url,
            files_processed=files_processed,
            commits_processed=len(commits),
            chunks_created=chunks_created,
        )

    # ---------------------------------------------------------------------- #
    # Error handling                                                          #
    # ---------------------------------------------------------------------- #
    except ValueError as exc:
        # Invalid URL  or  exceeds limits
        error_msg = str(exc)
        logger.warning("Validation / limit error for %s: %s", repo_url, error_msg)

        if "Invalid GitHub" in error_msg or "Invalid" in error_msg:
            raise HTTPException(status_code=400, detail={"success": False, "error": str(exc)})

        # Limit exceeded
        raise HTTPException(status_code=413, detail={"success": False, "error": str(exc)})

    except FileNotFoundError as exc:
        logger.warning("Repository not found: %s — %s", repo_url, exc)
        raise HTTPException(
            status_code=404,
            detail={"success": False, "error": "Repository not found or inaccessible"},
        )

    except PermissionError as exc:
        logger.warning("Repository access denied: %s — %s", repo_url, exc)
        raise HTTPException(
            status_code=404,
            detail={"success": False, "error": "Repository not found or inaccessible"},
        )

    except RuntimeError as exc:
        logger.exception("Runtime error processing %s", repo_url)
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": "Failed to process repository"},
        )

    except Exception as exc:
        logger.exception("Unexpected error processing %s", repo_url)
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": "Failed to process repository"},
        )

    finally:
        # Always clean up the temporary clone directory
        if clone_path:
            cleanup_repo(clone_path)
