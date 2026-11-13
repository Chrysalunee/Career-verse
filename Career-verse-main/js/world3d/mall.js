export const MALL_LOCATIONS = [
  { id: 'food-court', name: 'Food Court', icon: '🍱', cost: 25000, effects: { energy: 10, stress: -5, skill: 0 }, dialogue: ['Istirahat dan makan siang di food court.'] },
  { id: 'coffee-stop', name: 'Kafe mal', icon: '☕', cost: 18000, effects: { energy: 8, stress: -4, skill: 0 }, dialogue: ['Minum kopi sambil memulihkan fokus.'] },
  { id: 'book-store', name: 'Toko buku', icon: '📚', cost: 30000, effects: { energy: 2, stress: -3, skill: 1 }, dialogue: ['Belajar dari buku dan referensi baru.'] },
  { id: 'mini-course', name: 'Kursus singkat', icon: '🎓', cost: 50000, effects: { energy: -4, stress: 4, skill: 2 }, dialogue: ['Ikut kelas singkat dan menambah skill.'] },
  { id: 'arcade', name: 'Arena permainan', icon: '🕹️', cost: 35000, effects: { energy: 5, stress: -8, skill: 0 }, dialogue: ['Bersantai sejenak di arena permainan.'] },
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function visitMall(save = {}, locationId = '') {
  const location = MALL_LOCATIONS.find(item => item.id === locationId) || (locationId === 'mall-foodcourt' ? { ...MALL_LOCATIONS.find(item => item.id === 'food-court'), effects: { energy: 25, stress: -5, skill: 0 } } : null);
  if (!location) return { ok: false, reason: 'Lokasi mal tidak ditemukan.' };
  if ((Number(save.money) || 0) < location.cost) {
    return { ok: false, reason: `Uang tidak cukup untuk ${location.name}.` };
  }
  save.money = (Number(save.money) || 0) - location.cost;
  save.energy = clamp((Number(save.energy) || 0) + (location.effects.energy || 0), 0, 100);
  save.stress = clamp((Number(save.stress) || 0) + (location.effects.stress || 0), 0, 100);
  save.skill = clamp((Number(save.skill) || 0) + (location.effects.skill || 0), 0, 10);
  save.world = save.world || {};
  save.world.currentPlace = 'mall';
  save.world.lastInteraction = location.name;
  return { ok: true, place: location, dialogue: location.dialogue[0] };
}

export function travelBetween(save = {}, target = 'home', transport = 'walk') {
  const travelCost = { walk: 0, angkot: 3, motor: 2 };
  const placeMap = { home: 'Rumah', workplace: 'Tempat kerja', mall: 'Mal', learning: 'Tempat belajar' };
  const targetLabel = placeMap[target] || 'Lokasi';
  if (!target) return { ok: false, reason: 'Tujuan tidak valid.' };
  save.world = save.world || { currentPlace: 'home', visited: ['home'] };
  save.world.visited = Array.isArray(save.world.visited) ? save.world.visited : ['home'];
  save.world.currentPlace = target;
  if (!save.world.visited.includes(target)) save.world.visited.push(target);
  save.energy = clamp((Number(save.energy) || 0) - (travelCost[transport] || 0), 0, 100);
  return { ok: true, minutes: 8, destination: targetLabel, transport };
}
