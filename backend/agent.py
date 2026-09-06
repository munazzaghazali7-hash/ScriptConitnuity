"""
Agent Orchestrator — the multi-step agent pipeline
====================================================

Implements the genuine multi-step agent with distinct tool functions:
  1. parse_script_pdf()   → raw scenes
  2. extract_scene_facts() → structured facts per scene
  3. update_continuity_db() → persist to SQLite
  4. check_contradictions() → flag issues per scene
  5. generate_report()      → final report

Yields AgentProgress events at each step for SSE streaming.
"""
from __future__ import annotations

import asyncio
from typing import AsyncGenerator

from models import (
    AgentProgress,
    AgentStep,
    Contradiction,
    ContinuityReport,
    SceneFacts,
)
from pdf_parser import parse_script_pdf
from scene_extractor import extract_scene_facts
from continuity_store import init_db, update_continuity_db, get_running_state, get_all_scenes
from contradiction_checker import check_contradictions
from report_generator import generate_report


async def run_agent(
    job_id: str,
    pdf_path: str,
    script_title: str = "Untitled Script",
) -> AsyncGenerator[AgentProgress | ContinuityReport, None]:
    """
    Run the full continuity-checking agent pipeline.

    Yields AgentProgress events for real-time UI updates, and finally
    yields the completed ContinuityReport.

    Args:
        job_id: Unique identifier for this processing job.
        pdf_path: Path to the uploaded screenplay PDF.
        script_title: Title of the screenplay.
    """
    all_contradictions: list[Contradiction] = []
    all_facts: list[SceneFacts] = []

    # -----------------------------------------------------------------------
    # Step 1: Parse PDF
    # -----------------------------------------------------------------------
    yield AgentProgress(
        step=AgentStep.PARSE_PDF,
        message="Parsing screenplay PDF and detecting scene boundaries...",
    )

    try:
        raw_scenes = parse_script_pdf(pdf_path)
    except Exception as e:
        yield AgentProgress(
            step=AgentStep.ERROR,
            message=f"Failed to parse PDF: {str(e)}",
        )
        return

    total_scenes = len(raw_scenes)

    yield AgentProgress(
        step=AgentStep.PARSE_PDF,
        scene_total=total_scenes,
        message=f"Found {total_scenes} scenes in the screenplay.",
    )

    # Small delay so the UI can display the message
    await asyncio.sleep(0.3)

    # -----------------------------------------------------------------------
    # Step 2: Initialize continuity database
    # -----------------------------------------------------------------------
    init_db(job_id)

    # -----------------------------------------------------------------------
    # Step 3: Process each scene (extract → store → check contradictions)
    # -----------------------------------------------------------------------
    for i, raw_scene in enumerate(raw_scenes):
        scene_num = i + 1

        # --- Extract facts ---
        yield AgentProgress(
            step=AgentStep.EXTRACT_FACTS,
            scene_current=scene_num,
            scene_total=total_scenes,
            message=f"Extracting facts from scene {scene_num} of {total_scenes}: {raw_scene.slugline}",
        )

        facts = await extract_scene_facts(raw_scene)
        facts.scene_number = scene_num  # Ensure sequential numbering
        all_facts.append(facts)

        await asyncio.sleep(0.15)  # Pacing for UI

        # --- Update continuity DB ---
        yield AgentProgress(
            step=AgentStep.UPDATE_DB,
            scene_current=scene_num,
            scene_total=total_scenes,
            message=f"Updating continuity database with scene {scene_num} facts...",
        )

        update_continuity_db(job_id, facts)

        await asyncio.sleep(0.1)

        # --- Check contradictions against running state ---
        yield AgentProgress(
            step=AgentStep.CHECK_CONTRADICTIONS,
            scene_current=scene_num,
            scene_total=total_scenes,
            message=f"Checking scene {scene_num} against continuity history for contradictions...",
        )

        running_state = get_running_state(job_id)
        # Pass history excluding the current scene
        history = [s for s in running_state if s["scene_number"] < scene_num]

        if history:
            scene_contradictions = await check_contradictions(facts, history)
            if scene_contradictions:
                all_contradictions.extend(scene_contradictions)
                for c in scene_contradictions:
                    yield AgentProgress(
                        step=AgentStep.CHECK_CONTRADICTIONS,
                        scene_current=scene_num,
                        scene_total=total_scenes,
                        message=f"⚠️ Contradiction found: {c.description[:100]}...",
                        data={"contradiction": c.model_dump()},
                    )

        await asyncio.sleep(0.15)

    # -----------------------------------------------------------------------
    # Step 4: Generate final report
    # -----------------------------------------------------------------------
    yield AgentProgress(
        step=AgentStep.GENERATE_REPORT,
        scene_total=total_scenes,
        message=f"Generating continuity report... Found {len(all_contradictions)} potential contradictions.",
    )

    report = generate_report(script_title, all_facts, all_contradictions)

    await asyncio.sleep(0.3)

    yield AgentProgress(
        step=AgentStep.COMPLETE,
        scene_total=total_scenes,
        message=f"Analysis complete. {report.summary.total_contradictions} contradictions flagged ({report.summary.major_count} major, {report.summary.minor_count} minor).",
        data={"report": report.model_dump()},
    )
