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
2. **Battle System** — combat and objectives integrated into the same courtyard and commander. **Integrated playable foundation**
3. **NPC Opponents** — enemy AI, soldiers, and enemy commanders.
4. **Coins and Recruitment** — start with 10 soldiers; earn battle coins and recruit more.
5. **Equipment Shops** — buy commander gear individually and army gear by entire unit.
6. **Commander XP** — separate experience, levels, and progression rewards.
7. **Multiplayer** — online battles against other players.
8. **Additional Content** — maps, units, weapons, armor, and battle types.

## Current stages
- [Stage 1 — Player Mechanics](Stage%201%20-%20Player%20Mechanics/README.md): the shared world and commander foundation.
- [Stage 2 — Battle System](Stage%202%20-%20Battle%20System/README.md): combat and objectives added directly to the Stage 1 world. There is one game entry point, not separate stage games.

## Run the game
Open the project through a local web server (for example, VS Code Live Server), then open `Stage 1 - Player Mechanics/index.html`. Stage 2 begins inside the same world: walk toward the red standard near the training hall and press E when prompted. Three.js is loaded from a CDN, so an internet connection is required.

### Controls
- **WASD** — move
- **Mouse** — look
- **Shift** — sprint
- **Space** — jump
- **E** — muster for battle near the red standard
- **Left click** — sword strike during battle
- **Esc** — pause / release mouse
