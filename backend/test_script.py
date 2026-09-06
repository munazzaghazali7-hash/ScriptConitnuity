"""
Test Screenplay Generator
===========================

Generates a ~15-scene noir thriller screenplay PDF with 3 deliberate
continuity errors for demo purposes:

1. WEATHER MISMATCH: Scene 3 establishes heavy rain → Scene 9 flashback
   to "earlier that same day" describes bright sunshine
2. DISAPPEARING PROP: Scene 5 places a revolver on a desk → Scene 7
   (same location, no one entered/left) the desk is described as empty,
   character reaches for the gun
3. WARDROBE INCONSISTENCY: Scene 11 shows character wearing a red jacket →
   Scene 12 (continuous, "moments later") character is in a blue sweater
"""
from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# ---------------------------------------------------------------------------
# Screenplay content
# ---------------------------------------------------------------------------

TITLE = "THE LAST ARRANGEMENT"

SCENES = [
    # Scene 1
    {
        "slugline": "EXT. DOWNTOWN CHICAGO - NIGHT",
        "body": """The city glows under a canopy of streetlights. Steam rises from grates. The sidewalks are wet from an earlier drizzle.

DETECTIVE SARAH MALONE (40s, sharp eyes, world-weary) walks briskly down Michigan Avenue. She wears a long black trench coat and carries a worn leather briefcase.

Her phone buzzes.

SARAH
(answering)
Malone.

DISPATCH (V.O.)
Detective, we've got a body at the Eldridge Hotel. Room 714.

SARAH
On my way.

She hails a cab.""",
    },
    # Scene 2
    {
        "slugline": "INT. ELDRIDGE HOTEL - LOBBY - NIGHT",
        "body": """Sarah pushes through the revolving doors into a grand, art-deco lobby. Crystal chandeliers cast warm light across marble floors.

OFFICER CHEN (30s, by-the-book) meets her at the elevator bank.

CHEN
Victim is Marcus Webb, 52. Hotel guest. Housekeeping found him two hours ago.

SARAH
Cause of death?

CHEN
Looks like blunt force trauma. ME's upstairs.

They step into the elevator.""",
    },
    # Scene 3 — ⚡ ESTABLISHES HEAVY RAIN (will conflict with Scene 9)
    {
        "slugline": "EXT. ELDRIDGE HOTEL - ROOFTOP - NIGHT",
        "body": """Sarah steps onto the rooftop terrace. HEAVY RAIN pounds down, drenching her immediately. Lightning cracks across the sky. The wind howls.

She pulls her trench coat tighter against the downpour.

Through the rain, she spots a security camera pointed at the fire escape.

SARAH
(shouting over the storm)
Chen! Get me the footage from this camera. Last 48 hours.

She shields her eyes from the driving rain and looks down at the alley below. A dumpster, a fire escape ladder, and nothing else.

The storm intensifies. Thunder rolls across the lake.""",
    },
    # Scene 4
    {
        "slugline": "INT. ELDRIDGE HOTEL - ROOM 714 - NIGHT",
        "body": """The hotel room is a crime scene. Yellow tape. Evidence markers. FORENSIC TECH DAVIS dusts for prints.

Marcus Webb lies face-down near the window. Blood pooled beneath his head.

Sarah crouches beside the body. She notices a GOLD POCKET WATCH clutched in Webb's right hand.

SARAH
Davis, bag this watch. And get me a close-up of these scratches on his wrist.

She stands and surveys the room. An open briefcase on the bed. Documents scattered.

SARAH (CONT'D)
Someone was looking for something.""",
    },
    # Scene 5 — ⚡ PLACES REVOLVER ON DESK (will conflict with Scene 7)
    {
        "slugline": "INT. SARAH'S APARTMENT - STUDY - NIGHT",
        "body": """Sarah's home office. Walls covered in case files and photographs. A desk lamp throws a warm pool of light.

She drops her briefcase on a chair and pulls her SERVICE REVOLVER from her shoulder holster. She places the REVOLVER deliberately on the center of her desk, next to a framed photo of her late partner.

SARAH
(to the photo)
Another long one, Jack.

She opens her laptop and begins reviewing Webb's financial records. Her coffee mug sits beside the revolver. The gun's chrome finish catches the lamplight.

She works late into the night, the revolver always within arm's reach on the desk.""",
    },
    # Scene 6
    {
        "slugline": "INT. ELDRIDGE HOTEL - MANAGER'S OFFICE - DAY",
        "body": """Morning. Sarah sits across from HOTEL MANAGER PATRICIA VOSS (60s, perfectly composed).

VOSS
Mr. Webb had been a guest for three weeks. Always paid in cash. Very private.

SARAH
Any visitors?

VOSS
(hesitating)
There was a woman. Came by twice. Tall, dark hair. I never got her name.

Sarah makes a note in her notebook.

SARAH
I'll need your guest registry for the entire floor. And your staff schedule.

VOSS
Of course, Detective.""",
    },
    # Scene 7 — ⚡ PROP CONTINUITY ERROR: Desk described as empty, reaches for gun
    {
        "slugline": "INT. SARAH'S APARTMENT - STUDY - NIGHT",
        "body": """Sarah returns to her study. Same desk, same lamp. Nobody has been in the apartment since she left.

The desk is clean and empty — just her laptop and the framed photo. No coffee mug, no papers.

She hears a noise from the hallway. Instinct kicks in.

SARAH
(whispering)
Who's there?

She reaches across the empty desk for her revolver, but her hand finds nothing. She fumbles in the desk drawer instead and pulls out a flashlight.

She moves toward the hallway, flashlight raised.""",
    },
    # Scene 8
    {
        "slugline": "INT. SARAH'S APARTMENT - HALLWAY - CONTINUOUS",
        "body": """Sarah edges down the dark hallway, flashlight beam cutting through shadow. The floor creaks under her feet.

At the end of the hall, the front door stands slightly ajar. She didn't leave it open.

She pushes it wide. The corridor outside is empty. A draft of cold air.

She checks the lock. No sign of forced entry.

SARAH
(to herself)
You're losing it, Malone.

She closes and deadbolts the door.""",
    },
    # Scene 9 — ⚡ WEATHER CONTRADICTION: Flashback "earlier same day" but bright sunshine
    {
        "slugline": "EXT. LAKEFRONT PARK - DAY - FLASHBACK (EARLIER THAT SAME DAY)",
        "body": """FLASHBACK — EARLIER THAT SAME DAY

Bright sunshine bathes the lakefront. Not a cloud in the sky. The water sparkles under clear blue skies. It's a gorgeous, warm afternoon.

Sarah sits on a park bench, sunglasses on, enjoying the unseasonably clear weather. Children play on the grass nearby.

Her phone rings. She squints in the bright sunlight.

SARAH
Malone.

DISPATCH (V.O.)
Detective, we've got a body at the Eldridge Hotel.

The sunny day continues around her as she stands and heads for her car, parked under a clear sky.

END FLASHBACK""",
    },
    # Scene 10
    {
        "slugline": "INT. POLICE PRECINCT - BULLPEN - DAY",
        "body": """The precinct buzzes with activity. Sarah sits at her desk, reviewing security footage on a monitor.

DETECTIVE RAY OKOYE (50s, her new partner, methodical) drops a file on her desk.

OKOYE
Webb's phone records. Fourteen calls to the same burner in the last week.

SARAH
Can we trace it?

OKOYE
Already on it. And something else — Webb had a storage unit on the south side. Paid up through next year.

Sarah leans back, thinking.

SARAH
Let's get a warrant.""",
    },
    # Scene 11 — ⚡ ESTABLISHES RED JACKET (will conflict with Scene 12)
    {
        "slugline": "EXT. SOUTH SIDE STORAGE FACILITY - DAY",
        "body": """A sprawling concrete storage complex. Sarah and Okoye pull up in an unmarked car.

Sarah steps out wearing a BRIGHT RED LEATHER JACKET over a white blouse. The jacket is distinctive — cherry red, cropped at the waist.

OKOYE
Nice jacket. New?

SARAH
Birthday present to myself.

They approach Unit 47. Sarah holds up the warrant while Okoye works the bolt cutters on the padlock.

The lock snaps. They slide the door up.

Inside: boxes, a filing cabinet, and a large wall safe.""",
    },
    # Scene 12 — ⚡ WARDROBE CONTRADICTION: "Moments later" but different outfit
    {
        "slugline": "INT. SOUTH SIDE STORAGE FACILITY - UNIT 47 - MOMENTS LATER",
        "body": """MOMENTS LATER — CONTINUOUS

Sarah, now wearing a BLUE WOOL SWEATER and dark jeans, pulls open the filing cabinet drawers one by one. No red jacket in sight. No explanation for the change.

OKOYE
(reading a document)
Webb was running a shell company. Funneling money through three different banks.

Sarah pulls a thick MANILA ENVELOPE from the bottom drawer. Inside: photographs. Surveillance shots of a woman — the same dark-haired woman from the hotel.

SARAH
(studying the photos)
Who are you?

She flips to the last photo. The woman is standing outside the Eldridge Hotel. The timestamp reads two days before Webb's murder.

OKOYE
We need to find her.""",
    },
    # Scene 13
    {
        "slugline": "INT. POLICE PRECINCT - CONFERENCE ROOM - DAY",
        "body": """Sarah pins the surveillance photos to a corkboard. Okoye works a laptop.

OKOYE
Got a match. Elena Varga. Import-export business registered in Delaware. Three addresses, all P.O. boxes.

SARAH
She's a ghost.

OKOYE
Not entirely. She made a credit card purchase at a restaurant on Clark Street. Last night.

SARAH
Then she's still in the city.

She grabs her coat.

SARAH (CONT'D)
Let's go have a conversation.""",
    },
    # Scene 14
    {
        "slugline": "INT. RESTAURANT - CLARK STREET - EVENING",
        "body": """An upscale Italian restaurant, half-empty on a weeknight. Candles on white tablecloths.

Sarah and Okoye find ELENA VARGA (30s, composed, watchful) alone at a corner table, nursing a glass of red wine.

SARAH
Elena Varga?

ELENA
(not surprised)
Detective. I wondered when you'd find me.

Sarah sits across from her.

SARAH
Tell me about Marcus Webb.

ELENA
(carefully)
Marcus was a collector. Of art. Of secrets. Of enemies.

SARAH
And which were you?

Elena smiles but doesn't answer. She takes a slow sip of wine.""",
    },
    # Scene 15
    {
        "slugline": "EXT. RESTAURANT - CLARK STREET - NIGHT",
        "body": """Sarah and Okoye step out onto the sidewalk. The night air is cold.

OKOYE
She knows more than she's saying.

SARAH
She knows everything. She's just deciding how much to give us.

Sarah's phone buzzes. A text message from an unknown number: "CHECK THE WATCH."

She stares at it. The gold pocket watch from Webb's hand.

SARAH
Ray, we need to go back to evidence lockup. Now.

They hurry to the car as the city lights reflect off the wet pavement.

FADE OUT.

THE END""",
    },
]


# ---------------------------------------------------------------------------
# PDF generation
# ---------------------------------------------------------------------------

def generate_test_screenplay(output_path: str | Path | None = None) -> Path:
    """
    Generate a test screenplay PDF with deliberate continuity errors.

    Args:
        output_path: Where to save the PDF. Defaults to data/test_screenplay.pdf

    Returns:
        Path to the generated PDF.
    """
    if output_path is None:
        output_path = Path(__file__).parent / "data" / "test_screenplay.pdf"
    else:
        output_path = Path(output_path)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=1.5 * inch,
        rightMargin=1 * inch,
        topMargin=1 * inch,
        bottomMargin=1 * inch,
    )

    # Styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ScreenplayTitle",
        parent=styles["Title"],
        fontName="Courier-Bold",
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=36,
    )

    slugline_style = ParagraphStyle(
        "Slugline",
        parent=styles["Normal"],
        fontName="Courier-Bold",
        fontSize=12,
        spaceBefore=24,
        spaceAfter=12,
        textTransform="uppercase",
    )

    action_style = ParagraphStyle(
        "Action",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=12,
        spaceBefore=6,
        spaceAfter=6,
        leading=14,
    )

    # Build story
    story = []

    # Title page
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph(TITLE, title_style))
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph("Written by", ParagraphStyle(
        "Byline", parent=styles["Normal"],
        fontName="Courier", fontSize=12, alignment=TA_CENTER,
    )))
    story.append(Paragraph("Demo Script — Script Continuity Agent", ParagraphStyle(
        "Author", parent=styles["Normal"],
        fontName="Courier", fontSize=12, alignment=TA_CENTER, spaceBefore=6,
    )))
    story.append(Spacer(1, 3 * inch))
    story.append(Paragraph(
        "NOTE: This screenplay contains deliberate continuity errors for testing purposes.",
        ParagraphStyle(
            "Note", parent=styles["Normal"],
            fontName="Courier-Oblique", fontSize=10, alignment=TA_CENTER,
        ),
    ))

    # FADE IN
    story.append(Spacer(1, inch))
    story.append(Paragraph("FADE IN:", action_style))
    story.append(Spacer(1, 12))

    # Scenes
    for i, scene in enumerate(SCENES):
        # Slugline (all caps, bold)
        story.append(Paragraph(scene["slugline"].upper(), slugline_style))

        # Body — split into paragraphs
        body_lines = scene["body"].strip().split("\n")
        current_para = []

        for line in body_lines:
            stripped = line.strip()
            if stripped == "":
                if current_para:
                    text = "<br/>".join(current_para)
                    story.append(Paragraph(text, action_style))
                    current_para = []
                story.append(Spacer(1, 6))
            else:
                # Check if it's a character name (all caps, short)
                if stripped.isupper() and len(stripped) < 40 and "." not in stripped[:4]:
                    if current_para:
                        text = "<br/>".join(current_para)
                        story.append(Paragraph(text, action_style))
                        current_para = []
                    char_style = ParagraphStyle(
                        "Character", parent=action_style,
                        alignment=TA_CENTER, fontName="Courier-Bold",
                    )
                    story.append(Paragraph(stripped, char_style))
                elif stripped.startswith("(") and stripped.endswith(")"):
                    # Parenthetical
                    paren_style = ParagraphStyle(
                        "Paren", parent=action_style,
                        leftIndent=1.5 * inch, fontName="Courier",
                    )
                    story.append(Paragraph(stripped, paren_style))
                else:
                    current_para.append(stripped)

        if current_para:
            text = "<br/>".join(current_para)
            story.append(Paragraph(text, action_style))

    doc.build(story)
    print(f"✅ Generated test screenplay: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_test_screenplay()
