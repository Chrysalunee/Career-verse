export const DEFAULT_WORKPLACE_TYPES = {
  'kopi-kilat': 'cafe',
  'bistro-senja': 'restaurant_kitchen',
  'restoran-rasa-nusantara': 'restaurant_kitchen',
  'kodeku-labs': 'home',
  'piksel-nusantara': 'coworking',
  'garda-nusantara': 'hq_office',
  'nusa-global': 'hq_office',
  'kreasi-bersama': 'coworking',
  'klinik-sehat-bersama': 'hospital',
  'rs-harapan-sehat': 'hospital',
  'sma-nusa-bangsa': 'school',
};

export function workplaceTypeFor(company = {}, metadata = {}) {
  const entries = metadata.companies;
  const mapped = (Array.isArray(entries) ? entries.find(item => item.id === company.id) : entries?.[company.id]) || {};
  return company.workplaceType || mapped.workplaceType || DEFAULT_WORKPLACE_TYPES[company.id] || 'hq_office';
}

export function resolveWorkplace(company = {}, templates = [], metadata = {}) {
  const entries = metadata.companies;
  const mapped = (Array.isArray(entries) ? entries.find(item => item.id === company.id) : entries?.[company.id]) || {};
  const workplaceType = workplaceTypeFor({ ...company, workplaceType: company.workplaceType || mapped.workplaceType }, metadata);
  const sceneTemplate = company.sceneTemplate || mapped.sceneTemplate || workplaceType;
  return templates.find(item => item.id === sceneTemplate)
    || templates.find(item => item.workplaceType === workplaceType)
    || templates.find(item => item.id === 'home')
    || null;
}

export function tasksForObjects(scene, profession) {
  const tasks = profession?.tasks || [];
  return (scene?.objects || []).map(object => {
    const index = object.taskProfessions?.[profession?.id] ?? object.taskIndex;
    const task = Number.isInteger(index) ? tasks[index] || null : tasks.find(item => item.id === object.taskId) || null;
    return { ...object, task };
  });
}

export function migrateWorldSave(saved = {}) {
  const world = { currentPlace: 'home', visited: ['home'], transportEnabled: false, ...(saved.world || {}) };
  world.visited = Array.isArray(world.visited) ? world.visited : ['home'];
  if (!world.visited.includes('home')) world.visited.unshift('home');
  return { ...saved, worldMode: saved.worldMode || 'menu', world };
}

export function moveWorldLocation(save, place) {
  const migrated = migrateWorldSave(save);
  if (!['home', 'workplace', 'mall', 'learning'].includes(place)) return migrated.world;
  migrated.world.currentPlace = place;
  if (!migrated.world.visited.includes(place)) migrated.world.visited.push(place);
  Object.assign(save, migrated);
  return save.world;
}

// Backwards-compatible names used by earlier gameplay modules.
export const getCompanyScene = (company, metadata = {}, templates = []) => {
  const template = resolveWorkplace(company, templates, metadata);
  if (!template) return null;
  const entries = metadata.companies;
  const extra = (Array.isArray(entries) ? entries.find(item => item.id === company?.id) : entries?.[company?.id]) || {};
  const workplaceType = workplaceTypeFor(company, metadata);
  return { ...template, ...extra, workplaceType, companyId: company.id, companyName: company.name, accent: extra.sceneAccent || template.accent || '#83e0ad', decor: extra.sceneDecor || template.decor || [] };
};
export const mapInteractiveObjects = tasksForObjects;
