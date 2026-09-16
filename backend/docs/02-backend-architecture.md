# Backend Architecture
## Open Source Contributor Assistant

## 1. Architecture Overview

The backend of the Open Source Contributor Assistant is designed as a modular FastAPI application.

The backend is responsible for receiving a GitHub repository URL, cloning and processing the repository, extracting source code and commit history, creating searchable chunks, and connecting the processed data to the AI/RAG pipeline.

The overall project follows this pipeline:

```text
Repository Input
       ↓
Ingest & Parse
       ↓
Embed & Store
       ↓
AI Agent + RAG
       ↓
Grounded Answer
```

## 2. High-Level Backend Architecture

                    ┌───────────────────┐
                    │     Frontend      │
                    │ React / Next.js   │
                    └─────────┬─────────┘
                              │
                         HTTP / JSON
                              │
                              ▼
                    ┌───────────────────┐
                    │      FastAPI      │
                    │     API Layer     │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ Process Router   │      │ Chat Router      │
        │ /api/process     │      │ /api/chat        │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ Git Service      │      │ RAG Service      │
        │ GitPython        │      │ Retrieval + LLM  │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ File Extraction  │      │ Vector Database  │
        └────────┬─────────┘      │ ChromaDB/Qdrant   │
                 │                └────────┬─────────┘
                 ▼                         │
        ┌──────────────────┐               ▼
        │ Chunker          │            LLM
        └────────┬─────────┘               │
                 │                         ▼
                 └───────► Index ◄──── Grounded Answer

## 3. Backend Directory Structure

backend/
│
├── docs/
│   ├── 01-backend-requirements.md
│   ├── 02-backend-architecture.md
│   ├── 03-api-specification.md
│   └── 04-implementation-testing-plan.md
│
├── main.py
│
├── routers/
│   ├── process.py
│   └── chat.py
│
├── services/
│   ├── git_service.py
│   ├── chunker.py
│
├── requirements.txt
└── .env.example

## 4. Module Responsibilities

### 4.1 main.py

The main.py file is the entry point of the FastAPI backend.

Responsibilities:

Create the FastAPI application.
Configure CORS.
Register API routers.
Provide application-level configuration.
Provide a health-check endpoint.

The main application connects the process and chat routers.

### 4.2 routers/process.py

The process router handles repository-processing requests.

Responsibilities:

Receive the GitHub repository URL.
Validate the request.
Call the repository-processing services.
Process source files and commit history.
Send generated chunks to the indexing layer.
Return processing statistics.

Endpoint:

POST /api/process

### 4.3 routers/chat.py

The chat router handles questions about the processed repository.

Responsibilities:

1. Receive the user's question.
2. Validate the request.
3. Call the RAG service.
4. Retrieve relevant repository context.
5. Generate an answer.
6. Return the answer and source information.

Endpoint:

POST /api/chat
4.4 services/git_service.py

The Git service is responsible for interacting with GitHub repositories.

Responsibilities:

Validate GitHub repository URLs.
Extract repository owner and name.
Clone repositories using GitPython.
Manage temporary repository directories.
Extract repository metadata.
Extract commit history.
Extract changed files from commits.

### 4.5 services/chunker.py

The chunker is responsible for converting repository content into manageable searchable chunks.

Responsibilities:

1. Walk through the repository directory.
2. Identify supported text-based files.
3. Ignore unnecessary directories.
4. Skip binary files.
5. Read file contents.
6. Split large files into chunks.
7. Track line ranges.
8. Generate metadata for each chunk.

Example chunk:

{
  "content": "def authenticate_user(...):",
  "metadata": {
    "file_path": "src/auth.py",
    "repo": "owner/repository",
    "lines": "1-100",
    "language": "python",
    "type": "code"
  }
}


### 4.6 services/indexer.py

The indexer connects the repository-processing layer with the vector database.

Responsibilities:

1. Receive processed chunks.
2. Generate or manage embeddings.
3. Store chunks and metadata in the vector database.
4. Perform semantic similarity searches.
5. Return relevant chunks for the RAG pipeline.

Possible vector databases:

1. ChromaDB
2. Qdrant

### 4.7 services/rag.py

The RAG service handles retrieval and AI answer generation.

Responsibilities:

Receive the user's question.
Search the vector database.
Retrieve the most relevant repository chunks.
Construct the context for the LLM.
Send the context and question to the LLM.
Generate a grounded answer.
Return the answer with relevant sources.

## 5. Repository Processing Flow

User
 │
 │ GitHub Repository URL
 ▼
POST /api/process
 │
 ▼
Validate URL
 │
 ▼
Clone Repository
 │
 ▼
Extract Repository Files
 │
 ├───────────────┐
 ▼               ▼
Source Files   Commit History
 │               │
 ▼               ▼
File Chunking  Commit Chunking
 │               │
 └───────┬───────┘
         ▼
   Combined Chunks
         │
         ▼
    Indexer Service
         │
         ▼
    Vector Database

## 6. Chat  Flow

User Question
      │
      ▼
POST /api/chat
      │
      ▼
RAG Service
      │
      ▼
Vector Similarity Search
      │
      ▼
Relevant Repository Chunks
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

## 7. Chunk Data Model

### Source-Code Chunk
Each source-code chunk contains the actual content and metadata describing its origin.

{
  "content": "def login_user(username, password):",
  "metadata": {
    "file_path": "src/auth.py",
    "repo": "owner/repository",
    "lines": "10-45",
    "language": "python",
    "type": "code"
  }
}

### Commit Chunk
Commit information is represented as a searchable chunk.

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

### 8. Service Interaction
The backend follows a separation-of-concerns approach.

The API routers should handle requests and responses, while the service modules contain the actual processing logic.

Router
   ↓
Service
   ↓
Processing Logic
   ↓
External System / Data

For repository processing:

process.py
    ↓
git_service.py
    ↓
chunker.py
    ↓
indexer.py

For chat:

chat.py
    ↓
rag.py
    ↓
indexer.py
    ↓
Vector Database
    ↓
LLM

## 9. Person B and Person C Integration

### Person B — Backend & Repository Processing
Person B handles:

GitHub Repository
        ↓
Repository Cloning
        ↓
File Extraction
        ↓
File Chunking
        ↓
Commit Extraction
        ↓
Processed Chunks

### Person C — AI / RAG Pipeline

Person C handles:

Processed Chunks
        ↓
Embeddings
        ↓
Vector Database
        ↓
Semantic Retrieval
        ↓
LLM
        ↓
Grounded Answer

The interface between the two modules should remain simple.

The indexing layer should expose a function similar to:

index_chunks(chunks)

The retrieval layer should expose a function similar to:

query(question, n_results=5)

This allows both team members to work independently and integrate their modules later.

## 10. Temporary Repository Storage

Repositories should initially be cloned into temporary directories.

After processing is completed, temporary repository data should be removed when it is no longer required.

This prevents unnecessary disk usage and keeps the prototype lightweight.

## 11. Configuration

Configuration values and API keys should be stored using environment variables.

Example:

LLM_API_KEY=
MAX_REPO_SIZE_MB=100
MAX_FILES=500
MAX_COMMITS=100
CHUNK_SIZE=100
CHUNK_OVERLAP=20

Sensitive information such as API keys must not be committed to the repository.

## 12. Error Handling

The architecture should provide error handling at both the API and service levels.

Possible errors include:

Invalid GitHub URL
Repository not found
Repository inaccessible
Repository too large
Clone failure
File reading failure
Unsupported file
Binary file
Empty repository
Chunking failure
Vector database failure
LLM failure

The API should return clear error messages and appropriate HTTP status codes.

## 13. Future Extensibility

The architecture should allow individual technologies to be replaced without rewriting the entire application.

Possible future replacements include:

GitPython
    ↓
GitHub API

ChromaDB
    ↓
Qdrant

Sentence Transformers
    ↓
BGE

GPT
    ↓
Llama / Qwen

The modular structure allows the repository-processing and AI/RAG components to evolve independently.

## 14. Architecture Goal

The goal of the backend architecture is to create a clean and modular pipeline:

GitHub URL
    ↓
Clone
    ↓
Extract
    ↓
Chunk
    ↓
Index
    ↓
Retrieve
    ↓
Generate
    ↓
Grounded Answer

This architecture supports the project's objective of turning repository exploration into a natural-language conversation.
