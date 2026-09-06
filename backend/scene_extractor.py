"""
Scene Extractor — extract_scene_facts()
========================================

Calls the LLM to extract structured facts from each raw scene.
"""
from __future__ import annotations

import json

from llm_client import call_llm
from models import SceneFacts, SceneRaw


# ---------------------------------------------------------------------------
# Prompt templates — kept separate from the LLM client
# ---------------------------------------------------------------------------

EXTRACTION_SYSTEM_PROMPT = """You are a professional script supervisor's assistant. Your job is to extract structured continuity facts from screenplay scenes.

For each scene, you must identify and return a JSON object with:
- scene_number: The scene number
- location: The filming location (from the slugline)
- int_ext: "INT" for interior, "EXT" for exterior, or "INT/EXT"
- time_of_day: "DAY", "NIGHT", "DAWN", "DUSK", "MORNING", "EVENING", etc.
- characters: Array of character names present in the scene
- props: Array of significant props mentioned or used
- wardrobe: Array of objects with {character, description} for any costume descriptions
- weather: Weather conditions if mentioned (rain, sunny, overcast, etc.), empty string if not mentioned
- continuity_markers: Array of temporal/continuity phrases like "same day", "later that night", "flashback", "continuous", "moments later", etc.

Be thorough but precise. Only include items explicitly mentioned or clearly implied in the scene text."""

EXTRACTION_USER_PROMPT = """Extract structured continuity facts from the following screenplay scene.

Scene #{scene_number}
Slugline: {slugline}

Scene text:
{body}

Return ONLY a valid JSON object with the fields specified. No markdown, no explanation."""


async def extract_scene_facts(scene: SceneRaw) -> SceneFacts:
    """
    Call the LLM to extract structured facts from a raw scene.

    Args:
        scene: A SceneRaw object from the PDF parser.

    Returns:
        A SceneFacts object with extracted continuity data.
    """
    prompt = EXTRACTION_USER_PROMPT.format(
        scene_number=scene.scene_number,
        slugline=scene.slugline,
        body=scene.body,
    )

    response = await call_llm(
        prompt=prompt,
        system_prompt=EXTRACTION_SYSTEM_PROMPT,
        response_format="json",
    )

    # Parse the LLM response into SceneFacts
    facts = _parse_extraction_response(response, scene)
    return facts


def _parse_extraction_response(response: str, scene: SceneRaw) -> SceneFacts:
    """
    Parse the LLM's JSON response into a SceneFacts model.
    Falls back to defaults if parsing fails.
    """
    try:
        # Strip any markdown code fences if present
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1]
            if clean.endswith("```"):
                clean = clean.rsplit("```", 1)[0]
            clean = clean.strip()

        data = json.loads(clean)

        return SceneFacts(
            scene_number=data.get("scene_number", scene.scene_number),
            location=data.get("location", ""),
            int_ext=data.get("int_ext", ""),
            time_of_day=data.get("time_of_day", ""),
            characters=data.get("characters", []),
            props=data.get("props", []),
            wardrobe=data.get("wardrobe", []),
            weather=data.get("weather", ""),
            continuity_markers=data.get("continuity_markers", []),
            raw_slugline=scene.slugline,
            raw_text=scene.body[:2000],  # Truncate for storage
        )
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        # Fallback: return minimal facts
        return SceneFacts(
            scene_number=scene.scene_number,
            location=scene.slugline,
            raw_slugline=scene.slugline,
            raw_text=scene.body[:2000],
        )
