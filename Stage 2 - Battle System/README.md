# Stage 2 — Battle System

**Status: Playable foundation complete**

## Goal
Create a complete first battle loop: enter the field, clear the opposing training line, capture the standard, and win before time runs out.

## Included
- Separate first-person battle arena.
- Blue commander side versus red opposing side.
- Click-to-swing sword with cooldown and hit detection.
- Three stylized opposing training guards with health bars. They are stationary in this stage; movement and combat AI are Stage 3.
- Commander health, battle timer, and objective progress.
- Clear the opposing line, then hold the central capture area to secure the standard.
- Victory and defeat screens with a restart option.
- Non-graphic, arcade-style combat feedback.

## Controls

| Input | Action |
|---|---|
| W / A / S / D | Move |
| Mouse | Look |
| Shift | Sprint |
| Space | Jump |
| Left click | Sword strike |
| Esc | Pause / release mouse |

## Battle rules
1. Strike each of the three red training guards three times to clear the line.
2. Enter the marked capture zone and remain inside it for 8 seconds.
3. Win by securing the standard before the 3-minute timer expires.
4. The timer reaching zero is a defeat.

## Stage boundary
Enemy guards are stationary target units in Stage 2. Enemy pathfinding, attacks, formations, and commander AI are intentionally reserved for Stage 3. This keeps the battle rules separate from opponent intelligence.
