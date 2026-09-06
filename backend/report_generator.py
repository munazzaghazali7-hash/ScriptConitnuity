"""
Report Generator — generate_report()
======================================

Assembles all contradictions into a clean, structured ContinuityReport
grouped by severity.
"""
from __future__ import annotations

from models import (
    Contradiction,
    ContinuityReport,
    SceneFacts,
    Severity,
    SummaryStats,
)


def generate_report(
    script_title: str,
    scenes: list[SceneFacts],
    contradictions: list[Contradiction],
) -> ContinuityReport:
    """
    Generate the final structured contradiction report.

    Args:
        script_title: Title of the screenplay.
        scenes: All processed scene facts.
        contradictions: All detected contradictions.

    Returns:
        A ContinuityReport ready for JSON serialization.
    """
    # Deduplicate contradictions (same scene pair + category)
    seen = set()
    unique_contradictions = []
    for c in contradictions:
        key = (min(c.scene_a, c.scene_b), max(c.scene_a, c.scene_b), c.category)
        if key not in seen:
            seen.add(key)
            unique_contradictions.append(c)

    # Sort: major first, then by scene number
    unique_contradictions.sort(
        key=lambda c: (0 if c.severity == Severity.MAJOR else 1, c.scene_a, c.scene_b)
    )

    # Add scene excerpts if missing
    scene_map = {s.scene_number: s for s in scenes}
    for c in unique_contradictions:
        if not c.scene_a_excerpt and c.scene_a in scene_map:
            s = scene_map[c.scene_a]
            c.scene_a_excerpt = f"{s.raw_slugline}\n{s.raw_text[:200]}..."
        if not c.scene_b_excerpt and c.scene_b in scene_map:
            s = scene_map[c.scene_b]
            c.scene_b_excerpt = f"{s.raw_slugline}\n{s.raw_text[:200]}..."

    # Build summary stats
    category_counts: dict[str, int] = {}
    for c in unique_contradictions:
        cat = c.category.value
        category_counts[cat] = category_counts.get(cat, 0) + 1

    summary = SummaryStats(
        total_scenes=len(scenes),
        total_contradictions=len(unique_contradictions),
        major_count=sum(1 for c in unique_contradictions if c.severity == Severity.MAJOR),
        minor_count=sum(1 for c in unique_contradictions if c.severity == Severity.MINOR),
        categories=category_counts,
    )

    return ContinuityReport(
        script_title=script_title,
        total_scenes=len(scenes),
        scenes=scenes,
        contradictions=unique_contradictions,
        summary=summary,
    )
