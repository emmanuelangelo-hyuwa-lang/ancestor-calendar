# Ancestor Calendar™

> Your ancestors did not survive thousands of years of hardship for you to casually pick a calendar date. **Earn your appointment.**

A luxury AI productivity app that accidentally became the world's most inconvenient calendar.

## Run it

No build step. No `npm install`. Just serve the folder:

```bash
cd ancestor-calendar
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` mostly works too, but a server is recommended so the Gemini `fetch` and the YouTube embed behave.)

## The gauntlet

1. **Cinematic loading ritual** — the ancestral protocol initializes. Do not close it.
2. **Ancestral intake** — first name + country of origin. Produces a *fictional* ancestral profile with a crest and traits.
3. **The Orb of Destiny** — you may not click a date. You drop a ball into a Matter.js pegboard with spinning chaos paddles. It bounces into a slot. That slot is your **month**. Then you drop it again for your **day**. The year is locked by the council.
4. **Mathematical verification** — your date is converted to a day-of-year number (e.g. Aug 14 → 226). You must type its square (51,076). The ancient calculator spirits deliberate.
5. **Wrong answer** → the screen shakes, `ANCESTRAL REJECTION DETECTED`, and a certain 1987 music video opens in a modal. *You tried to cheat destiny.* Buttons: **Accept defeat** / **Try Again**.
6. **Mission declaration** — a dramatic event form ("What important mission are you scheduling?", "Where shall destiny unfold?").
7. **ASK YOUR ANCESTORS** — the event is *not* saved until the council rules on it. You get an Ancestral Approval Score with itemized reasons, a Destiny Confidence Meter, a Historical Comparison, a Wisdom Category, and a theatrical verdict.
8. **The timeline** — events render as `Mission: X`. Delete is **Erase this timeline decision**. Edit is **Challenge destiny** (which voids the event and makes you drop the orb again — challenging destiny has consequences).

Plus: an **Ancestral Streak**, **Event Difficulty ratings** (Easy → Legendary, with Legendary literally pulsing red), and random dramatic notifications like *"Your calendar has detected hesitation."*

## The AI (optional)

Click the ⚙ in the bottom-right and paste a **Gemini API key** to get live, generated ancestral verdicts (`gemini-2.0-flash`).

**Without a key the app still works fully** — it falls back to "the offline scrolls," a local generator that composes verdicts from the same comedic beats. The demo never breaks, and no key is needed to show it off.

The prompt explicitly instructs the model that it is a *fictional* dramatic advisor, must never claim knowledge of the user's real family or ancestry, must be playful about the selected country rather than insulting, and must land on an approving note.

## Tone guardrail

The ancestral council is **imaginary** and says so — on the intake screen, in the profile copy, and in the AI system prompt. Every country profile is written as affectionate teasing (the German council keeps a spreadsheet about you; the Canadian council apologizes to your calendar; the Egyptian council built things to last 5,000 years and is being *very polite* about your 45-minute sync). No real ancestry is claimed or inferred.

## Stack

- Vanilla JS state machine (8 screens) — zero dependencies to install
- **Matter.js** (CDN) for the pegboard physics; if the CDN is unreachable, destiny improvises via a fallback
- Hand-written CSS: obsidian/gold ceremonial design system, glassmorphism, ~20 keyframe animations, full responsive + `prefers-reduced-motion` support
- `localStorage` for profile, events, streak, and API key

## Files

| File | What it holds |
|---|---|
| `index.html` | All 8 screens + modals |
| `styles.css` | The design system and every dramatic animation |
| `app.js` | State machine, physics board, math trial, scoring heuristics, Gemini + offline council |
