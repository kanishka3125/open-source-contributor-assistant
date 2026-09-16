"""
API Integration tests for FastAPI endpoints.
Tests endpoints against a running local server (http://localhost:8000).
Run with: python -m unittest tests/test_api_integration.py
"""

import json
import unittest
import urllib.error
import urllib.request

BASE_URL = "http://localhost:8000"


def make_request(method: str, path: str, data: dict | None = None) -> tuple[int, dict]:
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"} if data is not None else {}
    body = json.dumps(data).encode("utf-8") if data is not None else None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.getcode()
            response_data = json.loads(resp.read().decode("utf-8"))
            return status, response_data
    except urllib.error.HTTPError as exc:
        status = exc.code
        try:
            response_data = json.loads(exc.read().decode("utf-8"))
        except Exception:
            response_data = {"error": exc.reason}
        return status, response_data


class TestApiIntegration(unittest.TestCase):
    """Integration test suite covering API endpoints and error conditions."""

    def test_00_root(self):
        """GET / returns 200 and docs link"""
        status, data = make_request("GET", "/")
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "running")
        self.assertIn("docs_url", data)

    def test_01_health_check(self):
        """GET /health returns 200 and status: ok"""
        status, data = make_request("GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "ok")

    def test_02_process_invalid_url(self):
        """POST /api/process with malformed URL returns 400"""
        status, data = make_request("POST", "/api/process", {"repo_url": "invalid-url"})
        self.assertEqual(status, 400)
        self.assertFalse(data.get("success", True))
        self.assertIn("error", data)

    def test_03_process_non_github_url(self):
        """POST /api/process with non-GitHub URL returns 400"""
        status, data = make_request("POST", "/api/process", {"repo_url": "https://gitlab.com/owner/repo"})
        self.assertEqual(status, 400)
        self.assertFalse(data.get("success", True))
        self.assertIn("error", data)

    def test_04_chat_empty_question(self):
        """POST /api/chat with empty question string returns 400"""
        status, data = make_request("POST", "/api/chat", {"question": "   "})
        self.assertEqual(status, 400)
        self.assertFalse(data.get("success", True))
        self.assertIn("Question cannot be empty", data.get("error", ""))

    def test_05_chat_missing_field(self):
        """POST /api/chat with missing body fields returns 422"""
        status, data = make_request("POST", "/api/chat", {})
        self.assertEqual(status, 422)

    def test_06_chat_valid_question_rag_handshake(self):
        """POST /api/chat with valid question returns 503 until Person C connects RAG"""
        status, data = make_request("POST", "/api/chat", {"question": "Where is auth?"})
        self.assertEqual(status, 503)
        self.assertFalse(data.get("success", True))
        self.assertIn("RAG", data.get("error", ""))


if __name__ == "__main__":
    unittest.main()
