"""
Contradiction Checker — check_contradictions()
===============================================

For each new scene, calls the LLM with the scene's facts plus the full
running continuity state to identify contradictions.
"""
from __future__ import annotations

import json
import uuid

from llm_client import call_llm
from models import Contradiction, ContradictionCategory, SceneFacts, Severity


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

CONTRADICTION_SYSTEM_PROMPT = """You are a meticulous script supervisor reviewing a screenplay for continuity errors.

Given a new scene's facts and the full continuity history of all previously processed scenes, identify ANY contradictions. Pay special attention to:

1. **Weather mismatches**: Same day or flashback scenes with different weather
2. **Timeline conflicts**: Impossible timing (e.g., "later that night" but the next scene is set in daytime of the same day)
3. **Prop continuity**: Items that appear/disappear without explanation at the same location
4. **Wardrobe inconsistencies**: Costume changes in continuous scenes without a break
5. **Character presence**: Characters appearing in impossible locations given the timeline
6. **Location consistency**: Details about a location that change between visits

Look for temporal phrases: "same day", "later that night", "flashback", "continuous", "moments later", "the following day", "earlier".

Return a JSON object with:
{
  "contradictions": [
    {
      "scene_a": <earlier scene number>,
      "scene_b": <current scene number>,
      "category": "weather" | "timeline" | "props" | "wardrobe" | "character" | "location" | "other",
      "description": "<clear plain-English description of the contradiction>",
      "severity": "major" | "minor",
      "suggested_resolution": "<what the script supervisor should check or fix>"
    }
  ]
}

If there are no contradictions, return {"contradictions": []}.
Be precise and avoid false positives — only flag genuine inconsistencies."""


CONTRADICTION_USER_PROMPT = """Check the following new scene against the continuity history for any contradictions.

Current scene facts:
{current_scene_json}

Continuity history:
{history_json}

Current scene raw text:
{raw_text}

Return ONLY a valid JSON object. No markdown, no explanation."""


async def check_contradictions(
    scene_facts: SceneFacts,
    running_state: list[dict],
) -> list[Contradiction]:
    """
    Check a new scene against the running continuity state for contradictions.

    Args:
        scene_facts: The newly extracted scene facts.
        running_state: Full list of all previously processed scene facts.

    Returns:
        List of Contradiction objects found (may be empty).
    """
    if not running_state:
        return []  # No history to check against

    # Build the prompt
    current_json = json.dumps(scene_facts.model_dump(exclude={"raw_text", "raw_slugline"}), indent=2)
    history_json = json.dumps(running_state, indent=2)

    prompt = CONTRADICTION_USER_PROMPT.format(
        current_scene_json=current_json,
        history_json=history_json,
        raw_text=scene_facts.raw_text[:1500],
    )

    response = await call_llm(
        prompt=prompt,
        system_prompt=CONTRADICTION_SYSTEM_PROMPT,
        response_format="json",
    )

    contradictions = _parse_contradiction_response(response, scene_facts.scene_number)
    return contradictions


def _parse_contradiction_response(
    response: str, current_scene: int
) -> list[Contradiction]:
    """Parse the LLM response into Contradiction objects."""
    try:
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1]
            if clean.endswith("```"):
                clean = clean.rsplit("```", 1)[0]
            clean = clean.strip()

        data = json.loads(clean)
        raw_contradictions = data.get("contradictions", [])

        result = []
        for c in raw_contradictions:
            try:
                category = ContradictionCategory(c.get("category", "other"))
            except ValueError:
                category = ContradictionCategory.OTHER

            try:
                severity = Severity(c.get("severity", "minor"))
            except ValueError:
                severity = Severity.MINOR

            result.append(Contradiction(
                id=str(uuid.uuid4())[:8],
                scene_a=c.get("scene_a", 0),
                scene_b=c.get("scene_b", current_scene),
                category=category,
                description=c.get("description", "Unknown contradiction"),
                severity=severity,
                scene_a_excerpt=c.get("scene_a_excerpt", ""),
                scene_b_excerpt=c.get("scene_b_excerpt", ""),
                suggested_resolution=c.get("suggested_resolution", "Review the flagged scenes for consistency."),
            ))

        return result

    except (json.JSONDecodeError, KeyError, TypeError):
        return []
