# Career-Verse — Godot Migration Plan

## Why Godot 4
Godot 4 provides a native 3D scene tree, CharacterBody3D physics, AnimationTree, navigation, UI controls, resource workflows, and desktop export without licensing fees. The current repository is a Three.js browser prototype; the Godot project is therefore developed alongside it rather than replacing it abruptly.

## Migration principles
1. Preserve the original browser game and all source data.
2. Treat JSON profession/company/world data as the first migration source of truth.
3. Port systems in small, testable slices; do not claim a system is migrated until it is playable in Godot.
4. Use original or properly licensed assets; keep placeholder assets clearly identified.
5. Keep save data versioned before adding more complex systems.

## Stage 4 — Playable 3D foundation
- [x] Godot project and main scene
- [x] Third-person movement and mouse camera
- [x] Collision, gravity, and jump
- [x] Procedural town blockout and interactable destinations
- [x] Basic day/night lighting and clock
- [x] Appearance-selection prototype
- [x] Local save/load prototype
- [ ] Godot editor/runtime validation on target hardware
- [ ] Rigged humanoid model, face/hair customization, and animation state machine

## Next stages
### Stage 5 — Character and life systems
- Import a licensed humanoid model with idle/walk/run animations
- Build character creator resources and persist selections
- Add hunger, energy, hygiene, health, happiness, and social meters
- Add sleep, eating, showering, and rest interactions

### Stage 6 — NPC and interiors
- Replace static placeholders with CharacterBody3D NPCs
- Add NavigationRegion3D, schedules, dialogue, and relationship data
- Build enterable home, office, cafe, and market interiors

### Stage 7 — Career and economy
- Port profession/company JSON into Godot Resources or validated JSON loaders
- Implement applications, work tasks, performance, salary, expenses, wallet, and bank
- Add skill progression and career changes

### Stage 8 — Content and release quality
- Expand town districts and transport
- Add audio, VFX, accessibility, settings, and optimized lighting
- Add automated gameplay tests and desktop export presets

## Validation checklist for the first local run
- Project imports without parse errors in Godot 4.3+
- Player stands on the ground and does not fall through it
- WASD movement and mouse orbit work
- Player collides with building shells
- E displays building interaction text when aimed at a building
- Character controls change placeholder appearance
- Save Game writes a JSON save; restarting restores position and selections
