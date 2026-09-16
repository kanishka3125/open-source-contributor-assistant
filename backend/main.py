"""
main.py
-------
Entry point for the Open Source Contributor Assistant backend.

Responsibilities
----------------
- Create the FastAPI application instance.
- Configure CORS (allows the frontend on localhost:3000).
- Register the process and chat routers.
- Expose GET /health for uptime checks.

Run the server with:
    uvicorn main:app --reload
"""
from contextlib import asynccontextmanager

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from routers import chat, process

# ---------------------------------------------------------------------------
# Load environment variables from .env (if present)
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Open Source Contributor Assistant backend started.")
    logger.info("API docs available at http://localhost:8000/docs")
    yield
    logger.info("Backend shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Open Source Contributor Assistant — Backend",
    description=(
        "Backend API for cloning, processing, and querying public GitHub "
        "repositories. Provides repository processing and a chat interface "
        "for natural-language questions about repository contents."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(process.router, tags=["Repository Processing"])
app.include_router(chat.router, tags=["Chat"])


# ---------------------------------------------------------------------------
# Exception handlers (conform to 03-api-specification.md error schema)
# ---------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail,
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": str(exc.detail)},
    )


# ---------------------------------------------------------------------------
# Root and Health check endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Root"], summary="API Root")
async def root():
    """Welcome endpoint pointing to docs and service info."""
    return {
        "message": "Open Source Contributor Assistant Backend API",
        "status": "running",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", tags=["Health"], summary="Health Check")
async def health():
    """Returns ``{"status": "ok"}`` when the server is running."""
    return {"status": "ok"}
