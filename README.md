# Kingdom Clash

A browser-based 3D first-person World War I frontline game built with JavaScript and Three.js.

## Current direction
- World War I setting with a muddy road between two flag bases.
- First-person commander gameplay.
- Visible first-person weapon prop and a deployable portable armor shield.
- Friendly and opposing soldiers physically present in the same world and engaging each other with simple arcade-style game logic.
- Capture the opposing flag after clearing the opposing team.
- Pre-match class selection: Rifleman, Medic, Engineer, Support, Scout, and Officer.\n- Class perks affect health, movement, ammunition, reload time, or nearby squad support.\n- Frontlines-inspired team-battle direction; multiplayer and broader progression come later.

## Current controls
| Input | Action |
|---|---|
| W / A / S / D | Move |
| Double-tap W | Sprint while W is held |
| Mouse | Look |
| Left click | Fire |
| Right click (hold) | Aim down sights |
| R | Reload |
| Shift | Deploy / retract portable armor shield |
| Esc | Pause / release mouse |

The shield stays deployed until Shift is pressed again. Movement is slower while it is deployed.

## Current class roles\n- Rifleman: balanced baseline.\n- Medic: gradually heals nearby friendly soldiers.\n- Engineer: extra personal health.\n- Support: larger ammunition supply.\n- Scout: faster movement with less health.\n- Officer: nearby friendly soldiers attack more frequently.\n\n## Development roadmap
1. **Player mechanics** — first-person movement, visible equipment, aiming, shield, and controls.
2. **Battlefield and combat foundation** — road, opposing bases, squads, simple combat behavior, and capture objective.
3. **Improved NPCs** — better soldier models, squad behavior, and battlefield roles.
4. **Coins and recruitment** — start with 10 soldiers; earn battle coins and recruit more.
5. **Equipment progression** — commander and squad equipment.
6. **Commander XP** — separate experience, levels, and rewards.
7. **Multiplayer** — online battles.
8. **Additional content** — maps, squads, objectives, and game modes.

## Run the game
Open `Stage 1 - Player Mechanics/index.html` through a local web server (for example, VS Code Live Server), or use the GitHub Pages site. Three.js loads from a CDN, so an internet connection is required.
