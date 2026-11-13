# Career-Verse — Technical Development Roadmap

## Repository audit (2026-11-13)

The supplied Stage 2 archive contains a browser-first JavaScript project (`type: module`) with HTML/CSS UI, JSON content data, Node's built-in test runner, and a Three.js 0.160.1 scene loaded from jsDelivr. It is not currently a Unity, Unreal, or Godot project.

### Existing systems worth preserving

- Career progression, profession/company catalogs, recruitment and workday simulation.
- Work schedules, meetings, messages, deadlines, interruptions and performance outcomes.
- Save migration and browser persistence (`career-verse-save`).
- Three.js workplace scene with a controllable 3D avatar, basic limb swing, NPC Bu Ratna, desk/coffee interactions, and a session clock/daylight tint.
- World-location and mall economy helper modules (these are currently mostly data/state systems, not fully modeled 3D destinations).

### Verified baseline

`npm test` completed successfully: **33 tests passed, 0 failed**. This validates the existing state/gameplay modules, not full browser/WebGL visual behavior. The repository's own changelog notes that a headless WebGL visual smoke test has not yet been completed.

## Engine decision

**Target engine for the expanded standalone simulator: Godot 4.** It is a better fit than a custom browser-only stack for a multi-scene 3D life simulator with humanoid animation, physics, navigation, NPC behavior, save data, and desktop builds. Blender + glTF/GLB will be the preferred asset pipeline. GDScript will be used for gameplay systems, with Godot's AnimationTree, CharacterBody3D, NavigationAgent3D, physics, and UI nodes.

**Transition strategy:** do not discard the working browser project. Keep it as a playable prototype and design reference while the Godot project is introduced in a separate `godot/` directory. Migrate gameplay rules and content data deliberately; preserve the existing career loop and save fields through explicit import/migration adapters. Do not claim feature parity until each migrated system is tested.

Three.js remains appropriate for the current browser vertical slice and quick iteration, but it should not silently become the long-term engine for the full open-world target without a deliberate product decision.

## Development phases

### Phase 0 — Audit and preservation
- [x] Inspect the supplied archive and repository structure.
- [x] Identify framework, rendering technology, data layout, persistence and test runner.
- [x] Run the existing automated tests.
- [x] Record the engine and migration strategy.

### Phase 1 — Playable 3D foundation
- [x] Retain the working 3D workplace scene and player movement.
- [x] Add mouse-drag camera orbit and camera-relative movement to the browser prototype.
- [x] Add simple obstacle blocking around major workplace furniture.
- [ ] Godot project bootstrap, input map, test scene and export presets.
- [ ] Replace primitive player mesh with a rigged, legally licensed humanoid model.
- [ ] Character creation: body preset, skin/hair/clothing options and saved appearance.
- [ ] Reliable collision, slope handling, animation state machine and camera obstruction.

### Phase 2 — Life simulation
- [ ] Central simulation clock and calendar independent of rendering frame rate.
- [ ] Hunger, energy, hygiene, health, happiness and social needs with tested decay/recovery.
- [ ] Home scene, sleep, food preparation, shower and rest interactions.
- [ ] NPC schedules and navigation, with persistent identities and relationship state.
- [ ] Economy ledger for wallet, bank, salary, rent, purchases and business income.

### Phase 3 — Career simulation
- [ ] Job application and hiring flows connected to existing profession/company data.
- [ ] Work activities represented by world objects and profession-specific tasks.
- [ ] Work hours, salary cadence, evaluation, promotion and skill progression.
- [ ] Professional relationships and career changes.

### Phase 4 — Expanded town
- [ ] Modular town blockout with residential, commercial, education, healthcare and recreation zones.
- [ ] Enterable buildings with separate interiors and persistent state.
- [ ] Navigation graph, transit, vehicles and travel costs.
- [ ] Shops, inventory, purchasable assets and player-owned businesses.

### Phase 5 — Production polish
- [ ] Original or properly licensed models, textures, animations, sound and music.
- [ ] Lighting, weather, day/night, LOD, occlusion and performance budgets.
- [ ] Accessibility, settings, localization, controller support and robust save backups.
- [ ] Automated gameplay tests plus manual visual/performance QA on target hardware.

## Current browser prototype controls

- `W A S D` / arrow keys: move relative to camera direction.
- Drag the mouse on the 3D view: orbit camera.
- `Shift`: run.
- `E`: interact with the nearby highlighted object.

## Known limitations

The browser scene is still a small workplace vertical slice. Its avatar is primitive procedural geometry, NPC behavior is a simple scripted patrol, and its day/night change is a lighting/sky tint approximation. It is not yet an open world, has no full character creator, no complete needs simulation, and no 3D home/mall/town interiors. Three.js is currently fetched from a CDN, so the browser prototype needs internet access unless the dependency is later vendored locally.
