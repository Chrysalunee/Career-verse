# Career-Verse 3D — Godot 4 Starter Project

This folder contains the first Godot 4 foundation prototype alongside the original Three.js Career-Verse project in `../Career-verse-main/`.

## Requirements
- Godot Engine 4.3 or newer (standard build; no add-ons required)
- Windows, Linux, or macOS desktop

## Run
1. Extract the ZIP archive.
2. Open Godot Project Manager.
3. Choose **Import** and select this folder's `project.godot`.
4. Open the project and press **F6** or **F5**.

## Controls
- `W A S D`: move
- `Shift`: run
- Mouse: orbit camera
- `E`: interact with a building when facing it
- `Space`: jump
- `Esc`: capture/release mouse
- `Character` button: open appearance controls
- `Save Game`: save player position, appearance selections, and in-game time

## Included in this vertical slice
- Real 3D scene built with Godot nodes and meshes (not a 2D mockup)
- Third-person CharacterBody3D controller, camera orbit, spring arm, gravity, jump, and collision
- Procedurally assembled small town with roads, six interactable destinations, trees, lamps, and placeholder residents
- Basic day/night lighting cycle and in-game clock
- Basic appearance controls (gender presentation, skin tone, hair color, outfit color)
- Building interaction feedback
- Local JSON save/load

## Known limitations
- Character and NPC meshes are primitive placeholders, not final rigged humanoid models.
- Gender selection changes the placeholder body proportions; face, hairstyle geometry, body sliders, and clothing inventory are not yet implemented.
- NPCs are static visual placeholders; schedules, dialogue, relationships, and autonomous routines are not yet implemented in this Godot port.
- Buildings are exterior interaction points. Enterable interiors, doors, elevators, vehicles, audio, quests, inventory, needs, jobs, and full economy are future stages.
- The Godot prototype is a new engine foundation. Existing career, company, and profession systems remain preserved in `../Career-verse-main/` and have not yet been fully migrated into Godot.
- The project was source-reviewed and packaged here, but could not be run in the Godot editor/runtime in this environment. Import and run it in Godot 4.3+ to perform the first engine-side validation.

## Project structure
- `scenes/main.tscn`: main scene
- `scripts/main.gd`: town generation, lighting, UI, save/load
- `scripts/player_controller.gd`: player movement, camera, interaction, appearance state
- `../Career-verse-main/`: preserved existing browser prototype and data
