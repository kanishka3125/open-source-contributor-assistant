# Implementation & Testing Plan

## Open Source Contributor Assistant

## 1. Objective

The objective of this implementation plan is to develop a functional backend prototype capable of processing a public GitHub repository and providing repository-aware conversational responses.

The implementation is divided into sequential phases so that each component can be developed and tested before moving to the next stage.

---

## 2. Implementation Phases

### Phase 1 — Project Setup

#### Tasks

- [ ] Create the `backend` directory.
- [ ] Create a Python virtual environment.
- [ ] Create `requirements.txt`.
- [ ] Install FastAPI.
- [ ] Install Uvicorn.
- [ ] Install GitPython.
- [ ] Install Pydantic.
- [ ] Install `python-dotenv`.
- [ ] Configure `.env`.
- [ ] Configure `.gitignore`.

#### Expected Structure

```text
backend/
├── docs/
├── main.py
├── routers/
├── services/
├── requirements.txt
└── .env.example
```

#### Test

Run:

```bash
uvicorn main:app --reload
```

Verify that the server is available at:

```text
http://localhost:8000
```

and that the API documentation is available at:

```text
http://localhost:8000/docs
```

---

### Phase 2 — FastAPI Application

#### Tasks

- [ ] Create the FastAPI application.
- [ ] Configure CORS.
- [ ] Create the health-check endpoint.
- [ ] Create the process router.
- [ ] Create the chat router.
- [ ] Register the routers with the main application.

#### Test

Request:

```text
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

### Phase 3 — GitHub URL Validation

#### Tasks

- [ ] Accept the repository URL.
- [ ] Verify that the URL belongs to GitHub.
- [ ] Extract the repository owner and name.
- [ ] Validate the repository format.
- [ ] Reject malformed URLs.

#### Test Cases

Valid URL:

```text
https://github.com/owner/repository
```

Invalid URL:

```text
hello
```

Non-GitHub URL:

```text
https://example.com/repository
```

Incomplete URL:

```text
https://github.com/
```

---

### Phase 4 — Repository Cloning

#### Tasks

- [ ] Implement repository cloning using GitPython.
- [ ] Create a temporary directory.
- [ ] Clone the repository into the temporary directory.
- [ ] Detect cloning errors.
- [ ] Return repository metadata.
- [ ] Clean the temporary directory after processing.

#### Test

Use a small public GitHub repository.

Expected result:

```text
Repository cloned successfully.
```

---

### Phase 5 — Repository Limits

#### Tasks

- [ ] Count repository files.
- [ ] Check repository size.
- [ ] Configure a maximum file limit.
- [ ] Configure a maximum repository size.
- [ ] Stop processing repositories that exceed the configured limits.

#### Initial Limits

```text
Maximum repository size: 100 MB
Maximum files: 500
Maximum commits: 100
```

These values may be adjusted during testing.

---

### Phase 6 — File Extraction

#### Tasks

- [ ] Walk through the cloned repository.
- [ ] Identify supported text-based files.
- [ ] Read file contents.
- [ ] Detect programming languages.
- [ ] Skip binary files.
- [ ] Ignore unnecessary directories.

#### Directories to Ignore

```text
.git
node_modules
__pycache__
venv
.venv
dist
build
```

#### Example Supported Files

```text
.py
.js
.jsx
.ts
.tsx
.java
.go
.cpp
.c
.h
.md
.txt
.json
.yaml
.yml
.html
.css
```

#### Test

Verify that source files such as:

```text
src/main.py
README.md
package.json
```

are processed.

Verify that unnecessary content such as:

```text
.git/
node_modules/
image.png
```

is skipped.

---

### Phase 7 — File Chunking

#### Tasks

- [ ] Create a standard chunk data structure.
- [ ] Process small files as single chunks where appropriate.
- [ ] Split large files into smaller chunks.
- [ ] Add line ranges.
- [ ] Add file path metadata.
- [ ] Add repository metadata.
- [ ] Add language metadata.
- [ ] Add content type metadata.

#### Initial Chunking Strategy

```text
Chunk size: 100 lines
Chunk overlap: 20 lines
```

#### Example

```json
{
  "content": "def login_user(username, password):",
  "metadata": {
    "file_path": "src/auth.py",
    "repo": "owner/repository",
    "lines": "1-100",
    "language": "python",
    "type": "code"
  }
}
```

---

### Phase 8 — Commit History Extraction

#### Tasks

- [ ] Access Git history using GitPython.
- [ ] Extract the latest 100 commits.
- [ ] Extract commit hash.
- [ ] Extract author.
- [ ] Extract date.
- [ ] Extract commit message.
- [ ] Extract changed files.
- [ ] Convert commit information into searchable chunks.

#### Example Commit Chunk

```json
{
  "content": "Added authentication module and updated login routes.",
  "metadata": {
    "repo": "owner/repository",
    "type": "commit",
    "commit_hash": "abc123",
    "author": "Developer",
    "date": "2026-09-01"
  }
}
```

---

### Phase 9 — Process Repository Endpoint

#### Tasks

- [ ] Create `routers/process.py`.
- [ ] Create the repository request model.
- [ ] Validate the repository URL.
- [ ] Call the Git service.
- [ ] Extract repository files.
- [ ] Create source-code chunks.
- [ ] Extract commit history.
- [ ] Create commit chunks.
- [ ] Combine all chunks.
- [ ] Send chunks to the indexing layer.
- [ ] Return processing statistics.

#### Endpoint

```text
POST /api/process
```

#### Expected Flow

```text
GitHub URL
    ↓
Validation
    ↓
Clone Repository
    ↓
Extract Files
    ↓
Extract Commits
    ↓
Create Chunks
    ↓
Index Chunks
    ↓
Return Statistics
```

---

### Phase 10 — RAG Integration

The repository-processing backend will connect to the AI/RAG pipeline developed by Person C.

#### Required Interface

The indexing layer should provide:

```python
index_chunks(chunks)
```

The retrieval layer should provide:

```python
query(question, n_results=5)
```

#### Integration Flow

```text
Person B
Repository
    ↓
File + Commit Chunks
    ↓
Person C
Indexer
    ↓
Embeddings
    ↓
Vector Database
```

---

### Phase 11 — Chat Endpoint

#### Tasks

- [ ] Create `routers/chat.py`.
- [ ] Create the chat request model.
- [ ] Validate the question.
- [ ] Call the RAG service.
- [ ] Retrieve relevant repository chunks.
- [ ] Generate the answer using the LLM.
- [ ] Return the answer.
- [ ] Return source information.

#### Endpoint

```text
POST /api/chat
```

#### Expected Flow

```text
User Question
      ↓
POST /api/chat
      ↓
RAG Service
      ↓
Vector Search
      ↓
Relevant Chunks
      ↓
LLM
      ↓
Answer + Sources
```

---

## 3. Error Handling Tests

The following cases should be tested:

| Test Case | Expected Result |
|---|---|
| Invalid GitHub URL | HTTP 400 |
| Non-GitHub URL | HTTP 400 |
| Repository not found | HTTP 404 |
| Repository inaccessible | HTTP 404 |
| Repository too large | HTTP 413 |
| Too many files | HTTP 413 |
| Clone failure | HTTP 500 |
| Empty repository | Meaningful error |
| Binary file | File skipped |
| Unsupported file | File skipped |
| Empty question | HTTP 400 |
| Repository not processed | HTTP 400 |
| Vector database failure | HTTP 500 |
| LLM failure | HTTP 500 |
| Missing API key | Configuration error |

---

## 4. API Testing

### Test 1 — Health Check

Request:

```text
GET /health
```

Expected:

```json
{
  "status": "ok"
}
```

---

### Test 2 — Process Repository

Request:

```text
POST /api/process
```

Body:

```json
{
  "repo_url": "https://github.com/owner/repository"
}
```

Verify:

```text
✓ Repository URL validated
✓ Repository cloned
✓ Files extracted
✓ Unnecessary files skipped
✓ Chunks created
✓ Commits extracted
✓ Chunks indexed
✓ Processing statistics returned
```

---

### Test 3 — Code Question

Question:

```text
Where is authentication implemented?
```

Verify that the answer identifies the relevant file and provides source information where available.

---

### Test 4 — Function Question

Question:

```text
Where is the login function defined?
```

Verify that the response identifies the relevant source file and line range where available.

---

### Test 5 — Commit Question

Question:

```text
When was the authentication module added?
```

Verify that the response uses relevant commit information.

---

### Test 6 — Latest Changes

Question:

```text
What changed in the latest commits?
```

Verify that relevant commit chunks are retrieved.

---

## 5. End-to-End Testing

A small public GitHub repository should be used for the initial end-to-end test.

### Complete Flow

```text
User
 ↓
Enter GitHub URL
 ↓
POST /api/process
 ↓
Clone Repository
 ↓
Extract Files
 ↓
Extract Commits
 ↓
Create Chunks
 ↓
Generate Embeddings
 ↓
Store in Vector Database
 ↓
Repository Ready
 ↓
User Asks Question
 ↓
POST /api/chat
 ↓
Retrieve Relevant Chunks
 ↓
LLM Generation
 ↓
Answer + Sources
```

---

## 6. Frontend Integration Testing

Person A will connect the frontend to the backend APIs.

### Repository Processing

```text
Frontend
   ↓
POST /api/process
   ↓
Backend
   ↓
Processing Response
   ↓
Frontend
```

### Chat

```text
Frontend
   ↓
POST /api/chat
   ↓
Backend
   ↓
RAG Response
   ↓
Frontend
```

The frontend should display:

- Repository processing status.
- Repository information after processing.
- User messages.
- Assistant responses.
- Source files and line ranges where available.
- Error messages when requests fail.

---

## 7. Final Backend Checklist

### FastAPI

- [ ] FastAPI application works.
- [ ] CORS is configured.
- [ ] `/health` works.
- [ ] `/api/process` works.
- [ ] `/api/chat` works.

### Repository Processing

- [ ] GitHub URL validation works.
- [ ] Repository cloning works.
- [ ] Repository limits are enforced.
- [ ] File extraction works.
- [ ] Binary files are skipped.
- [ ] Unnecessary directories are skipped.
- [ ] File chunking works.
- [ ] Chunk metadata is generated.
- [ ] Commit history is extracted.
- [ ] Commit chunks are generated.

### RAG Integration

- [ ] Chunks are passed to the indexer.
- [ ] Vector database connection works.
- [ ] Semantic retrieval works.
- [ ] LLM integration works.
- [ ] Answers are grounded in retrieved context.
- [ ] Source information is returned.

### Reliability

- [ ] Error handling works.
- [ ] Environment variables are configured.
- [ ] API keys are not committed.
- [ ] Temporary repositories are cleaned up.
- [ ] API endpoints are tested through Swagger UI.
- [ ] End-to-end testing is completed.

---

## 8. Definition of Done

The backend prototype is considered functional when a user can:

1. Submit a public GitHub repository URL.
2. Successfully process the repository.
3. Extract source-code and documentation files.
4. Extract commit history.
5. Generate searchable chunks.
6. Index the chunks.
7. Ask a natural-language question.
8. Retrieve relevant repository context.
9. Receive an LLM-generated answer.
10. View the relevant source files or commits used to generate the answer.

---

## 9. Current Development Priority

The implementation should prioritize the core repository-to-answer pipeline before optional features.

### Priority Order

```text
1. FastAPI Setup
        ↓
2. GitHub Repository Cloning
        ↓
3. File Extraction
        ↓
4. File Chunking
        ↓
5. Commit Extraction
        ↓
6. /api/process
        ↓
7. RAG Integration
        ↓
8. /api/chat
        ↓
9. Error Handling
        ↓
10. End-to-End Testing
```

Optional features such as authentication, advanced status tracking, pull-request analysis, architecture visualization, and deployment automation can be added later.