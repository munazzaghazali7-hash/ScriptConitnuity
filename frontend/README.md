# Script Continuity Agent (Frontend)

This is the React + Vite frontend for the **Script Continuity Agent**, an AI-powered pipeline designed to catch continuity errors in screenplays before production begins.

## ✨ Features

- **Dark-Mode First Aesthetic**: A modern, vibrant, glassmorphic design inspired by Localcan.
- **Real-Time Agent Terminal**: Watch the AI analyze your script scene-by-scene via a live Server-Sent Events (SSE) streaming terminal.
- **Drag & Drop Uploads**: Seamlessly upload screenplay PDFs with a slick, command-line inspired interface.
- **Interactive Continuity Reports**: View side-by-side script excerpts highlighting exact locations of major and minor continuity contradictions (props, wardrobe, weather, timelines).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- The Python Backend running on port `8000`.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Tech Stack

- **Framework**: [React](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)

## 🎨 UI/UX Notes

The design system uses:
- `JetBrains Mono` for structural headers, terminal output, and technical accents.
- `Inter` for highly readable body copy.
- A custom tailwind configuration utilizing deep dark backgrounds (`#0A0A0A`), translucent `rgba` surfaces (`backdrop-blur-xl`), and vibrant glowing accents (Green, Purple, Cyan).

## 📡 API Integration

The frontend expects the backend API to be running at `http://localhost:8000`.
- **Upload**: `POST /api/upload`
- **Processing Stream**: `GET /api/process/{job_id}` (Server-Sent Events)
- **Demo Mode**: `POST /api/demo-upload`
