// Pemilih template tempat kerja dan migrasi aman untuk save versi lama.
export const DEFAULT_WORLD_SAVE = {
  worldMode: 'menu',
  world: { locationId: 'city-hub', currentPlace: 'home', transportEnabled: false, freelanceBase: 'home', visited: ['home'], lastInteraction: null }
};

const inferredTypes = {
  'sma-nusa-bangsa': 'school',
  'rs-harapan-sehat': 'hospital',
  'klinik-sehat-bersama': 'hospital',
  'restoran-rasa-nusantara': 'restaurant_kitchen',
  'bistro-senja': 'cafe',
  'kopi-kilat': 'cafe',
  'kreasi-bersama': 'coworking',
  'kodeku-labs': 'home',
  'piksel-nusantara': 'hq_office',
  'garda-nusantara': 'hq_office',
  'nusa-global': 'hq_office'
};

export function migrateWorldSave(save = {}) {
  const world = { ...DEFAULT_WORLD_SAVE.world, ...(save.world || {}) };
  if (!Array.isArray(world.visited)) world.visited = ['home'];
  // Save lama tetap menggunakan menu; tidak dipaksa masuk ke scene baru.
  return { ...save, worldMode: save.worldMode || DEFAULT_WORLD_SAVE.worldMode, world };
}

export function workplaceTypeFor(company = {}) {
  return company.workplaceType || inferredTypes[company.id] || inferFromIndustry(company.industry);
}
function inferFromIndustry(industry = '') {
  const text = industry.toLowerCase();
  if (/kesehatan|rumah sakit|klinik/.test(text)) return 'hospital';
  if (/pendidikan|sekolah/.test(text)) return 'school';
  if (/kuliner|restoran|kafe|kopi/.test(text)) return 'restaurant_kitchen';
  if (/agency|agensi|kreatif/.test(text)) return 'coworking';
  return 'hq_office';
}

export function resolveWorkplace(company, templates = []) {
  const type = workplaceTypeFor(company);
  const sceneId = company.sceneTemplate || type;
  const template = templates.find(item => item.id === sceneId) || templates.find(item => item.workplaceType === type) || null;
  return template ? { ...template, workplaceType: type, companyId: company.id, companyName: company.name, accent: company.sceneAccent || template.accent || '#76d6a0', decor: company.sceneDecor || template.decor || [] } : null;
}

export function tasksForObjects(template, profession) {
  const tasks = profession?.tasks || [];
  return (template?.objects || []).map(object => {
    const task = tasks.find(item => item.id === object.taskId) || tasks[object.taskIndex || 0];
    return { ...object, task: task || null, available: Boolean(task) };
  });
}

export function moveWorldLocation(save, locationId) {
  if (!save.world) save.world = { ...DEFAULT_WORLD_SAVE.world };
  save.world.currentPlace = locationId;
  save.world.locationId = locationId;
  if (!save.world.visited.includes(locationId)) save.world.visited.push(locationId);
  return save.world;
}

export function sceneForCompany(company, templates = []) {
  return resolveWorkplace(company, templates);
}
