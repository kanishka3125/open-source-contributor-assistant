# Backend Requirements
## Open Source Contributor Assistant

## 1. Overview

The Open Source Contributor Assistant is an AI-powered system that allows developers to understand a GitHub repository through natural-language questions.

The backend is responsible for receiving a GitHub repository URL, cloning and processing the repository, extracting source code, documentation and commit history, converting the extracted information into searchable chunks, and exposing APIs for repository processing and conversational querying.

The backend acts as the bridge between the frontend application and the AI/RAG pipeline.

---

## 2. Backend Objectives

The backend must:

1. Accept a public GitHub repository URL.
2. Validate the repository URL.
3. Clone the repository safely into a temporary directory.
4. Extract relevant source-code and documentation files.
5. Ignore unnecessary and binary files.
6. Split large files into manageable chunks.
7. Attach useful metadata to every chunk.
8. Extract Git commit history.
9. Convert commit information into searchable chunks.
10. Pass processed chunks to the AI/RAG indexing layer.
11. Provide an API for asking questions about the processed repository.
12. Return grounded responses and relevant source information.
13. Handle invalid input and processing errors gracefully.

---

## 3. Functional Requirements

### FR-01: Repository URL Input

The backend shall accept a GitHub repository URL through the repository processing API.

Example:

```json
{
  "repo_url": "https://github.com/owner/repository"
}