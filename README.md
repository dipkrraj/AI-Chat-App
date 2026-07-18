# Dp AI Chat Platform 🚀

A sleek, premium, minimal AI chatbot platform built using a FastAPI backend and a React/Vite frontend. It includes beautiful custom layouts, JWT + Google OAuth authentication, multi-tenant database separation, and automated context summarization for long chat sessions.

---

## 🛠️ Tech Stack & Features

*   **Frontend**: React (Vite), Tailwind CSS, Lucide icons, dynamic typing streams, and glassmorphic designs.
*   **Backend**: FastAPI (Python), SQLite (SQLAlchemy ORM), JWT Authentication, passlib security.
*   **LLM integration**: Supports Groq and OpenRouter models (Default: Llama 3.1 8B).
*   **Memory**: Smart history summarizer compresses thread logs after 8 messages to conserve tokens while preserving short-term context.

---

## ⚡ Getting Started

### Option 1: Run with Docker Compose (Recommended)

To run the entire application using containers in one command, ensure you have [Docker](https://www.docker.com/) installed, then follow these steps:

1.  **Copy environment templates**:
    ```bash
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```
2.  **Fill in your API Keys** inside `backend/.env` (especially `GROQ_API_KEY`, `JWT_SECRET`, and optionally Google Client credentials).
3.  **Spin up the container environment**:
    ```bash
    docker compose up --build -d
    ```
4.  Access the web application at:
    👉 **`http://localhost`** (API runs on `http://localhost:8000`)

---

### Option 2: Run Locally (Manual Mode)

#### 1. Backend Setup (FastAPI)
1.  Navigate into the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Copy and fill out the environment file:
    ```bash
    cp .env.example .env
    ```
5.  Start the FastAPI server:
    ```bash
    uvicorn app.main:app --reload
    ```
    *The API will start running on `http://127.0.0.1:8000`.*

#### 2. Frontend Setup (React/Vite)
1.  Navigate into the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Copy and fill out the environment file:
    ```bash
    cp .env.example .env
    ```
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The site will start running on **`http://localhost:5173`**.*

---

## 🔑 Environment Settings

Ensure you configure these inside your `backend/.env` file:
*   `GROQ_API_KEY`: Your Groq platform access key.
*   `JWT_SECRET`: A secure random hash key used to encode cookies. Generate one using:
    ```bash
    openssl rand -hex 32
    ```
*   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Obtained from Google Cloud Console under OAuth 2.0 Credentials if using Google Sign-in.
