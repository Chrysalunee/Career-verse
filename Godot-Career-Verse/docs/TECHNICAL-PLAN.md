# Career-Verse — Godot Migration Plan

## Principles
1. Preserve the browser game and its source data.
2. Treat company/profession JSON as the migration source of truth, without claiming parity until Godot gameplay uses it.
3. Migrate in small testable slices and keep saves versioned.
4. Use original or properly licensed assets; clearly identify placeholders.
5. Keep browser and Godot save files separate until an explicit, tested import/export adapter exists.

## Stage 4 — 3D foundation
- [x] Godot project, main scene, third-person controller, collision, jump, procedural town, day/night, appearance prototype, local save/load.
- [ ] Godot editor/runtime validation on target hardware.
- [x] Reusable procedural humanoid blockout with separate limbs and a basic alternating walk cycle.
- [ ] Replace the blockout with licensed/original rigged humanoid GLB assets and a Skeleton3D animation state machine.

## Stage 5 — Playable life loop foundation
- [x] Hunger, energy, hygiene, social, and fun need values decay with simulated time.
- [x] Home, cafe/market, school, and park provide basic need/skill actions.
- [x] Resident waypoint routines using the shared humanoid visual and walk cycle.
- [x] Basic Android screen controls.
- [x] Versioned local save for position, time/day, appearance, needs, skill, and wallet.
- [ ] Godot editor/runtime and Android device validation.

## Remaining migration phases
### Career systems
- [ ] Load and validate profession/company JSON in Godot.
- [ ] Port job applications, interview choices, work tasks, pay cadence, reviews, and promotions.
- [ ] Define a deliberate browser/Godot save import/export schema; never silently overwrite either runtime's save.

### World and production quality
- [ ] Enterable home, office, cafe and market interiors.
- [ ] Replace procedural blockout characters with licensed/original rigged humanoids and animation blending.
- [ ] NPC schedules, dialogue, relationships, and navigation.
- [ ] Audio, accessibility settings, quality tiers, performance profiling, and export presets.

## First local validation checklist
- [ ] Import `Godot-Career-Verse/project.godot` in Godot 4.3+ without parse errors.
- [ ] Player remains grounded, moves, jumps, collides, and interacts with all six locations.
- [ ] Needs decrease over time and interactions restore the intended needs.
- [ ] NPCs move between waypoints without leaving the town area.
- [ ] Save, restart, and verify position, day/time, needs, skill, wallet, and appearance.
- [ ] Test touch buttons and safe-area layout on a physical Android device.
