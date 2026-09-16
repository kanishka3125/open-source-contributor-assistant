# Open Source Contributor Assistant

An AI-powered assistant that understands an entire GitHub repository — including source code, documentation, and commit history — and answers questions about it in plain English.

## 🚀 Overview

Developers often spend significant time searching through source files, documentation, and commit history to understand how a project works, where a feature was implemented, or when and why a change was introduced.

**Open Source Contributor Assistant** simplifies this process by allowing users to provide a GitHub repository URL and interact with the repository through natural-language questions.

The system processes the repository, extracts relevant code and commit information, converts the content into searchable chunks, stores embeddings in a vector database, and uses Retrieval-Augmented Generation (RAG) to produce grounded answers.

## ✨ Features

- 🔗 GitHub repository URL input
- 📦 Automatic repository cloning and processing
- 📄 Source-code and documentation extraction
- ✂️ Intelligent text chunking
- 📝 Git commit history extraction
- 🔎 Semantic search using vector embeddings
- 🧠 Retrieval-Augmented Generation (RAG)
- 💬 Natural-language chat with the repository
- 📍 Source-aware answers with file and line references
- ⚡ FastAPI backend for processing and chat APIs

## 🏗️ System Architecture

```text
GitHub Repository
        │
        ▼
┌─────────────────────┐
│ Repository Processor│
│ GitPython / GitHub  │
│ API                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ File Extraction &   │
│ Chunking             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Embeddings           │
│ Sentence Transformers│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Vector Database      │
│ ChromaDB / Qdrant    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ RAG Retrieval        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ LLM                  │
│ GPT / Llama / Qwen   │
└──────────┬──────────┘
           │
           ▼
      Grounded Answer
```

🔄 How It Works
1. Repository Input

The user provides a public GitHub repository URL.

2. Repository Processing

The backend clones the repository and extracts:

1. Source-code files
2. Markdown and documentation files
3. Configuration files
4. Git commit history
5. Changed-file information

Binary files and unnecessary directories such as .git, node_modules, dist, build, and virtual environments are ignored.

3. Chunking

Large files are divided into smaller chunks so that relevant sections can be retrieved efficiently.

Each chunk contains content along with metadata such as:

file_path
repository
line_range
language
content_type

Commit information is also represented as searchable chunks.

4. Embedding & Indexing

The extracted chunks are converted into vector embeddings and stored in a vector database.

The prototype uses:

Sentence Transformers / BGE embeddings
ChromaDB or Qdrant
5. Retrieval

When a user asks a question, the system performs semantic retrieval and identifies the most relevant code, documentation, or commit-history chunks.

6. LLM Generation

The retrieved context is provided to an LLM, which generates an answer grounded in the repository content.

The system is instructed not to invent information when the repository does not contain enough evidence.

## 💬 Example Questions

The assistant can answer questions such as:

- Where is JWT authentication implemented?
- How does the login system work?
- Which file handles database connections?
- When was the payment module added?
- Who contributed to the authentication module?
- What changed in the latest commits?
- Show the evolution of a particular module.
- Where is a specific function defined?

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- GitPython

### AI / ML
- Sentence Transformers / BGE
- Retrieval-Augmented Generation (RAG)
- LLMs such as GPT, Llama, or Qwen

### Vector Database
- ChromaDB
- Qdrant

### Frontend
- React / Next.js
- Tailwind CSS

### Development & Deployment
- Git
- GitHub
- Docker

---

## 📁 Project Structure

```text
open-source-contributor-assistant/
│
├── backend/
│   ├── main.py
│   │
│   ├── routers/
│   │   ├── process.py
│   │   └── chat.py
│   │
│   ├── services/
│   │   ├── git_service.py
│   │   ├── chunker.py
│   │   ├── indexer.py
│   │   └── rag.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│
├── README.md
├── .gitignore
└── docker-compose.yml
```
🔌 API Endpoints
Process Repository
POST /api/process

Request:
```
{
  "repo_url": "https://github.com/owner/repository"
}
```
This endpoint:

Validates the repository URL
Clones the repository
Extracts source files and documentation
Extracts commit history
Chunks the extracted content
Sends the chunks for indexing
Chat
POST /api/chat

Request:
```
{
  "question": "Where is authentication implemented?"
}
```
The endpoint retrieves relevant repository context and generates an AI-powered response.

⚙️ Local Setup
```
Clone the repository
git clone https://github.com/YOUR_USERNAME/open-source-contributor-assistant.git
cd open-source-contributor-assistant
Create a virtual environment
python -m venv venv
```
Activate it on Windows:
```
venv\Scripts\activate
Install backend dependencies
cd backend
pip install -r requirements.txt
Configure environment variables

Create a .env file:

LLM_API_KEY=your_api_key_here

Add other required configuration values as the project develops.

Run the FastAPI server
uvicorn main:app --reload

The backend will be available at:

http://localhost:8000

FastAPI documentation:

http://localhost:8000/docs
```
🧪 Testing

The backend can be tested using:

FastAPI Swagger UI
Postman
cURL
Frontend integration

A small public GitHub repository can be used initially to test the complete pipeline.

🎯 Project Goal

The goal of this project is to transform repository exploration from a manual code-search process into a natural-language conversation.

Instead of manually searching through hundreds of files and commits, contributors can ask questions and receive context-aware answers grounded in the repository.

🔮 Future Scope

Planned extensions include:

Pull request analysis
Bug-origin detection
Automatic documentation generation
Architecture visualization
Multi-repository support
VS Code extension

👥 Team
```
Hritika Roy - Frontend & API Integration
Kanishka Sharma - Backend & Repository Processing
Hari Pooreni Balaji - AI / RAG Pipeline
```
📌 Project Status

🚧 Currently under development

The current prototype focuses on repository ingestion, source-code and commit processing, vector indexing, RAG-based retrieval, and conversational querying.

📄 Academic Project

Open Source AI Contributor Assistant

Machine Learning Project
B.Tech CSE (AI/ML)

SRM Institute of Science and Technology, Ramapuram
