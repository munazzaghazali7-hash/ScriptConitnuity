"""
FastAPI Application — Script Continuity Agent Backend
======================================================

Routes:
  POST /api/upload          — Upload a screenplay PDF
  GET  /api/process/{id}    — SSE stream of agent progress
  GET  /api/report/{id}     — Final continuity report
  GET  /api/demo-report     — Pre-computed demo report
  GET  /api/health          — Health check
"""
from __future__ import annotations

import json
import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from agent import run_agent
from models import AgentStep, ContinuityReport
from test_script import generate_test_screenplay


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Script Continuity Agent",
    description="AI agent that ingests screenplays and flags continuity errors",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage paths
DATA_DIR = Path(__file__).parent / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory store for completed reports (production → Redis / DB)
reports_cache: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "script-continuity-agent"}


@app.post("/api/upload")
async def upload_script(file: UploadFile = File(...)):
    """
    Upload a screenplay PDF. Returns a job_id for tracking.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    job_id = str(uuid.uuid4())[:12]
    save_path = UPLOADS_DIR / f"{job_id}.pdf"

    async with aiofiles.open(save_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    return {
        "job_id": job_id,
        "filename": file.filename,
        "size_bytes": len(content),
        "message": "Script uploaded successfully. Start processing with GET /api/process/{job_id}",
    }


@app.get("/api/process/{job_id}")
async def process_script(job_id: str):
    """
    SSE endpoint that streams the agent's step-by-step progress.
    Returns Server-Sent Events as the agent processes the screenplay.
    """
    pdf_path = UPLOADS_DIR / f"{job_id}.pdf"

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail=f"No uploaded script found for job {job_id}")

    async def event_generator():
        try:
            async for progress in run_agent(
                job_id=job_id,
                pdf_path=str(pdf_path),
                script_title=f"Script {job_id}",
            ):
                if isinstance(progress, ContinuityReport):
                    # Final report
                    reports_cache[job_id] = progress.model_dump()
                    yield {
                        "event": "complete",
                        "data": json.dumps(progress.model_dump()),
                    }
                else:
                    # Progress event
                    event_data = progress.model_dump()

                    # If this is the completion step with report data, cache it
                    if progress.step == AgentStep.COMPLETE and progress.data and "report" in progress.data:
                        reports_cache[job_id] = progress.data["report"]

                    yield {
                        "event": "progress",
                        "data": json.dumps(event_data),
                    }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }

    return EventSourceResponse(event_generator())


@app.get("/api/report/{job_id}")
async def get_report(job_id: str):
    """Get the completed continuity report for a job."""
    if job_id in reports_cache:
        return JSONResponse(content=reports_cache[job_id])

    raise HTTPException(
        status_code=404,
        detail=f"Report not found for job {job_id}. Either processing hasn't completed or the job doesn't exist.",
    )


@app.get("/api/demo-report")
async def get_demo_report():
    """
    Generate and return a demo report using the test screenplay.
    Used by the landing page "See a sample report" CTA.
    """
    # Check if demo report is cached
    if "demo" in reports_cache:
        return JSONResponse(content=reports_cache["demo"])

    # Generate test screenplay if needed
    test_pdf = DATA_DIR / "test_screenplay.pdf"
    if not test_pdf.exists():
        generate_test_screenplay(test_pdf)

    # Run the agent synchronously-ish for the demo
    from models import AgentProgress
    demo_job_id = "demo"
    report_data = None

    async for event in run_agent(
        job_id=demo_job_id,
        pdf_path=str(test_pdf),
        script_title="THE LAST ARRANGEMENT",
    ):
        if hasattr(event, 'step') and event.step == AgentStep.COMPLETE and event.data:
            report_data = event.data.get("report")

    if report_data:
        reports_cache["demo"] = report_data
        return JSONResponse(content=report_data)

    raise HTTPException(status_code=500, detail="Failed to generate demo report")


@app.post("/api/demo-upload")
async def demo_upload():
    """
    Create a demo job using the test screenplay.
    Returns a job_id that can be used with /api/process/{job_id}.
    """
    test_pdf = DATA_DIR / "test_screenplay.pdf"
    if not test_pdf.exists():
        generate_test_screenplay(test_pdf)

    job_id = "demo-" + str(uuid.uuid4())[:8]
    save_path = UPLOADS_DIR / f"{job_id}.pdf"

    # Copy test screenplay to uploads
    import shutil
    shutil.copy2(test_pdf, save_path)

    return {
        "job_id": job_id,
        "filename": "THE_LAST_ARRANGEMENT.pdf",
        "size_bytes": test_pdf.stat().st_size,
        "message": "Demo script loaded. Start processing with GET /api/process/{job_id}",
    }


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup():
    """Generate test screenplay on startup if it doesn't exist."""
    test_pdf = DATA_DIR / "test_screenplay.pdf"
    if not test_pdf.exists():
        generate_test_screenplay(test_pdf)
        print("✅ Generated test screenplay PDF")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
