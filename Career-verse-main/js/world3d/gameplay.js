// Pure state/geometry helpers used by the isometric-style world screen.
export const WORLD_SAVE_KEY = 'career-verse-save';
export const PLACE_LABELS = { home: 'Rumah', workplace: 'Tempat kerja', mall: 'Mal', learning: 'Tempat belajar' };
export function readSave(raw) {
  try { return { ...(raw ? JSON.parse(raw) : {}), world: { currentPlace: 'home', visited: ['home'], transportEnabled: false, ...(JSON.parse(raw || '{}').world || {}) } }; }
  catch { return { world: { currentPlace: 'home', visited: ['home'], transportEnabled: false } }; }
}
export function getCompanyScene(company, metadata = {}, templates = []) {
  const entries = metadata.companies;
  const extra = (Array.isArray(entries) ? entries.find(item => item.id === company?.id) : entries?.[company?.id]) || {};
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


export function applyCoffeeBreak(save) {
  save.energy = Math.min(100, (Number(save.energy) || 0) + 12);
  save.stress = Math.max(0, (Number(save.stress) || 0) - 3);
  save.world ||= { currentPlace: 'workplace', visited: ['home', 'workplace'] };
  save.world.lastRefreshment = 'Kopi Kilat';
  return { energy: save.energy, stress: save.stress };
}

export function applySupervisorConversation(save, choice = {}) {
  save.relationship = Math.min(100, (Number(save.relationship) || 0) + (Number(choice.relation) || 0));
  save.reputation = Math.min(100, (Number(save.reputation) || 0) + (Number(choice.reputation) || 0));
  save.stress = Math.max(0, (Number(save.stress) || 0) + (Number(choice.stress) || 0));
  save.satisfaction = Math.min(100, (Number(save.satisfaction) || 0) + (Number(choice.satisfaction) || 0));
  save.skill = Math.min(100, (Number(save.skill) || 0) + (Number(choice.skill) || 0));
  save.world ||= { currentPlace: 'workplace', visited: ['home', 'workplace'] };
  save.world.lastConversation = 'Bu Ratna';
  return { relationship: save.relationship, reputation: save.reputation, stress: save.stress, satisfaction: save.satisfaction, skill: save.skill };
}


const clampWorldNeed = value => Math.max(0, Math.min(100, Number(value) || 0));

/** Apply a city-location action to the shared Career-Verse save. */
export function applyWorldPlaceInteraction(save, placeId) {
  const effects = {
    home: { energy: 25, hygiene: 35, message: 'Kamu beristirahat dan merapikan diri di rumah.' },
    cafe: { hunger: 28, fun: 5, message: 'Kamu menikmati makanan dan suasana Kafe Senja.' },
    market: { hunger: 18, message: 'Kamu mengisi tenaga setelah beraktivitas di Pasar Harian.' },
    work: { energy: -8, skill: 2, message: 'Kamu menyelesaikan sesi aktivitas di kantor.' },
    school: { energy: -4, fun: 8, skill: 5, xp: 10, message: 'Kamu mengikuti sesi belajar dan mengembangkan kemampuan.' },
    park: { fun: 25, social: 12, stress: -5, message: 'Kamu bersantai dan menikmati udara segar di taman.' },
  };
  const effect = effects[placeId];
  if (!save || !effect) return { ok: false, message: 'Lokasi tidak tersedia.' };
  save.needs ||= { hunger: 82, energy: 90, hygiene: 88, social: 55, fun: 72 };
  for (const key of ['hunger', 'energy', 'hygiene', 'social', 'fun']) {
    if (effect[key] !== undefined) save.needs[key] = clampWorldNeed((Number(save.needs[key]) || 0) + effect[key]);
  }
  if (effect.skill) save.skill = clampWorldNeed((Number(save.skill) || 0) + effect.skill);
  if (effect.xp) save.xp = (Number(save.xp) || 0) + effect.xp;
  if (effect.stress) save.stress = clampWorldNeed((Number(save.stress) || 0) + effect.stress);
  save.world ||= { currentPlace: 'home', visited: ['home'] };
  save.world.currentPlace = placeId;
  save.world.visited ||= ['home'];
  if (!save.world.visited.includes(placeId)) save.world.visited.push(placeId);
  save.world.lastInteraction = effect.message;
  return { ok: true, message: effect.message, needs: { ...save.needs } };
}

/** A short social interaction with a named city NPC. */
export function applyWorldNpcConversation(save, npcName = 'Warga kota') {
  if (!save) return { ok: false };
  save.needs ||= { hunger: 82, energy: 90, hygiene: 88, social: 55, fun: 72 };
  save.needs.social = clampWorldNeed((Number(save.needs.social) || 0) + 8);
  save.needs.fun = clampWorldNeed((Number(save.needs.fun) || 0) + 3);
  save.relationship = clampWorldNeed((Number(save.relationship) || 0) + 2);
  save.stress = Math.max(0, (Number(save.stress) || 0) - 2);
  save.world ||= { currentPlace: 'home', visited: ['home'] };
  save.world.lastConversation = String(npcName);
  return { ok: true, npcName: String(npcName), needs: { ...save.needs }, relationship: save.relationship, stress: save.stress };
}


/**
 * Advance everyday needs by simulation time (not wall-clock time).
 * Rates are expressed per in-game hour so pausing or slow devices do not
 * unexpectedly drain a character's needs.
 */
export function advanceWorldNeeds(needs, gameMinutes) {
  if (!needs || !Number.isFinite(gameMinutes) || gameMinutes <= 0) return needs;
  const hours = gameMinutes / 60;
  const rates = { hunger: 2.4, energy: 1.4, hygiene: 0.9, social: 0.7, fun: 0.8 };
  for (const [key, rate] of Object.entries(rates)) {
    const current = Number(needs[key]);
    needs[key] = Math.max(0, Math.min(100, (Number.isFinite(current) ? current : 0) - rate * hours));
  }
  return needs;
}

/** Advance the 24-hour city clock and calendar without losing extra save fields. */
export function advanceWorldClock(clockMinutes, calendarDay, gameMinutes) {
  const total = Math.max(0, Number(clockMinutes) || 0) + Math.max(0, Number(gameMinutes) || 0);
  const daysPassed = Math.floor(total / 1440);
  return {
    clockMinutes: total % 1440,
    calendarDay: Math.max(1, Number(calendarDay) || 1) + daysPassed,
    daysPassed,
  };
}


/**
 * Apply a daily-life activity selected at a city destination.
 * Costs are in Indonesian rupiah and are checked before any state mutation.
 */
export function applyDailyActivity(save, activityId) {
  if (!save) return { ok: false, message: 'Data permainan tidak tersedia.' };
  const activities = {
    sleep: { place: 'home', minutes: 480, cost: 0, needs: { energy: 68, hunger: -19.2, hygiene: -7.2, social: -5.6, fun: 12 }, message: 'Kamu tidur selama 8 jam. Energi pulih dan hari berganti.' },
    shower: { place: 'home', minutes: 20, cost: 0, needs: { hygiene: 55, energy: -2 }, message: 'Kamu mandi dan bersiap menjalani hari.' },
    meal: { place: 'cafe', minutes: 35, cost: 25000, needs: { hunger: 48, fun: 5 }, message: 'Kamu menikmati makanan di Kafe Senja.' },
    groceries: { place: 'market', minutes: 45, cost: 75000, needs: { hunger: 25, hygiene: 5 }, message: 'Kamu membeli kebutuhan harian di Pasar Harian.' },
    study: { place: 'school', minutes: 60, cost: 0, needs: { energy: -8, fun: 4 }, skill: 5, xp: 15, message: 'Sesi belajar selesai. Skill dan XP meningkat.' },
    relax: { place: 'park', minutes: 45, cost: 0, needs: { fun: 25, social: 8, energy: -3 }, stress: -5, message: 'Kamu bersantai di taman dan mengurangi stres.' },
  };
  const activity = activities[activityId];
  if (!activity) return { ok: false, message: 'Aktivitas tidak tersedia.' };
  const money = Number(save.money) || 0;
  if (money < activity.cost) return { ok: false, message: 'Uang tidak cukup untuk aktivitas ini.' };
  save.needs ||= { hunger: 82, energy: 90, hygiene: 88, social: 55, fun: 72 };
  save.money = money - activity.cost;
  for (const [key, value] of Object.entries(activity.needs)) {
    save.needs[key] = clampWorldNeed((Number(save.needs[key]) || 0) + value);
  }
  if (activity.skill) save.skill = clampWorldNeed((Number(save.skill) || 0) + activity.skill);
  if (activity.xp) save.xp = (Number(save.xp) || 0) + activity.xp;
  if (activity.stress) save.stress = Math.max(0, Math.min(100, (Number(save.stress) || 0) + activity.stress));
  if (activityId === 'sleep') {
    const advanced = advanceWorldClock(save.world?.clockMinutes ?? 22 * 60, save.world?.calendarDay ?? save.day ?? 1, activity.minutes);
    save.world ||= {};
    save.world.clockMinutes = advanced.clockMinutes;
    save.world.calendarDay = advanced.calendarDay;
    save.day = Math.max(Number(save.day) || 1, advanced.calendarDay);
  } else {
    save.world ||= {};
    const advanced = advanceWorldClock(save.world.clockMinutes ?? 8 * 60, save.world.calendarDay ?? save.day ?? 1, activity.minutes);
    save.world.clockMinutes = advanced.clockMinutes;
    save.world.calendarDay = advanced.calendarDay;
  }
  save.world ||= {};
  save.world.currentPlace = activity.place;
  save.world.lastActivity = activityId;
  save.world.lastInteraction = activity.message;
  save.energy = save.needs.energy;
  if (activity.place && Array.isArray(save.world.visited) && !save.world.visited.includes(activity.place)) save.world.visited.push(activity.place);
  return { ok: true, message: activity.message, cost: activity.cost, needs: { ...save.needs }, money: save.money, clockMinutes: save.world.clockMinutes, calendarDay: save.world.calendarDay };
}
