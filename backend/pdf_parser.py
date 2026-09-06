"""
PDF Parser — parse_script_pdf()
================================

Extracts text from a screenplay PDF and splits it into individual scenes
using slugline detection (INT./EXT. patterns) as scene boundaries.
"""
from __future__ import annotations

import re
from pathlib import Path

import pdfplumber

from models import SceneRaw


# Standard screenplay slugline regex
# Matches: INT. LOCATION - TIME, EXT. LOCATION - TIME, INT./EXT. LOCATION - TIME
SLUGLINE_PATTERN = re.compile(
    r'^\s*((?:INT\.|EXT\.|INT\./EXT\.|INT/EXT\.|I/E\.)\s+.+?)$',
    re.MULTILINE | re.IGNORECASE,
)

# Pattern to detect scene numbers (e.g., "14." or "SCENE 14" at start of slugline)
SCENE_NUM_PATTERN = re.compile(r'^(\d+)\.\s*|^SCENE\s+(\d+)', re.IGNORECASE)


def parse_script_pdf(pdf_path: str | Path) -> list[SceneRaw]:
    """
    Parse a screenplay PDF into individual scenes.

    Args:
        pdf_path: Path to the screenplay PDF file.

    Returns:
        List of SceneRaw objects, one per detected scene.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    # Extract full text from PDF
    full_text = _extract_text(pdf_path)

    # Split into scenes using sluglines
    scenes = _split_into_scenes(full_text)

    return scenes


def _extract_text(pdf_path: Path) -> str:
    """Extract all text from a PDF file using pdfplumber."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n\n".join(pages)


def _split_into_scenes(text: str) -> list[SceneRaw]:
    """
    Split full screenplay text into scenes using slugline detection.

    Each scene starts with a slugline (INT./EXT. pattern) and continues
    until the next slugline or end of text.
    """
    # Find all slugline positions
    matches = list(SLUGLINE_PATTERN.finditer(text))

    if not matches:
        # No sluglines found — treat the entire text as one scene
        return [SceneRaw(scene_number=1, slugline="UNKNOWN", body=text.strip())]

    scenes: list[SceneRaw] = []

    for i, match in enumerate(matches):
        slugline = match.group(1).strip()
        start = match.end()

        # Scene body extends to the next slugline (or end of text)
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(text)

        body = text[start:end].strip()

        # Try to extract scene number from slugline prefix or just use index
        scene_number = _extract_scene_number(slugline, i + 1)

        # Clean up slugline (remove leading scene numbers if present)
        clean_slugline = SCENE_NUM_PATTERN.sub("", slugline).strip()
        if not clean_slugline:
            clean_slugline = slugline

        scenes.append(SceneRaw(
            scene_number=scene_number,
            slugline=clean_slugline,
            body=body,
        ))

    return scenes


def _extract_scene_number(slugline: str, fallback: int) -> int:
    """Try to extract a scene number from the slugline, or use the fallback index."""
    match = SCENE_NUM_PATTERN.match(slugline)
    if match:
        num = match.group(1) or match.group(2)
        try:
            return int(num)
        except (ValueError, TypeError):
            pass
    return fallback
