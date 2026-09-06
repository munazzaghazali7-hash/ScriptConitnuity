# Script Continuity Agent

An AI-powered pipeline designed to catch continuity errors in screenplays before production begins. 
It features a fast, robust Python/FastAPI backend and a beautiful React + Vite frontend.

## ✨ Features

### Frontend (React + Vite)
- **Dark-Mode First Aesthetic**: A modern, vibrant, glassmorphic design inspired by Localcan.
- **Real-Time Agent Terminal**: Watch the AI analyze your script scene-by-scene via a live Server-Sent Events (SSE) streaming terminal.
- **Drag & Drop Uploads**: Seamlessly upload screenplay PDFs with a slick, command-line inspired interface.
- **Interactive Continuity Reports**: View side-by-side script excerpts highlighting exact locations of major and minor continuity contradictions (props, wardrobe, weather, timelines).

### Backend (Python + FastAPI)
- **PDF Screenplay Parsing**: Robust ingestion of screenplay PDFs, accurately splitting them into distinct scenes based on standard sluglines (INT/EXT).
- **LLM Extraction Engine**: Uses advanced LLM prompting to extract structured JSON data (characters, props, wardrobe, weather, time) from raw scene text.
- **SQLite Continuity Store**: Maintains a running database of extracted facts as the script is processed chronologically.
- **Contradiction Detection Logic**: Cross-references new scenes against the continuity store to flag mismatches in timelines, character states, and props.
- **Asynchronous Streaming**: Employs FastAPI's `EventSourceResponse` to push live analysis updates and progress to the frontend over SSE.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.9+

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
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v3, Lucide React, React Router.
- **Backend**: Python, FastAPI, Uvicorn, SQLite, pdfplumber.
