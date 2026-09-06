"""
Pydantic models for the Script Continuity Agent pipeline.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class Severity(str, Enum):
    MAJOR = "major"
    MINOR = "minor"


class ContradictionCategory(str, Enum):
    WEATHER = "weather"
    TIMELINE = "timeline"
    PROPS = "props"
    WARDROBE = "wardrobe"
    CHARACTER = "character"
    LOCATION = "location"
    OTHER = "other"


class AgentStep(str, Enum):
    PARSE_PDF = "parse_script_pdf"
    EXTRACT_FACTS = "extract_scene_facts"
    UPDATE_DB = "update_continuity_db"
    CHECK_CONTRADICTIONS = "check_contradictions"
    GENERATE_REPORT = "generate_report"
    COMPLETE = "complete"
    ERROR = "error"


# ---------------------------------------------------------------------------
# Scene models
# ---------------------------------------------------------------------------

class SceneRaw(BaseModel):
    """A raw scene extracted from PDF parsing."""
    scene_number: int
    slugline: str
    body: str


class SceneFacts(BaseModel):
    """Structured facts extracted from a scene via LLM."""
    scene_number: int
    location: str = ""
    int_ext: str = ""           # "INT" | "EXT" | "INT/EXT"
    time_of_day: str = ""       # "DAY" | "NIGHT" | "DAWN" | "DUSK" | etc.
    characters: list[str] = Field(default_factory=list)
    props: list[str] = Field(default_factory=list)
    wardrobe: list[dict] = Field(default_factory=list)   # [{character, description}]
    weather: str = ""
    continuity_markers: list[str] = Field(default_factory=list)  # "same day", "flashback", etc.
    raw_slugline: str = ""
    raw_text: str = ""


# ---------------------------------------------------------------------------
# Contradiction models
# ---------------------------------------------------------------------------

class Contradiction(BaseModel):
    """A single contradiction flagged by the agent."""
    id: str
    scene_a: int
    scene_b: int
    category: ContradictionCategory
    description: str
    severity: Severity
    scene_a_excerpt: str = ""
    scene_b_excerpt: str = ""
    suggested_resolution: str = ""


# ---------------------------------------------------------------------------
# Report models
# ---------------------------------------------------------------------------

class SummaryStats(BaseModel):
    total_scenes: int = 0
    total_contradictions: int = 0
    major_count: int = 0
    minor_count: int = 0
    categories: dict[str, int] = Field(default_factory=dict)


class ContinuityReport(BaseModel):
    """The final structured contradiction report."""
    script_title: str = "Untitled Script"
    total_scenes: int = 0
    scenes: list[SceneFacts] = Field(default_factory=list)
    contradictions: list[Contradiction] = Field(default_factory=list)
    summary: SummaryStats = Field(default_factory=SummaryStats)
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


# ---------------------------------------------------------------------------
# Agent progress (SSE events)
# ---------------------------------------------------------------------------

class AgentProgress(BaseModel):
    """A single progress event streamed to the frontend via SSE."""
    step: AgentStep
    scene_current: Optional[int] = None
    scene_total: Optional[int] = None
    message: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    data: Optional[dict] = None  # Arbitrary step-specific payload
