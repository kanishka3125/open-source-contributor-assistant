"""
Root entrypoint delegating to backend/main.py.
Allows running `uvicorn main:app --reload` directly from the repository root.
"""
import sys
from pathlib import Path

# Add the backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the FastAPI application from backend/main.py
from main import app  # noqa: E402, F401
