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

    # Detect continuity markers
    continuity_markers = []
    marker_phrases = ["same day", "later that", "moments later", "continuous",
                      "flashback", "flash forward", "earlier", "next morning",
                      "the following", "hours later", "minutes later"]
    for phrase in marker_phrases:
        if phrase in prompt_lower:
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
        # Look for current scene facts in the prompt
        current_match = re.search(r'current scene facts:\s*(\{.+?\})', prompt, re.DOTALL)
        history_match = re.search(r'continuity history:\s*(\[.+\])', prompt, re.DOTALL)

        if current_match and history_match:
            current = json.loads(current_match.group(1))
            history = json.loads(history_match.group(1))

            current_scene = current.get("scene_number", 0)
            current_weather = current.get("weather", "").lower()
            current_props = [p.lower() for p in current.get("props", [])]
            current_wardrobe = current.get("wardrobe", [])
            current_markers = [m.lower() for m in current.get("continuity_markers", [])]
            current_location = current.get("location", "").lower()
            current_chars = [c.lower() for c in current.get("characters", [])]

            for prev in history:
                prev_scene = prev.get("scene_number", 0)
                prev_weather = prev.get("weather", "").lower()
                prev_props = [p.lower() for p in prev.get("props", [])]
                prev_wardrobe = prev.get("wardrobe", [])
                prev_markers = [m.lower() for m in prev.get("continuity_markers", [])]
                prev_location = prev.get("location", "").lower()
                prev_chars = [c.lower() for c in prev.get("characters", [])]

                # Weather contradiction: same day but different weather
                if current_weather and prev_weather and current_weather != prev_weather:
                    same_day = any(m in ["same day", "earlier", "flashback", "continuous", "moments later"]
                                  for m in current_markers + prev_markers)
                    if same_day:
                        contradictions.append({
                            "scene_a": prev_scene,
                            "scene_b": current_scene,
                            "category": "weather",
                            "description": (
                                f"Scene {prev_scene} establishes {prev_weather} weather, "
                                f"but Scene {current_scene} (marked as '{', '.join(current_markers)}') "
                                f"describes {current_weather} weather on what should be the same day."
                            ),
                            "severity": "major",
                            "suggested_resolution": (
                                f"Reconcile weather between Scenes {prev_scene} and {current_scene}. "
                                f"Either update the weather to be consistent or remove the "
                                f"same-day/flashback temporal link."
                            ),
                        })

                # Props contradiction: prop in earlier scene at same location, missing now
                if current_location and prev_location and current_location == prev_location:
                    missing_props = [p for p in prev_props if p not in current_props]
                    reappearing_props = [p for p in current_props
                                        if any(f"reach" in prompt_lower and p in prompt_lower)]
                    for prop in missing_props:
                        # Check if the scene text references the prop being gone or reaching for it
                        if prop in prompt_lower and ("reach" in prompt_lower or "grab" in prompt_lower
                                                      or "missing" in prompt_lower or "empty" in prompt_lower
                                                      or "gone" in prompt_lower):
                            contradictions.append({
                                "scene_a": prev_scene,
                                "scene_b": current_scene,
                                "category": "props",
                                "description": (
                                    f"Scene {prev_scene} places a {prop} at {prev_location.upper()}, "
                                    f"but in Scene {current_scene} (same location, no one entered or left) "
                                    f"the {prop} appears to be missing or the character reaches for it "
                                    f"despite it not being established in this scene."
                                ),
                                "severity": "major",
                                "suggested_resolution": (
                                    f"Ensure the {prop} is consistently present at "
                                    f"{prev_location.upper()} across Scenes {prev_scene} and "
                                    f"{current_scene}, or add action showing it being moved/removed."
                                ),
                            })

                # Wardrobe contradiction: same character, continuous scene, different outfit
                if current_wardrobe and prev_wardrobe:
                    is_continuous = any(m in ["continuous", "moments later"]
                                       for m in current_markers)
                    if is_continuous:
                        for cw in current_wardrobe:
                            for pw in prev_wardrobe:
                                c_char = cw.get("character", "").lower()
                                p_char = pw.get("character", "").lower()
                                c_desc = cw.get("description", "").lower()
                                p_desc = pw.get("description", "").lower()
                                if c_char and p_char and c_char == p_char and c_desc != p_desc:
                                    contradictions.append({
                                        "scene_a": prev_scene,
                                        "scene_b": current_scene,
                                        "category": "wardrobe",
                                        "description": (
                                            f"Scene {prev_scene} shows {p_char.upper()} wearing "
                                            f"'{p_desc}', but Scene {current_scene} (marked "
                                            f"'continuous'/'moments later') shows them in "
                                            f"'{c_desc}' with no costume change."
                                        ),
                                        "severity": "major",
                                        "suggested_resolution": (
                                            f"Either add a scene break or wardrobe change for "
                                            f"{p_char.upper()}, or make the outfit consistent "
                                            f"across the continuous scenes."
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
    watsonx / Granite integration stub.

    To implement:
    1. pip install ibm-watsonx-ai
    2. Set env vars: WATSONX_API_KEY, WATSONX_PROJECT_ID, WATSONX_URL
    3. Uncomment and fill in below:

    ```python
    from ibm_watsonx_ai.foundation_models import ModelInference
    from ibm_watsonx_ai import Credentials

    credentials = Credentials(
        url=os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com"),
        api_key=os.getenv("WATSONX_API_KEY"),
    )
    model = ModelInference(
        model_id="ibm/granite-3-8b-instruct",  # or your preferred model
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
    ```
    """
    raise NotImplementedError(
        "watsonx provider not configured. Set WATSONX_API_KEY, "
        "WATSONX_PROJECT_ID, and WATSONX_URL env vars, then "
        "implement _watsonx_call() in llm_client.py."
    )


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
