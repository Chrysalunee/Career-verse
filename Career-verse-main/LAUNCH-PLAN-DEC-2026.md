# Career-Verse — Launch Plan December 2026

Last reviewed: 18 November 2026

## Product direction

Career-Verse is a browser-first Indonesian life and career simulation. The December release target is a stable, playable Version 1.0—not a promise that every open-world feature will be complete.

Preserve the existing career game and its browser save format. The 3D world is an alternate interface to the same career state; the existing 2D/menu experience remains available as an accessibility and compatibility fallback.

## Repository audit findings

- The published project is a vanilla JavaScript ES-module application with HTML/CSS, JSON content data, and Node's built-in test runner.
- The existing game includes profession and company catalogs, recruitment/interview/offer flow, work tasks, schedules, meetings, messages, interruptions, deadlines, career progression, and browser save import/export.
- Browser persistence uses the `career-verse-save` localStorage key.
- The active 3D entry point is `js/world3d/app.js`, which imports the Stage 5 scene from `js/world3d/stage5.js`.
- The Stage 5 scene currently builds a stylized city from procedural Three.js geometry. It includes several named destinations and interactive world objects.
- Three.js is loaded from jsDelivr at runtime, so the 3D experience requires network access to that CDN.
- The repository roadmap records a Godot 4 direction for a future standalone simulator. The current GitHub Pages website is still the browser prototype; a Godot project is not yet present in the inspected repository tree.
- Existing documentation describes the 3D work as a prototype/vertical slice, not a complete open-world life simulator.

## Important architecture rule

Do not create a second independent game state for 3D. All world interactions must read and update the existing `career-verse-save` state, dispatch the established refresh event, and preserve unknown fields during save migration. Keep 2D and 3D as two views of the same simulation.

Do not replace the active Stage 5 scene with the older workplace-only scene in `js/world3d/index.js` unless a deliberate, tested migration is made. Verify imports before editing either implementation.

## Version 1.0 launch scope

### Must be reliable
- Game loads on supported desktop browsers without fatal JavaScript errors.
- Existing career flow remains playable from a fresh profile.
- Existing local saves are not overwritten by bundled starter data.
- Save export/import works and invalid files are rejected safely.
- 2D/menu mode remains available if WebGL or the 3D CDN is unavailable.
- 3D mode can open, close, resize, and return to the same career state.
- Player movement, camera controls, collision boundaries, and proximity interactions work consistently.
- At least a small set of destinations has meaningful, tested interactions.
- Clear loading, error, and control instructions are provided.
- Performance settings and reduced-quality fallback prevent avoidable crashes on mid-range PCs.

### Defer unless the core is stable
- Full city-scale open world and seamless streaming.
- Fully rigged custom humanoid characters and advanced facial animation.
- Large crowds with autonomous schedules.
- Vehicles and complex traffic simulation.
- Multiplayer, online accounts, and cloud saves.
- Large numbers of enterable interiors.

## Milestones

| Dates | Milestone | Exit criteria |
|---|---|---|
| 18–22 Nov | Audit and stabilization | Reproduce current bugs, map active entry points, protect save compatibility |
| 23–30 Nov | Core gameplay | Career state and 3D interactions remain synchronized; critical navigation and save tests pass |
| 1–7 Dec | World vertical slice | A polished, bounded city area with useful destinations and reliable interactions |
| 8–14 Dec | Integration and optimization | Desktop browser QA, resize/input tests, graceful CDN/WebGL fallback |
| 15–21 Dec | Beta | Regression suite passes; known issues documented; no data-loss defects |
| 22–31 Dec | Release candidate | Publish only after acceptance checks pass; otherwise ship a clearly labeled beta |

## QA checklist

- [ ] Run `npm test` and record the actual result.
- [ ] Test fresh profile and existing save profile separately.
- [ ] Test import/export and malformed save data.
- [ ] Test 3D open/close repeatedly without duplicate render loops or event listeners.
- [ ] Test browser resize, tab visibility changes, and WebGL unavailable state.
- [ ] Test movement, collision, camera orbit, and each interaction prompt.
- [ ] Test that each 3D action updates the same save fields shown by the 2D UI.
- [ ] Test desktop Chrome and at least one additional browser.
- [ ] Verify GitHub Pages deployment from the intended branch and base path.
- [ ] Keep a release changelog and rollback point.

## Working rules

1. Inspect the exact file and its callers before changing it.
2. Make focused commits on a launch branch; do not force-push or overwrite user work.
3. Do not claim a feature is complete until it has been tested.
4. Do not publish experimental work to the live site without a reviewed merge.
5. Record deferred features honestly and prioritize a stable playable release over a feature checklist.
