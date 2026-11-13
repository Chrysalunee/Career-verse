import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCompanyScene, mapInteractiveObjects } from '../js/world3d/workplaces.js';
import { visitMall, travelBetween } from '../js/world3d/mall.js';

const templates = JSON.parse(await readFile(new URL('../data/world/templates/templates.json', import.meta.url), 'utf8')).templates;
const workplaceMap = JSON.parse(await readFile(new URL('../data/world/company-workplaces.json', import.meta.url), 'utf8')).companies;

test('templates match company workplace metadata', () => {
  const company = { id: 'kopi-kilat', name: 'KopiKilat' };
  const scene = getCompanyScene(company, { companies: workplaceMap }, templates);
  assert.equal(scene.workplaceType, 'cafe');
  assert.equal(scene.sceneTemplate, 'cafe');
});

test('task objects map to the active profession data', () => {
  const scene = {
    objects: [
      { id: 'desk-1', name: 'Meja tim', taskProfessions: { 'digital-marketer': 0 } },
      { id: 'meeting-room', name: 'Ruang rapat', taskProfessions: { 'digital-marketer': 1 } },
    ],
  };
  const profession = {
    id: 'digital-marketer',
    tasks: [{ title: 'Riset audiens' }, { title: 'Briefing kampanye' }],
  };
  const mapped = mapInteractiveObjects(scene, profession);
  assert.equal(mapped[0].task.title, 'Riset audiens');
  assert.equal(mapped[1].task.title, 'Briefing kampanye');
});

test('mall interaction consumes money and updates energy', () => {
  const save = { money: 120000, energy: 72, stress: 25, skill: 1, world: { currentPlace: 'home' } };
  const result = visitMall(save, 'food-court');
  assert.equal(result.ok, true);
  assert.equal(save.money, 95000);
  assert.equal(save.world.currentPlace, 'mall');
  assert.ok(save.energy >= 80);
});

test('city travel updates current place and energy budget', () => {
  const save = { energy: 70, world: { currentPlace: 'home', visited: ['home'] } };
  const result = travelBetween(save, 'workplace', 'walk');
  assert.equal(result.ok, true);
  assert.equal(save.world.currentPlace, 'workplace');
  assert.equal(save.energy, 70);
});
