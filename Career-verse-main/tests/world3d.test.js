import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateWorldSave, resolveWorkplace, tasksForObjects, moveWorldLocation, workplaceTypeFor } from '../js/world3d/workplaces.js';
import { travelTo } from '../js/world3d/city.js';
import { MALL_LOCATIONS, visitMall } from '../js/world3d/mall.js';
import { worldSceneModel } from '../js/world3d/index.js';

const templates = [
  { id: 'hq_office', workplaceType: 'hq_office', name: 'Kantor pusat', npcs: [{ name: 'Rekan kerja' }], objects: [{ id: 'desk', name: 'Meja kerja', taskIndex: 0, hint: 'Mulai tugas hari ini.' }] },
  { id: 'cafe', workplaceType: 'cafe', name: 'Kafe', npcs: [{ name: 'Pelanggan' }], objects: [{ id: 'espresso-machine', name: 'Mesin espresso', taskIndex: 0, hint: 'Siapkan pesanan pelanggan.' }] },
  { id: 'school', workplaceType: 'school', name: 'Ruang kelas', npcs: [{ name: 'Murid' }], objects: [{ id: 'class-board', name: 'Papan kelas', taskIndex: 0, hint: 'Jelaskan materi.' }] },
  { id: 'hospital', workplaceType: 'hospital', name: 'Rumah sakit', npcs: [{ name: 'Pasien' }], objects: [{ id: 'nurse-station', name: 'Meja perawat', taskIndex: 0, hint: 'Lakukan koordinasi klinis.' }] },
  { id: 'restaurant_kitchen', workplaceType: 'restaurant_kitchen', name: 'Dapur restoran', npcs: [{ name: 'Pelanggan' }], objects: [{ id: 'prep-station', name: 'Meja persiapan', taskIndex: 0, hint: 'Persiapkan pesanan.' }] },
  { id: 'coworking', workplaceType: 'coworking', name: 'Coworking', npcs: [{ name: 'Rekan' }], objects: [{ id: 'shared-desk', name: 'Meja bersama', taskIndex: 0, hint: 'Kolaborasi cepat.' }] },
  { id: 'home', workplaceType: 'home', name: 'Rumah', npcs: [{ name: 'Kamu' }], objects: [{ id: 'home-desk', name: 'Meja kerja', taskIndex: 0, hint: 'Kerjakan tugas mandiri.' }] },
  { id: 'mall_store', workplaceType: 'mall_store', name: 'Toko', npcs: [{ name: 'Pengunjung' }], objects: [{ id: 'shop-counter', name: 'Kasir', taskIndex: 0, hint: 'Layani pelanggan.' }] },
];

test('company metadata selects appropriate scene template', () => {
  assert.equal(workplaceTypeFor({ id: 'kopi-kilat' }), 'cafe');
  assert.equal(resolveWorkplace({ id: 'sma-nusa-bangsa', sceneTemplate: 'school' }, templates).id, 'school');
});

test('objects map to existing profession mini-games', () => {
  const profession = { id: 'programmer', tasks: [{ id: 'debug', title: 'Debug existing game' }] };
  const model = worldSceneModel({ id: 'nusa-global', workplaceType: 'hq_office' }, profession, templates);
  assert.equal(model.objects[0].task.title, 'Debug existing game');
  assert.ok(model.accessibleDescription.includes('Meja kerja'));
});

test('old saves migrate without changing legacy fields', () => {
  const old = { day: 8, energy: 61, professionId: 'guru' };
  const migrated = migrateWorldSave(old);
  assert.equal(migrated.day, 8);
  assert.equal(migrated.energy, 61);
  assert.equal(migrated.worldMode, 'menu');
  assert.deepEqual(migrated.world.visited, ['home']);
});

test('location change records visited places', () => {
  const save = migrateWorldSave({});
  moveWorldLocation(save, 'mall');
  assert.equal(save.world.currentPlace, 'mall');
  assert.ok(save.world.visited.includes('mall'));
});

test('optional commute deducts energy only when enabled', () => {
  const save = migrateWorldSave({ energy: 70 });
  travelTo(save, 'workplace', 'walk');
  assert.equal(save.energy, 70);
  save.world.transportEnabled = true;
  travelTo(save, 'mall', 'walk');
  assert.equal(save.energy, 67);
});

test('mall meal/learning purchases apply cost and wellness/skill effects', () => {
  const save = migrateWorldSave({ money: 300000, energy: 40, stress: 30, skill: 1 });
  const result = visitMall(save, 'mall-foodcourt');
  assert.equal(result.ok, true);
  assert.equal(save.energy, 65);
  assert.ok(save.money < 300000);
  assert.equal(MALL_LOCATIONS.length, 5);
});

