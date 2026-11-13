// Pure state/geometry helpers used by the isometric-style world screen.
export const WORLD_SAVE_KEY = 'career-verse-save';
export const PLACE_LABELS = { home: 'Rumah', workplace: 'Tempat kerja', mall: 'Mal', learning: 'Tempat belajar' };
export function readSave(raw) {
  try { return { ...(raw ? JSON.parse(raw) : {}), world: { currentPlace: 'home', visited: ['home'], transportEnabled: false, ...(JSON.parse(raw || '{}').world || {}) } }; }
  catch { return { world: { currentPlace: 'home', visited: ['home'], transportEnabled: false } }; }
}
export function getCompanyScene(company, metadata = {}, templates = []) {
  const extra = metadata.companies?.[company?.id] || {};
  const workplaceType = company?.workplaceType || extra.workplaceType || 'hq_office';
  const sceneTemplate = company?.sceneTemplate || extra.sceneTemplate || workplaceType;
  const template = templates.find(item => item.id === sceneTemplate) || templates.find(item => item.workplaceType === workplaceType) || null;
  if (!template) return null;
  return { ...template, ...extra, workplaceType, companyId: company.id, companyName: company.name, accent: extra.sceneAccent || template.accent || '#83e0ad', decor: extra.sceneDecor || template.decor || [] };
}
export function mapInteractiveObjects(scene, profession) {
  const tasks = profession?.tasks || [];
  return (scene?.objects || []).map(object => {
    const index = object.taskProfessions?.[profession?.id] ?? object.taskIndex;
    return { ...object, task: Number.isInteger(index) ? tasks[index] || null : tasks.find(task => task.id === object.taskId) || null };
  });
}
export function applyWorldTask(save, task, optionIndex) {
  const option = task?.options?.[optionIndex];
  if (!option) return { ok: false };
  const score = Math.max(0, Math.min(100, Number(option.score) || 0));
  const beforeEnergy = Number(save.energy) || 0;
  const energyLoss = score >= 80 ? 7 : score >= 55 ? 10 : 13;
  save.energy = Math.max(0, beforeEnergy - energyLoss);
  save.stress = Math.min(100, (Number(save.stress) || 0) + (score >= 80 ? 2 : score >= 55 ? 5 : 9));
  save.reputation = Math.max(0, Math.min(100, (Number(save.reputation) || 0) + (score >= 85 ? 4 : score >= 65 ? 2 : score < 40 ? -1 : 0)));
  save.internal = Math.max(0, Math.min(100, (Number(save.internal) || 0) + (score >= 75 ? 3 : 0)));
  save.relationship = Math.max(0, Math.min(100, (Number(save.relationship) || 0) + (score >= 75 ? 3 : 1)));
  save.satisfaction = Math.max(0, Math.min(100, (Number(save.satisfaction) || 0) + (score >= 70 ? 4 : -2)));
  save.tasksDone = (Number(save.tasksDone) || 0) + 1;
  save.day = (Number(save.day) || 1) + 1;
  save.xp = (Number(save.xp) || 0) + (score >= 80 ? 30 : score >= 55 ? 20 : 12);
  save.lastResult = { title: task.title || 'Tugas profesi', score, feedback: option.feedback || 'Tugas selesai.', info: task.realWorld || '' };
  save.world ||= { currentPlace: 'workplace', visited: ['home'] };
  save.world.lastInteraction = task.title || 'Tugas profesi';
  return { ok: true, score };
}
export function moveWorld(save, place, transport = 'walk') {
  save.world ||= { currentPlace: 'home', visited: ['home'], transportEnabled: false };
  const travel = { workplace: { walk: 8, angkot: 5, motor: 3 }, mall: { walk: 10, angkot: 6, motor: 3 }, learning: { walk: 8, angkot: 5, motor: 3 }, home: { walk: 0, angkot: 0, motor: 0 } };
  if (!travel[place]) return { ok: false, minutes: 0 };
  const minutes = travel[place][transport] ?? travel[place].walk;
  if (save.world.transportEnabled) save.energy = Math.max(0, (Number(save.energy) || 0) - (transport === 'walk' ? 3 : transport === 'motor' ? 2 : 1));
  save.world.currentPlace = place;
  save.world.visited ||= ['home'];
  if (!save.world.visited.includes(place)) save.world.visited.push(place);
  return { ok: true, minutes };
}
