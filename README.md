# Kingdom Clash

A browser-based 3D medieval battlefield game built with JavaScript and Three.js.

## Project direction
- First-person only; the player is a battlefield commander.
- Historically inspired medieval setting (roughly 900–1200 AD, with creative flexibility).
- Battles and conquest are the focus, not kingdom management.
- Hybrid gameplay: personally fight and command troops.
- Single-player first; multiplayer comes later.

## Development roadmap
1. **Player Mechanics** — first-person movement, camera, controls, and commander. **Complete**
2. **Battle System** — battlefields, teams, combat, objectives, victory, and defeat. **Playable foundation complete**
3. **NPC Opponents** — enemy AI, soldiers, and enemy commanders.
4. **Coins and Recruitment** — start with 10 soldiers; earn battle coins and recruit more.
5. **Equipment Shops** — buy commander gear individually and army gear by entire unit.
6. **Commander XP** — separate experience, levels, and progression rewards.
7. **Multiplayer** — online battles against other players.
8. **Additional Content** — maps, units, weapons, armor, and battle types.

## Current stages
- [Stage 1 — Player Mechanics](Stage%201%20-%20Player%20Mechanics/README.md): polished training courtyard, first-person controls, sprinting, jumping, and basic collision.
- [Stage 2 — Battle System](Stage%202%20-%20Battle%20System/README.md): playable battle loop with melee strikes, opposing target units, capture objective, timer, and victory/defeat.

## Run the game
Open the project through a local web server (for example, VS Code Live Server), then open `Stage 1 - Player Mechanics/index.html`. Stage 2 is available from the Stage 1 menu or by opening `Stage 2 - Battle System/index.html`. Three.js is loaded from a CDN, so an internet connection is required.

### Controls
- **WASD** — move
- **Mouse** — look
- **Shift** — sprint
- **Space** — jump
- **Left click** — sword strike in Stage 2
- **Esc** — pause / release mouse
