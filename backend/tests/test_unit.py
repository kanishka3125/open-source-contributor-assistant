"""
Unit tests for Git service and Chunker service.
Run with: python -m unittest discover -s tests -p "test_*.py"
"""

import os
import tempfile
import unittest
from services.git_service import (
    validate_github_url,
    check_repository_limits,
    get_repo_size_mb,
    count_repo_files,
    CommitInfo,
)
from services.chunker import (
    chunk_file,
    _chunk_lines,
    _detect_language,
    _should_ignore_directory,
    create_commit_chunks,
    SUPPORTED_EXTENSIONS,
    IGNORED_DIRECTORIES,
    EXTENSION_TO_LANGUAGE,
)


class TestGitService(unittest.TestCase):
    """Tests for Git Service URL validation and limits."""

    def test_valid_github_urls(self):
        valid_cases = [
            ("https://github.com/pallets/flask", "pallets", "flask"),
            ("https://github.com/octocat/Hello-World.git", "octocat", "Hello-World"),
            ("https://github.com/facebook/react/", "facebook", "react"),
        ]
        for url, expected_owner, expected_repo in valid_cases:
            with self.subTest(url=url):
                owner, repo = validate_github_url(url)
                self.assertEqual(owner, expected_owner)
                self.assertEqual(repo, expected_repo)

    def test_invalid_github_urls(self):
        invalid_cases = [
            "hello",
            "",
            "http://github.com/fastapi/fastapi",  # requires https
            "https://gitlab.com/owner/repo",
            "https://example.com/repo",
            "https://github.com/",
            "https://github.com/onlyowner",
            "https://github.com/owner/repo/extra/path",
            "ftp://github.com/owner/repo",
        ]
        for url in invalid_cases:
            with self.subTest(url=url):
                with self.assertRaises(ValueError):
                    validate_github_url(url)

    def test_repo_limits(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            # Create 3 small dummy files
            for i in range(3):
                with open(os.path.join(tmp_dir, f"file{i}.txt"), "w", encoding="utf-8") as f:
                    f.write("test content\n")

            # Limits satisfied
            size_mb, file_count = check_repository_limits(tmp_dir)
            self.assertGreater(size_mb, 0)
            self.assertEqual(file_count, 3)

            # File count and size helpers
            self.assertEqual(count_repo_files(tmp_dir), 3)
            self.assertGreater(get_repo_size_mb(tmp_dir), 0)


class TestChunkerService(unittest.TestCase):
    """Tests for repository chunking and language detection."""

    def test_detect_language(self):
        self.assertEqual(_detect_language("src/main.py"), "python")
        self.assertEqual(_detect_language("index.js"), "javascript")
        self.assertEqual(_detect_language("App.tsx"), "typescript")
        self.assertEqual(_detect_language("README.md"), "markdown")
        self.assertEqual(_detect_language("config.yaml"), "yaml")
        self.assertEqual(_detect_language("unknown.xyz"), "unknown")

    def test_ignored_directories(self):
        self.assertTrue(_should_ignore_directory(".git"))
        self.assertTrue(_should_ignore_directory("node_modules"))
        self.assertTrue(_should_ignore_directory("__pycache__"))
        self.assertTrue(_should_ignore_directory("venv"))
        self.assertFalse(_should_ignore_directory("src"))
        self.assertFalse(_should_ignore_directory("components"))

    def test_supported_extensions(self):
        self.assertIn(".py", SUPPORTED_EXTENSIONS)
        self.assertIn(".md", SUPPORTED_EXTENSIONS)
        self.assertIn(".ts", SUPPORTED_EXTENSIONS)
        self.assertNotIn(".png", SUPPORTED_EXTENSIONS)
        self.assertNotIn(".exe", SUPPORTED_EXTENSIONS)

    def test_small_file_single_chunk(self):
        with tempfile.NamedTemporaryFile("w+", suffix=".py", delete=False, encoding="utf-8") as f:
            f.write("line1\nline2\nline3\n")
            f_path = f.name

        try:
            chunks = chunk_file(f_path, "hello.py", "owner/repo", chunk_size=100, overlap=20)
            self.assertEqual(len(chunks), 1)
            self.assertEqual(chunks[0]["metadata"]["lines"], "1-3")
            self.assertEqual(chunks[0]["metadata"]["language"], "python")
            self.assertEqual(chunks[0]["metadata"]["type"], "code")
            self.assertEqual(chunks[0]["metadata"]["repo"], "owner/repo")
            self.assertEqual(chunks[0]["metadata"]["file_path"], "hello.py")
        finally:
            if os.path.exists(f_path):
                os.remove(f_path)

    def test_large_file_sliding_window_chunks(self):
        # 250 lines
        lines = [f"line_{i}\n" for i in range(1, 251)]
        segments = _chunk_lines(lines, chunk_size=100, overlap=20)

        # Chunk 1: 1-100 (step 80)
        # Chunk 2: 81-180 (step 80)
        # Chunk 3: 161-250
        self.assertEqual(len(segments), 3)
        self.assertEqual(segments[0][0], 1)
        self.assertEqual(segments[0][1], 100)
        self.assertEqual(segments[1][0], 81)
        self.assertEqual(segments[1][1], 180)
        self.assertEqual(segments[2][0], 161)
        self.assertEqual(segments[2][1], 250)

    def test_commit_chunk(self):
        commit = CommitInfo(
            hash="a1b2c3d4e5f6",
            author="Alice Dev",
            date="2026-09-15",
            message="Add user authentication and JWT handling",
            files_changed=["auth.py", "models.py"],
        )
        chunks = create_commit_chunks([commit], "owner/repo")
        self.assertEqual(len(chunks), 1)
        chunk = chunks[0]
        self.assertEqual(chunk["metadata"]["type"], "commit")
        self.assertEqual(chunk["metadata"]["commit_hash"], "a1b2c3d4e5f6")
        self.assertEqual(chunk["metadata"]["author"], "Alice Dev")
        self.assertEqual(chunk["metadata"]["repo"], "owner/repo")
        self.assertIn("Add user authentication", chunk["content"])
        self.assertIn("auth.py", chunk["content"])


if __name__ == "__main__":
    unittest.main()
