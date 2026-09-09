# ScriptContinuity Agent 🎬

> Catch every continuity error before you shoot.

An intelligent cinematic agent that automates the tedious part of script supervision. Filmmakers upload their screenplay (PDF), and our AI agent reads it scene-by-scene, extracts character/prop/weather states, builds a continuity database, and flags contradictions before they cost a reshoot.

Built for **Agentic Cinema: The Blockbuster Hackathon**.

## ✨ Features

### Frontend (React + Vite)
- **Cinematic Aesthetic**: A modern, vibrant, glassmorphic design system using the cutting-edge **Tailwind CSS v4**.
- **Interactive 3D**: Integrates Three.js / React Three Fiber for an interactive, geometric background sphere that reacts to the application's state.
- **Real-Time Agent Terminal**: Watch the AI analyze your script scene-by-scene via a live Server-Sent Events (SSE) streaming terminal.
- **Interactive Continuity Reports**: View side-by-side script excerpts highlighting exact locations of major and minor continuity contradictions (props, wardrobe, weather, timelines).

### Backend (Python + FastAPI)
- **PDF Screenplay Parsing**: Robust ingestion of screenplay PDFs, accurately splitting them into distinct scenes based on standard sluglines (INT/EXT).
- **Gemini Agent Engine**: Leverages Google Gemini to extract structured JSON data (characters, props, wardrobe, weather, time) from raw scene text.
- **SQLite Continuity Store**: Maintains a running database of extracted facts as the script is processed chronologically.
- **Asynchronous Streaming**: Employs FastAPI's `EventSourceResponse` to push live analysis updates and progress to the frontend over SSE.

## 🚀 Live Demo
- **Frontend**: [https://scriptcontinuity-frontend.onrender.com](https://scriptcontinuity-frontend.onrender.com)
- **Backend**: [https://scriptconitnuity-backend.onrender.com](https://scriptconitnuity-backend.onrender.com)

## 🛠 Local Setup

### Prerequisites
- Node.js (v18+)
- Python 3.12+
- Gemini API Key

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⚙️ Deployment
This project is configured for automated Infrastructure-as-Code deployment to **Render** via the included `render.yaml` Blueprint.

1. Connect the repository to Render via Blueprint.
2. Render will automatically provision the Python Web Service and the React Static Site.
3. Ensure you add `GEMINI_API_KEY` and `PYTHON_VERSION=3.12.0` to the Backend's Environment Variables.

## 🧠 Built With
- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, Three.js, Lucide React
- **Backend**: Python, FastAPI, Uvicorn, Google Gemini API, SSE, SQLite
- **Deployment**: Render
