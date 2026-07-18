# DverseAI 🚀

**DverseAI** is a sleek, premium, developer-portfolio-grade AI chat application designed to connect users with multiple LLM providers (including GPT, Claude, Gemini, and Llama) through a unified interface. Built using a **FastAPI (Python)** backend and a **React/Vite (JavaScript)** frontend, the project showcases high-performance cloud database connection pooling, auto-failover LLM routing, containerized orchestration, and polished glassmorphic styling.

🔗 **GitHub Repository**: [dipkrraj/AI-Chat-App](https://github.com/dipkrraj/AI-Chat-App/tree/main)

---

## 🛠️ Tech Stack & Key Architectures

### 1. Frontend SPA (Single Page Application)
* **Framework**: React 18, Vite (Fast-build bundling toolchain)
* **Styling & UX**: Premium dark-mode glassmorphic theme using typography from *Outfit* and *Plus Jakarta Sans*. It includes responsive layouts that stack controls vertically on mobile viewports (e.g. Galaxy S8+ / iPhone) and custom CSS shimmer loading skeletons.
* **State Management**: Query client caching via TanStack React Query.

### 2. Backend API Services
* **Framework**: FastAPI (Python 3.9+)
* **Database / ORM**: SQLAlchemy 2.0 ORM with PostgreSQL (Neon serverless integration) & SQLite support.
* **Security & Auth**: Dual-layered sign-in supporting credentials (bcrypt hashing) and Google OAuth (Google Identity Services) secured with JSON Web Tokens (JWT) stored in HTTP cookies.

---

## 💎 Advanced Engineering Solutions Implemented

### 🔄 Dynamic Provider Failover Routing (100% Uptime)
To combat shared-quota rate limits (HTTP 429) and decommissioned model endpoints, the backend implements a programmatic failover mechanism. If a requested OpenRouter free model returns a rate limit, the API dynamically catches the exception and immediately routes the request to your stable **Llama 3.1 8B (Groq)** endpoint in a split-second backup transaction. The client is notified via a subtle warning note without interrupting their chat flow.

### 🗄️ Serverless Connection Pool Management (Neon PostgreSQL)
Serverless databases (like Neon or Supabase) spin down compute resources when idle. Standard SQLAlchemy connection pools keep connections open, resulting in socket timeouts (`OperationalError: SSL connection closed`) when the server wakes up.
* **The Solution**: We integrated connection recycling (`pool_recycle=300`) and active pool pre-pinging (`pool_pre_ping=True`). The connector automatically tests connection viability before sending a query, discarding stale sockets and reconnecting cleanly on database sleep wake-ups.

### 🧠 Intelligent Context Window Summarization
To keep tokens low and prevent context window exhaustion, the backend includes an automated dialog summarizer. When a chat session exceeds 8 messages, the backend compresses the first $N-5$ messages into a system-prompt summary card, appending the 5 most recent messages directly to preserve short-term chat memory.

### 🐳 SPA Nginx + Python Multi-Stage Containerization
* **Backend**: Docker container running FastAPI inside a virtual environment served on port `8000`.
* **Frontend**: Multi-stage Docker build that compiles Vite assets and hosts them inside a production-grade **Nginx** server block on port `80`, handling client-side SPA routing fallbacks natively.
* **Orchestration**: Fully configured `docker-compose.yml` to spin up both containers with a single command.

---

## ⚡ Quick Start Guide (Local Setup)

### Option 1: Using Docker Compose (Recommended)
1. **Copy the Environment Templates**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. **Fill in your secrets** in `backend/.env` (especially `GROQ_API_KEY`, `JWT_SECRET`, and optionally Google Client credentials).
3. **Spin up the containers**:
   ```bash
   docker compose up --build -d
   ```
4. **Access the application**:
   * Frontend: 👉 **`http://localhost`**
   * Backend API: `http://localhost:8000`

---

### Option 2: Running Locally (Manual Mode)

#### 1. Backend Service (FastAPI)
1. Navigate to the backend directory, create a virtual environment, and activate it:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize your environment:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### 2. Frontend React Client (Vite)
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Initialize environment parameters:
   ```bash
   cp .env.example .env
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Site is served at `http://localhost:5173`.*

---

## 🛡️ Security Audit Highlights
* **Google OAuth Validation**: Explicit client-id aud audits prevent token injection attacks.
* **Credential Hardening**: Hashed passwords with bcrypt and strict JWT expiration policies.
* **Dynamic CORS Mapping**: CORS origins dynamically resolved from environment keys.
* **Push Protection Squashing**: History squashed into a single root commit to remove leaked historical secrets, fully clearing GitHub Push Protection blocks.
