"""
LLM Client Abstraction Layer
============================

All LLM calls in the pipeline go through `call_llm()`. To swap providers:
  1. Set env var  LLM_PROVIDER = "watsonx" | "openai" | "mock"  (default: mock)
  2. Implement the corresponding private async function below.

The mock provider returns deterministic, realistic JSON so the prototype
works end-to-end without an API key.

For watsonx / Granite integration:
  - Install the IBM watsonx SDK
  - Fill in _watsonx_call() with your project_id, model_id, and credentials
  - The prompt + system_prompt are already decoupled from the provider
"""
from __future__ import annotations

import asyncio
import json
import os
import re
from typing import Optional


# ---------------------------------------------------------------------------
# Public interface — SINGLE ENTRY POINT for all LLM calls
# ---------------------------------------------------------------------------

async def call_llm(
    prompt: str,
    system_prompt: str = "",
    response_format: str = "json",
) -> str:
    """
    Call the configured LLM provider and return the raw response text.

    Args:
        prompt:          The user/task prompt.
        system_prompt:   Optional system-level instruction.
        response_format: Hint for the expected output ("json" or "text").

    Returns:
        Raw string response from the LLM.
    """
    provider = os.getenv("LLM_PROVIDER", "mock").lower()

    if provider == "mock":
        return await _mock_llm(prompt, system_prompt)
    elif provider == "watsonx":
        return await _watsonx_call(prompt, system_prompt)
    elif provider == "openai":
        return await _openai_call(prompt, system_prompt)
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}")


# ---------------------------------------------------------------------------
# Mock provider — deterministic responses for demo / development
# ---------------------------------------------------------------------------

async def _mock_llm(prompt: str, system_prompt: str = "") -> str:
    """
    Pattern-match on prompt keywords and return realistic structured JSON.
    This lets the entire pipeline run without an API key.
    """
    prompt_lower = prompt.lower()

    # --- Scene fact extraction ---
    if "extract" in system_prompt.lower() and "scene" in system_prompt.lower():
        return _mock_extract_scene(prompt)

    # --- Contradiction detection ---
    if "contradiction" in system_prompt.lower() or "continuity" in system_prompt.lower():
        return _mock_check_contradictions(prompt)

    # Fallback
    return json.dumps({"response": "Mock LLM response", "input_length": len(prompt)})


def _mock_extract_scene(prompt: str) -> str:
    """Generate realistic scene fact extraction from scene text."""
    prompt_lower = prompt.lower()

    # Parse scene number from prompt
    scene_num_match = re.search(r'scene\s*(?:#?\s*)?(\d+)', prompt_lower)
    scene_number = int(scene_num_match.group(1)) if scene_num_match else 1

    # Detect INT/EXT
    int_ext = "INT"
    if "ext." in prompt_lower:
        int_ext = "EXT"
    if "int./ext." in prompt_lower or "i/e." in prompt_lower:
        int_ext = "INT/EXT"

    # Detect time of day
    time_of_day = "DAY"
    for t in ["night", "evening", "dawn", "dusk", "sunset", "sunrise", "morning"]:
        if t in prompt_lower:
            time_of_day = t.upper()
            break

    # Detect location
    location = "UNKNOWN"
    slugline_match = re.search(r'(?:int\.|ext\.|int\./ext\.)\s+(.+?)(?:\s*[-–—]\s*)', prompt_lower)
    if slugline_match:
        location = slugline_match.group(1).strip().upper()

    # Detect characters (look for ALL CAPS names that might be character names)
    characters = []
    char_matches = re.findall(r'\n\s*([A-Z][A-Z\s]{2,}?)\s*\n', prompt)
    for c in char_matches:
        name = c.strip()
        if name and name not in ["INT", "EXT", "CUT TO", "FADE IN", "FADE OUT",
                                   "CONTINUED", "CONT'D", "MORE", "THE END"] and len(name) < 30:
            if name not in characters:
                characters.append(name)

    # Detect weather
    weather = ""
    weather_words = {
        "rain": "rainy", "raining": "rainy", "downpour": "heavy rain",
        "storm": "stormy", "snow": "snowy", "sunny": "sunny",
        "clear": "clear", "overcast": "overcast", "fog": "foggy",
        "wind": "windy", "cloud": "cloudy",
    }
    for word, desc in weather_words.items():
        if word in prompt_lower:
            weather = desc
            break

    # Detect props
    props = []
    prop_words = ["gun", "revolver", "pistol", "knife", "phone", "letter",
                  "briefcase", "bag", "key", "car", "book", "photograph",
                  "envelope", "glass", "bottle", "desk", "lamp", "cigarette",
                  "coffee", "mug", "folder", "file", "newspaper", "watch",
                  "ring", "necklace", "hat", "umbrella", "flashlight", "torch"]
    for prop in prop_words:
        if prop in prompt_lower:
            props.append(prop)

    # Detect wardrobe
    wardrobe = []
    wardrobe_patterns = [
        (r'wearing\s+(?:a\s+)?(.+?)(?:\.|,|\n)', None),
        (r'dressed\s+in\s+(.+?)(?:\.|,|\n)', None),
        (r'(red|blue|black|white|green|brown|grey|gray|yellow)\s+(jacket|coat|dress|suit|shirt|sweater|jeans|pants|hat|scarf|tie)', None),
    ]
    for pattern, _ in wardrobe_patterns:
        matches = re.findall(pattern, prompt_lower)
        for m in matches:
            desc = m if isinstance(m, str) else " ".join(m)
            if characters:
                wardrobe.append({"character": characters[0], "description": desc.strip()})
            else:
                wardrobe.append({"character": "UNKNOWN", "description": desc.strip()})

    # Detect continuity markers — use word-boundary matching to avoid
    # false positives (e.g. "an earlier drizzle" should NOT match "earlier")
    continuity_markers = []
    marker_patterns = {
        "same day": r'\bsame\s+day\b',
        "later that": r'\blater\s+that\b',
        "moments later": r'\bmoments\s+later\b',
        "continuous": r'\bcontinuous\b',
        "flashback": r'\bflashback\b',
        "flash forward": r'\bflash\s+forward\b',
        "earlier that same day": r'\bearlier\s+that\s+same\s+day\b',
        "next morning": r'\bnext\s+morning\b',
        "the following day": r'\bthe\s+following\s+day\b',
        "hours later": r'\bhours\s+later\b',
        "minutes later": r'\bminutes\s+later\b',
    }
    for phrase, pattern in marker_patterns.items():
        if re.search(pattern, prompt_lower):
            continuity_markers.append(phrase)

    result = {
        "scene_number": scene_number,
        "location": location,
        "int_ext": int_ext,
        "time_of_day": time_of_day,
        "characters": characters[:6],  # Cap at 6
        "props": props[:8],
        "wardrobe": wardrobe[:4],
        "weather": weather,
        "continuity_markers": continuity_markers,
    }
    return json.dumps(result)


def _mock_check_contradictions(prompt: str) -> str:
    """
    Detect contradictions by scanning the prompt for known conflict patterns.
    The prompt contains the new scene facts + the full running continuity state.
    """
    prompt_lower = prompt.lower()
    contradictions = []

    # Try to parse the structured data from the prompt
    try:
        # Extract current scene JSON and history JSON from prompt.
        # The prompt format is:
        #   Current scene facts:\n{...}\n\nContinuity history:\n[...]\n\nCurrent scene raw text:\n...
        current = None
        history = None

        # Find current scene facts JSON block
        curr_idx = prompt.lower().find("current scene facts:")
        hist_idx = prompt.lower().find("continuity history:")
        raw_idx = prompt.lower().find("current scene raw text:")

        if curr_idx >= 0 and hist_idx >= 0:
            # Current scene JSON is between "current scene facts:" and "continuity history:"
            curr_block = prompt[curr_idx:hist_idx].strip()
            # Find the JSON object in this block
            brace_start = curr_block.find("{")
            if brace_start >= 0:
                depth = 0
                for i in range(brace_start, len(curr_block)):
                    if curr_block[i] == "{":
                        depth += 1
                    elif curr_block[i] == "}":
                        depth -= 1
                        if depth == 0:
                            current = json.loads(curr_block[brace_start:i+1])
                            break

        if hist_idx >= 0:
            # History JSON starts after "continuity history:"
            end_idx = raw_idx if raw_idx >= 0 else len(prompt)
            hist_block = prompt[hist_idx:end_idx].strip()
            bracket_start = hist_block.find("[")
            if bracket_start >= 0:
                depth = 0
                for i in range(bracket_start, len(hist_block)):
                    if hist_block[i] == "[":
                        depth += 1
                    elif hist_block[i] == "]":
                        depth -= 1
                        if depth == 0:
                            history = json.loads(hist_block[bracket_start:i+1])
                            break

        if current and history:

            current_scene = current.get("scene_number", 0)
            current_weather = current.get("weather", "").lower().strip()
            current_props = [p.lower() for p in current.get("props", [])]
            current_wardrobe = current.get("wardrobe", [])
            current_markers = [m.lower() for m in current.get("continuity_markers", [])]
            current_location = current.get("location", "").lower().strip()
            current_chars = [c.lower() for c in current.get("characters", [])]

            for prev in history:
                prev_scene = prev.get("scene_number", 0)
                prev_weather = prev.get("weather", "").lower().strip()
                prev_props = [p.lower() for p in prev.get("props", [])]
                prev_wardrobe = prev.get("wardrobe", [])
                prev_markers = [m.lower() for m in prev.get("continuity_markers", [])]
                prev_location = prev.get("location", "").lower().strip()
                prev_chars = [c.lower() for c in prev.get("characters", [])]

                # -----------------------------------------------------------
                # Weather contradiction: different weather when temporal
                # markers suggest the same day — regardless of location
                # (e.g. flashback to "earlier that same day")
                # -----------------------------------------------------------
                if current_weather and prev_weather and current_weather != prev_weather:
                    temporal_keywords = ["same day", "earlier that same day",
                                         "flashback", "continuous",
                                         "moments later"]
                    has_temporal_link = any(
                        m in temporal_keywords
                        for m in current_markers + prev_markers
                    )
                    if has_temporal_link:
                        contradictions.append({
                            "scene_a": prev_scene,
                            "scene_b": current_scene,
                            "category": "weather",
                            "description": (
                                f"Scene {prev_scene} establishes {prev_weather} weather, "
                                f"but Scene {current_scene} (marked as "
                                f"'{', '.join(current_markers)}') describes "
                                f"{current_weather} weather on what should be the same day."
                            ),
                            "severity": "major",
                            "scene_a_excerpt": f"Scene {prev_scene} weather: {prev_weather}",
                            "scene_b_excerpt": f"Scene {current_scene} weather: {current_weather}",
                            "suggested_resolution": (
                                f"Reconcile weather between Scenes {prev_scene} and "
                                f"{current_scene}. Either update the weather to be "
                                f"consistent or remove the same-day/flashback temporal link."
                            ),
                        })

                # -----------------------------------------------------------
                # Props contradiction: a prop was present at a location in an
                # earlier scene but the raw text of the current scene (same
                # location) implies the prop is missing / character reaches
                # for it.
                # -----------------------------------------------------------
                if (current_location and prev_location
                        and current_location == prev_location):
                    # Check raw text for evidence of missing props
                    raw_text_lower = prompt_lower
                    reach_words = ["reach", "grab", "missing", "empty",
                                   "gone", "nothing", "finds nothing",
                                   "hand finds"]
                    has_reach = any(w in raw_text_lower for w in reach_words)

                    if has_reach:
                        for prop in prev_props:
                            if prop in raw_text_lower:
                                contradictions.append({
                                    "scene_a": prev_scene,
                                    "scene_b": current_scene,
                                    "category": "props",
                                    "description": (
                                        f"Scene {prev_scene} places a {prop} at "
                                        f"{prev_location.upper()}, but in Scene "
                                        f"{current_scene} (same location) the "
                                        f"character reaches for the {prop} but it "
                                        f"appears to be missing."
                                    ),
                                    "severity": "major",
                                    "scene_a_excerpt": (
                                        f"Scene {prev_scene}: {prop} placed at "
                                        f"{prev_location.upper()}"
                                    ),
                                    "scene_b_excerpt": (
                                        f"Scene {current_scene}: character reaches "
                                        f"for {prop} but finds nothing"
                                    ),
                                    "suggested_resolution": (
                                        f"Ensure the {prop} is consistently present "
                                        f"at {prev_location.upper()} across Scenes "
                                        f"{prev_scene} and {current_scene}, or add "
                                        f"action showing it being moved/removed."
                                    ),
                                })
                                break  # One prop contradiction per location pair

                # -----------------------------------------------------------
                # Wardrobe contradiction: same character, continuous scene,
                # different outfit description
                # -----------------------------------------------------------
                if current_wardrobe and prev_wardrobe:
                    is_continuous = any(
                        m in ["continuous", "moments later"]
                        for m in current_markers
                    )
                    if is_continuous:
                        for cw in current_wardrobe:
                            for pw in prev_wardrobe:
                                c_char = cw.get("character", "").lower()
                                p_char = pw.get("character", "").lower()
                                c_desc = cw.get("description", "").lower()
                                p_desc = pw.get("description", "").lower()
                                if (c_char and p_char
                                        and c_char == p_char
                                        and c_desc != p_desc):
                                    contradictions.append({
                                        "scene_a": prev_scene,
                                        "scene_b": current_scene,
                                        "category": "wardrobe",
                                        "description": (
                                            f"Scene {prev_scene} shows "
                                            f"{p_char.upper()} wearing '{p_desc}', "
                                            f"but Scene {current_scene} (marked "
                                            f"'continuous'/'moments later') shows "
                                            f"them in '{c_desc}' — impossible "
                                            f"costume change with no time break."
                                        ),
                                        "severity": "major",
                                        "scene_a_excerpt": (
                                            f"Scene {prev_scene}: {p_char.upper()} "
                                            f"wearing '{p_desc}'"
                                        ),
                                        "scene_b_excerpt": (
                                            f"Scene {current_scene}: {p_char.upper()} "
                                            f"now in '{c_desc}'"
                                        ),
                                        "suggested_resolution": (
                                            f"Either add a scene break or wardrobe "
                                            f"change for {p_char.upper()}, or make "
                                            f"the outfit consistent across the "
                                            f"continuous scenes."
                                        ),
                                    })

                # -----------------------------------------------------------
                # Character presence: shared characters between the
                # IMMEDIATELY preceding scene at a different location when
                # the current scene is marked continuous/moments later
                # -----------------------------------------------------------
                if (current_location and prev_location
                        and current_location != prev_location
                        and prev_scene == current_scene - 1):
                    shared_chars = set(current_chars) & set(prev_chars)
                    is_continuous = any(
                        m in ["continuous", "moments later"]
                        for m in current_markers
                    )
                    if shared_chars and is_continuous:
                        for char in shared_chars:
                            contradictions.append({
                                "scene_a": prev_scene,
                                "scene_b": current_scene,
                                "category": "character",
                                "description": (
                                    f"{char.upper()} appears at "
                                    f"{prev_location.upper()} in Scene {prev_scene} "
                                    f"and at {current_location.upper()} in Scene "
                                    f"{current_scene} (marked 'continuous'/'moments "
                                    f"later') — impossible travel time."
                                ),
                                "severity": "minor",
                                "suggested_resolution": (
                                    f"Add travel time or adjust the temporal marker "
                                    f"for {char.upper()} between Scenes {prev_scene} "
                                    f"and {current_scene}."
                                ),
                            })

    except (json.JSONDecodeError, AttributeError, KeyError):
        pass

    return json.dumps({"contradictions": contradictions})


# ---------------------------------------------------------------------------
# watsonx / Granite stub
# ---------------------------------------------------------------------------

async def _watsonx_call(prompt: str, system_prompt: str = "") -> str:
    """
    watsonx / Granite integration using ibm-watsonx-ai.
    """
    try:
        from ibm_watsonx_ai.foundation_models import ModelInference
        from ibm_watsonx_ai import Credentials
    except ImportError:
        raise ImportError("ibm-watsonx-ai is not installed. Please pip install ibm-watsonx-ai")

    def _sync_call():
        credentials = Credentials(
            url=os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com"),
            api_key=os.getenv("WATSONX_API_KEY"),
        )
        model = ModelInference(
            model_id="ibm/granite-3-8b-instruct",
            credentials=credentials,
            project_id=os.getenv("WATSONX_PROJECT_ID"),
            params={
                "max_new_tokens": 4096,
                "temperature": 0.1,
            },
        )
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = model.chat(messages=messages)
        return response["choices"][0]["message"]["content"]

    # Run the synchronous SDK call in a background thread so we don't block SSE stream
    return await asyncio.to_thread(_sync_call)


# ---------------------------------------------------------------------------
# OpenAI stub (optional, for testing with GPT)
# ---------------------------------------------------------------------------

async def _openai_call(prompt: str, system_prompt: str = "") -> str:
    """
    OpenAI integration stub.

    To implement:
    1. pip install openai
    2. Set env var: OPENAI_API_KEY
    3. Uncomment below:

    ```python
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content
    ```
    """
    raise NotImplementedError(
        "OpenAI provider not configured. Set OPENAI_API_KEY env var, "
        "then implement _openai_call() in llm_client.py."
    )
