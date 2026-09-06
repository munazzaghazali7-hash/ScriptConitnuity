"""
Continuity Store — update_continuity_db() / get_running_state()
================================================================

SQLite-backed continuity database that persists scene facts and
builds a running "world state" the agent can reference when checking
for contradictions.

NOTE: For a production deployment at scale, this SQLite store would
be replaced by BigQuery (or similar columnar store) to handle
feature-length scripts with hundreds of scenes and enable
cross-script analysis. The API surface (insert + query) stays the
same — only the storage backend changes.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Optional

from models import SceneFacts


# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------

DB_DIR = Path(__file__).parent / "data"
DB_DIR.mkdir(exist_ok=True)


def _get_db_path(job_id: str) -> Path:
    """Each job gets its own SQLite database file."""
    return DB_DIR / f"{job_id}.db"


def _get_connection(job_id: str) -> sqlite3.Connection:
    """Get a connection to the job's database."""
    db_path = _get_db_path(job_id)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db(job_id: str) -> None:
    """Initialize the database schema for a new job."""
    conn = _get_connection(job_id)
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS scenes (
                scene_number INTEGER PRIMARY KEY,
                location TEXT NOT NULL DEFAULT '',
                int_ext TEXT NOT NULL DEFAULT '',
                time_of_day TEXT NOT NULL DEFAULT '',
                weather TEXT NOT NULL DEFAULT '',
                characters_json TEXT NOT NULL DEFAULT '[]',
                props_json TEXT NOT NULL DEFAULT '[]',
                wardrobe_json TEXT NOT NULL DEFAULT '[]',
                continuity_markers_json TEXT NOT NULL DEFAULT '[]',
                raw_slugline TEXT NOT NULL DEFAULT '',
                raw_text TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                scene_number INTEGER NOT NULL,
                FOREIGN KEY (scene_number) REFERENCES scenes(scene_number)
            );

            CREATE TABLE IF NOT EXISTS props (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                scene_number INTEGER NOT NULL,
                location TEXT NOT NULL DEFAULT '',
                FOREIGN KEY (scene_number) REFERENCES scenes(scene_number)
            );

            CREATE TABLE IF NOT EXISTS wardrobe (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_name TEXT NOT NULL,
                description TEXT NOT NULL,
                scene_number INTEGER NOT NULL,
                FOREIGN KEY (scene_number) REFERENCES scenes(scene_number)
            );

            CREATE INDEX IF NOT EXISTS idx_chars_scene ON characters(scene_number);
            CREATE INDEX IF NOT EXISTS idx_props_scene ON props(scene_number);
            CREATE INDEX IF NOT EXISTS idx_wardrobe_scene ON wardrobe(scene_number);
        """)
        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

def update_continuity_db(job_id: str, facts: SceneFacts) -> None:
    """
    Insert or update a scene's facts in the continuity database.
    Also populates the denormalized character/props/wardrobe tables.
    """
    conn = _get_connection(job_id)
    try:
        # Upsert scene
        conn.execute("""
            INSERT OR REPLACE INTO scenes
                (scene_number, location, int_ext, time_of_day, weather,
                 characters_json, props_json, wardrobe_json,
                 continuity_markers_json, raw_slugline, raw_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            facts.scene_number,
            facts.location,
            facts.int_ext,
            facts.time_of_day,
            facts.weather,
            json.dumps(facts.characters),
            json.dumps(facts.props),
            json.dumps(facts.wardrobe),
            json.dumps(facts.continuity_markers),
            facts.raw_slugline,
            facts.raw_text,
        ))

        # Clear old denormalized data for this scene
        conn.execute("DELETE FROM characters WHERE scene_number = ?", (facts.scene_number,))
        conn.execute("DELETE FROM props WHERE scene_number = ?", (facts.scene_number,))
        conn.execute("DELETE FROM wardrobe WHERE scene_number = ?", (facts.scene_number,))

        # Insert characters
        for char in facts.characters:
            conn.execute(
                "INSERT INTO characters (name, scene_number) VALUES (?, ?)",
                (char, facts.scene_number),
            )

        # Insert props
        for prop in facts.props:
            conn.execute(
                "INSERT INTO props (name, scene_number, location) VALUES (?, ?, ?)",
                (prop, facts.scene_number, facts.location),
            )

        # Insert wardrobe
        for item in facts.wardrobe:
            char_name = item.get("character", "") if isinstance(item, dict) else ""
            desc = item.get("description", "") if isinstance(item, dict) else str(item)
            conn.execute(
                "INSERT INTO wardrobe (character_name, description, scene_number) VALUES (?, ?, ?)",
                (char_name, desc, facts.scene_number),
            )

        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

def get_running_state(job_id: str) -> list[dict]:
    """
    Get the full running continuity state — all processed scenes with
    their extracted facts, ordered by scene number.

    Returns:
        List of scene fact dictionaries suitable for inclusion in
        the contradiction-checking prompt.
    """
    conn = _get_connection(job_id)
    try:
        rows = conn.execute(
            "SELECT * FROM scenes ORDER BY scene_number ASC"
        ).fetchall()

        state = []
        for row in rows:
            state.append({
                "scene_number": row["scene_number"],
                "location": row["location"],
                "int_ext": row["int_ext"],
                "time_of_day": row["time_of_day"],
                "weather": row["weather"],
                "characters": json.loads(row["characters_json"]),
                "props": json.loads(row["props_json"]),
                "wardrobe": json.loads(row["wardrobe_json"]),
                "continuity_markers": json.loads(row["continuity_markers_json"]),
            })
        return state
    finally:
        conn.close()


def get_all_scenes(job_id: str) -> list[SceneFacts]:
    """Get all processed scenes as SceneFacts objects."""
    conn = _get_connection(job_id)
    try:
        rows = conn.execute(
            "SELECT * FROM scenes ORDER BY scene_number ASC"
        ).fetchall()

        scenes = []
        for row in rows:
            scenes.append(SceneFacts(
                scene_number=row["scene_number"],
                location=row["location"],
                int_ext=row["int_ext"],
                time_of_day=row["time_of_day"],
                weather=row["weather"],
                characters=json.loads(row["characters_json"]),
                props=json.loads(row["props_json"]),
                wardrobe=json.loads(row["wardrobe_json"]),
                continuity_markers=json.loads(row["continuity_markers_json"]),
                raw_slugline=row["raw_slugline"],
                raw_text=row["raw_text"],
            ))
        return scenes
    finally:
        conn.close()


def cleanup_db(job_id: str) -> None:
    """Remove the database file for a completed/cancelled job."""
    db_path = _get_db_path(job_id)
    if db_path.exists():
        db_path.unlink()
