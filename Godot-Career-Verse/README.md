# Career-Verse 3D — Godot 4 Life-Sim Foundation

This Godot 4 project lives alongside the browser Career-Verse prototype. The browser project remains intact; Godot is the standalone 3D town/life-sim foundation. Career hiring, company data, tasks, salary, and promotion are not yet fully migrated into Godot.

## Requirements
- Godot Engine 4.3 or newer (standard build; no add-ons required)
- Windows, Linux, or macOS desktop; Android export needs local export templates and Android SDK/JDK setup

## Run
1. Open Godot Project Manager.
2. Select **Import** and choose `Godot-Career-Verse/project.godot`.
3. Open the project and press **F5**.
4. For browser career gameplay, run the root browser app separately using a static server; see the repository root README.

## Controls
- `W A S D`: move
- `Shift`: run
- Mouse: orbit camera
- `E`: interact with the building in view
- `Space`: jump
- `Esc`: capture/release mouse
- **Karakter**: open appearance controls
- **Simpan**: save the Godot life-world progress locally
- Android: on-screen directional, run, jump, and interaction buttons

## Included vertical slice
- Procedural 3D town with home, workplace, cafe, market, school, and park interaction targets
- Third-person CharacterBody3D movement, spring arm camera, gravity, jump, and collision
- Day/night lighting and persistent in-game day/time
- Five basic life needs with simple decay/recovery loops
- Simple resident waypoint routines
- Placeholder appearance controls and local versioned JSON save/load
- Optional reading of browser company workplace mapping as reference data

## Known limitations
- Character and residents are primitive placeholders, not rigged humanoids.
- Godot has not been runtime-validated in the build environment. Open it in Godot 4.3+ and follow `docs/TECHNICAL-PLAN.md` validation checklist.
- NPCs do not yet have dialogue, relationships, schedules, or autonomous needs.
- Buildings are exterior interaction targets. Interiors, vehicles, full economy, inventory, and career progression are future migration work.
- Browser and Godot saves remain separate. Do not expect browser career progress to automatically appear in the Godot save yet.

## Project structure
- `scenes/main.tscn`: main scene
- `scripts/main.gd`: procedural town, needs, NPC routines, UI, save/load
- `scripts/player_controller.gd`: player movement, camera, interaction, appearance state
- `../Career-verse-main/`: preserved browser prototype and career data in the repository archive layout
