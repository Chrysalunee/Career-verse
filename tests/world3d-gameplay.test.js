import test from 'node:test';
import assert from 'node:assert/strict';
import { applyWorldTask, getCompanyScene, mapInteractiveObjects, moveWorld, readSave } from '../js/world3d/gameplay.js';
import { readFile } from 'node:fs/promises';
const templates = JSON.parse(await readFile(new URL('../data/world/templates/templates.json', import.meta.url), 'utf8')).templates;
const metadata = JSON.parse(await readFile(new URL('../data/world/company-workplaces.json', import.meta.url), 'utf8'));
test('loads company-appropriate workplace and maps existing profession tasks', () => {
  const company = { id: 'kopi-kilat', name: 'KopiKilat' };
  const scene = getCompanyScene(company, metadata, templates);
  assert.equal(scene.workplaceType, 'cafe');
  const mapped = mapInteractiveObjects(scene, { id: 'chef', tasks: [{ title: 'Racik pesanan' }, { title: 'Layani kasir' }] });
  assert.equal(mapped[0].task.title, 'Racik pesanan');
});
test('legacy save is safely augmented without losing old values', () => {
  const migrated = readSave(JSON.stringify({ day: 7, energy: 55, companyId: 'nusa-global' }));
  assert.equal(migrated.day, 7); assert.equal(migrated.energy, 55); assert.equal(migrated.world.currentPlace, 'home');
});
test('travel uses menu locations and can optionally charge energy', () => {
  const save = readSave(JSON.stringify({ energy: 70 }));
  moveWorld(save, 'mall', 'walk'); assert.equal(save.energy, 70); assert.equal(save.world.currentPlace, 'mall');
  save.world.transportEnabled = true; moveWorld(save, 'workplace', 'walk'); assert.equal(save.energy, 67);
});
test('task mini-game preserves familiar career stats and increments legacy progress', () => {
  const save = readSave(JSON.stringify({ energy: 90, stress: 10, tasksDone: 1, day: 2 }));
  const result = applyWorldTask(save, { title: 'Plan campaign', options: [{ score: 90, feedback: 'Bagus.' }] }, 0);
  assert.equal(result.ok, true); assert.equal(save.tasksDone, 2); assert.equal(save.day, 3); assert.equal(save.lastResult.score, 90);
});
