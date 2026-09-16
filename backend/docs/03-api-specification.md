# API Specification

## Open Source Contributor Assistant

## 1. API Overview

The backend provides REST APIs using FastAPI.

The APIs act as the communication layer between the frontend, repository-processing services, and AI/RAG pipeline.

### Base URL

```text
http://localhost:8000
```

### API Documentation

FastAPI automatically provides interactive API documentation at:

```text
http://localhost:8000/docs
```

---

## 2. Health Check API

### GET `/health`

Checks whether the backend server is running.

### Request

No request body is required.

### Response

```json
{
  "status": "ok"
}
```

### HTTP Status

```text
200 OK
```

---

## 3. Process Repository API

### POST `/api/process`

Processes a GitHub repository and prepares its contents for the AI/RAG pipeline.

### Purpose

This endpoint receives a GitHub repository URL and performs the following operations:

1. Validates the repository URL.
2. Clones the repository.
3. Extracts supported source-code and documentation files.
4. Skips unnecessary and binary files.
5. Extracts commit history.
6. Creates searchable chunks.
7. Sends the chunks to the indexing layer.
8. Returns repository processing statistics.

### Request

#### Content-Type

```text
application/json
```

#### Request Body

```json
{
  "repo_url": "https://github.com/owner/repository"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `repo_url` | string | Yes | Public GitHub repository URL |

### Successful Response

#### HTTP 200

```json
{
  "success": true,
  "message": "Repository processed successfully",
  "repo_name": "repository",
  "repo_url": "https://github.com/owner/repository",
  "files_processed": 42,
  "commits_processed": 100,
  "chunks_created": 315
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Indicates whether processing succeeded |
| `message` | string | Human-readable processing result |
| `repo_name` | string | Name of the processed repository |
| `repo_url` | string | Repository URL |
| `files_processed` | integer | Number of files successfully processed |
| `commits_processed` | integer | Number of commits extracted |
| `chunks_created` | integer | Total number of chunks generated |

### Invalid Repository URL

#### HTTP 400

```json
{
  "success": false,
  "error": "Invalid GitHub repository URL"
}
```

This response is returned when the provided URL is not a valid GitHub repository URL.

### Repository Not Found

#### HTTP 404

```json
{
  "success": false,
  "error": "Repository not found or inaccessible"
}
```

This response is returned when the repository does not exist or cannot be accessed.

### Repository Too Large

#### HTTP 413

```json
{
  "success": false,
  "error": "Repository exceeds the configured processing limit"
}
```

This response is returned when the repository exceeds the configured file-count or size limit.

### Repository Processing Failure

#### HTTP 500

```json
{
  "success": false,
  "error": "Failed to process repository"
}
```

This response is returned when an unexpected error occurs during cloning, extraction, chunking, or indexing.

---

## 4. Chat API

### POST `/api/chat`

Answers natural-language questions about the processed GitHub repository.

### Purpose

This endpoint:

1. Receives the user's question.
2. Sends the question to the RAG pipeline.
3. Retrieves relevant repository chunks.
4. Builds the required context.
5. Sends the context to the LLM.
6. Generates a grounded answer.
7. Returns the answer with relevant sources.

### Request

#### Content-Type

```text
application/json
```

#### Request Body

```json
{
  "question": "Where is authentication implemented?"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `question` | string | Yes | Natural-language question about the repository |

### Successful Response

#### HTTP 200

```json
{
  "success": true,
  "answer": "Authentication is implemented in src/auth.py. The main authentication logic is handled by the authentication functions in this file.",
  "sources": [
    {
      "file": "src/auth.py",
      "lines": "10-45",
      "type": "code"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Indicates whether the request succeeded |
| `answer` | string | Generated answer from the RAG pipeline |
| `sources` | array | Repository sources used to generate the answer |

---

## 5. Source Object

Each source identifies the repository information used to answer the question.

### Code Source

```json
{
  "file": "src/auth.py",
  "lines": "10-45",
  "type": "code"
}
```

### Commit Source

```json
{
  "commit": "abc123",
  "author": "Developer",
  "date": "2026-09-01",
  "type": "commit"
}
```

---

## 6. Empty Question

### HTTP 400

```json
{
  "success": false,
  "error": "Question cannot be empty"
}
```

This response is returned when the question field is empty or contains only whitespace.

---

## 7. No Repository Processed

### HTTP 400

```json
{
  "success": false,
  "error": "Please process a repository before asking questions"
}
```

This response is returned when the user attempts to ask a question before repository data has been indexed.

---

## 8. RAG Processing Failure

### HTTP 500

```json
{
  "success": false,
  "error": "Failed to generate an answer"
}
```

This response is returned when retrieval, vector database access, or LLM generation fails.

---

## 9. API Processing Flow

### Repository Processing

```text
Frontend
   │
   │ POST /api/process
   ▼
FastAPI
   │
   ▼
Validate Repository URL
   │
   ▼
Clone Repository
   │
   ▼
Extract Files
   │
   ▼
Extract Commits
   │
   ▼
Create Chunks
   │
   ▼
Index Chunks
   │
   ▼
Vector Database
   │
   ▼
Processing Response
```

### Chat Processing

```text
Frontend
   │
   │ POST /api/chat
   ▼
FastAPI
   │
   ▼
RAG Service
   │
   ▼
Vector Search
   │
   ▼
Relevant Chunks
   │
   ▼
Context Construction
   │
   ▼
LLM
   │
   ▼
Answer + Sources
   │
   ▼
Frontend
```

---

## 10. Example API Usage

### Process a Repository

#### cURL

```bash
curl -X POST "http://localhost:8000/api/process" \
  -H "Content-Type: application/json" \
  -d "{\"repo_url\":\"https://github.com/owner/repository\"}"
```

### Ask a Question

#### cURL

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"Where is authentication implemented?\"}"
```

---

## 11. Example Questions

The chat API should support questions such as:

- Where is JWT authentication implemented?
- How does the login system work?
- Which file handles database connections?
- When was the payment module added?
- Who contributed to the authentication module?
- What changed in the latest commits?
- Show the evolution of a particular module.
- Where is a specific function defined?

These questions cover source-code search as well as commit-history understanding.

---

## 12. API Design Principles

The backend APIs follow these principles:

- Use REST-style HTTP endpoints.
- Use JSON for requests and responses.
- Validate incoming data using Pydantic models.
- Return appropriate HTTP status codes.
- Provide meaningful error messages.
- Keep business logic outside the API route handlers.
- Keep API keys and secrets outside the source code.
- Return source metadata for grounded AI responses.
- Keep repository processing and RAG logic modular.

---

## 13. Future API Extensions

The following endpoints may be added in future versions:

```text
GET  /api/status
GET  /api/repository
GET  /api/files
GET  /api/commits
POST /api/search
POST /api/analyze/diff
POST /api/analyze/pr
```

These endpoints are not required for the initial prototype.

---

## 14. API Definition of Done

The API implementation is considered complete for the initial prototype when:

- [ ] `GET /health` works.
- [ ] `POST /api/process` accepts a GitHub URL.
- [ ] Repository validation works.
- [ ] Repository processing works.
- [ ] Processing statistics are returned.
- [ ] `POST /api/chat` accepts a question.
- [ ] Relevant repository context is retrieved.
- [ ] An LLM-generated answer is returned.
- [ ] Source information is returned with the answer.
- [ ] Invalid requests return meaningful errors.
- [ ] APIs can be tested through FastAPI Swagger UI.