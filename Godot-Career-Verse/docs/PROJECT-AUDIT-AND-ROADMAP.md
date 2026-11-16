# Career-Verse — Repository Audit & Technical Development Plan

Audit date: 2026-11-16
Default branch: `main`

## 1. Repository findings

The repository contains two related but distinct applications:

- The browser prototype uses JavaScript ES modules, HTML/CSS, JSON data, Node's built-in test runner, and Three.js loaded from a CDN. It contains career selection, company/job recruitment, interviews, job offers, work tasks, salary, promotions, history, and local browser save data.
- `Godot-Career-Verse/` is a separate Godot 4.3+ project using GDScript and a procedural 3D town. Its current main scene builds the town and UI from scripts.

The Godot project already has a third-person `CharacterBody3D`, camera spring arm, WASD/run/jump/interact controls, six interaction locations (home, workplace, cafe, market, school, park), a day clock and directional light, five decaying needs, simple waypoint residents, basic interactions, appearance color controls, and a versioned local JSON save.

## 2. Verified gaps and risks

- Godot runtime/editor validation has not been completed; the project documentation explicitly records this limitation.
- Player and NPCs are primitive capsule/sphere placeholders, not rigged humanoids.
- Appearance options currently change a few primitive mesh materials and proportions; they are not a complete character creator.
- Buildings are exterior interaction targets. Enterable interiors, furniture and object-level interactions are not implemented.
- NPCs have waypoint movement only: no dialogue, schedules, relationships, occupations or autonomous needs.
- Godot does not yet use the browser career application flow. Job applications, interviews, profession tasks, salary, reviews and promotions remain browser-side.
- Godot's needs and wallet are a small local simulation, not yet a complete economy with bank, rent, bills, transport and business transactions.
- Godot and browser saves are separate. No tested migration adapter exists.
- The project currently has no integrated licensed rigged character/animation asset library. Procedural geometry must be clearly treated as a replaceable placeholder.
- Browser unit tests do not validate Godot parsing, 3D rendering, input, physics or Android export.

## 3. Technology decision

Use **Godot 4.x + GDScript** as the primary standalone game engine.

Reasons:
- Native 3D scene tree, physics, CharacterBody3D, animation, navigation, lighting and resource pipeline.
- One project can target Windows desktop and Android with engine export templates.
- GDScript keeps iteration accessible and fast for this project.
- GLB/glTF assets can be authored in Blender and imported into Godot.
- The browser prototype can remain available while career data and gameplay are migrated in controlled slices.

Renderer strategy:
- Use Forward+ for desktop quality.
- Keep the Mobile renderer override for Android and profile real devices before raising default quality.
- Add quality tiers (Low/Medium/High) after baseline profiling. “Ultra HD” must mean real high-resolution textures/models and measured output quality, not only a larger viewport or pixel ratio.

## 4. Target architecture

- `scenes/`: main world, player, locations/interiors, UI scenes.
- `scripts/player/`: movement, camera, interaction, appearance.
- `scripts/characters/`: reusable humanoid visuals, animation controller and NPC state.
- `scripts/simulation/`: needs, clock/calendar, economy, inventory and save schema.
- `scripts/career/`: professions, companies, applications, work tasks, salary and promotion.
- `scripts/world/`: locations, doors/interiors, navigation, schedules and weather.
- `data/`: versioned JSON resources migrated from browser data.
- `assets/characters`, `assets/environment`, `assets/ui`, `assets/audio`: original or properly licensed assets with attribution/license notes.
- Browser and Godot saves stay separate until a deliberate, tested import/export format is implemented.

## 5. Delivery roadmap

### Stage 1 — Playable 3D foundation
- [x] Godot project and main scene.
- [x] Basic third-person movement, camera, collision, jump and interaction ray.
- [x] Initial procedural town with six locations.
- [x] Day clock, simple lighting cycle, needs and local save.
- [ ] Replace single capsule player with a reusable articulated humanoid placeholder and visible locomotion.
- [ ] Add a clear interaction prompt and pause/settings flow.
- [ ] Validate project in Godot Editor and test desktop controls.

### Stage 2 — Life simulation
- [ ] Need actions tied to specific usable objects and location interiors.
- [ ] Inventory and item purchase/consumption.
- [ ] Wallet, bank ledger, recurring expenses and transaction history.
- [ ] Sleep, hygiene, meals, social activities and calendar.
- [ ] NPC daily routines, dialogue and relationship values.

### Stage 3 — Career simulation
- [ ] Migrate profession/company JSON with schema validation.
- [ ] Job application, interview and offer flow.
- [ ] Work activities, performance, salary, payday and promotions.
- [ ] Career switching and freelance/business path.

### Stage 4 — Expanded world
- [ ] Enterable home, office, cafe, market, school and public buildings.
- [ ] Navigation, transit and vehicles.
- [ ] More neighborhoods, services, events and careers.
- [ ] NPC occupations and schedules.

### Stage 5 — Production polish
- [ ] Licensed or original rigged humanoids, facial/locomotion animation and clothing.
- [ ] PBR environment assets, detailed interiors, vegetation, weather and audio.
- [ ] Accessibility, save migration, localization and settings.
- [ ] Performance profiling, Android touch UX, export presets and release QA.

## 6. Current implementation slice

The first implementation slice will establish a reusable articulated humanoid made from replaceable procedural meshes, so player and residents share one visual system. It is an interim development asset, not a claim of final semi-realistic production character quality. Next validation must be performed in Godot 4.3+ on Windows and a physical Android device.
