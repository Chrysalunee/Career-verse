// world3d/workplaces.js
export const DEFAULT_WORLD_SAVE = {
  worldMode: 'menu',
  world: {
    locationId: 'home',
    currentPlace: 'home',
    transportEnabled: false,
    freelanceBase: 'home',
    visited: ['home'],
    lastInteraction: null,
  },
};

const INFERRED_TYPES = {
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
  'nusa-global': 'hq_office',
};

export function migrateWorldSave(save = {}) {
  const current = save.world || {};
  const world = {
    ...DEFAULT_WORLD_SAVE.world,
    ...current,
  };

  if (!Array.isArray(world.visited) || world.visited.length === 0) {
    world.visited = ['home'];
  }

  return {
    ...save,
    worldMode: save.worldMode || DEFAULT_WORLD_SAVE.worldMode,
    world,
  };
}

export function workplaceTypeFor(company = {}) {
  if (company.workplaceType) return company.workplaceType;
  if (INFERRED_TYPES[company.id]) return INFERRED_TYPES[company.id];
  const industryString = String(company.industry || '').toLowerCase();
  if (/kesehatan|rumah sakit|klinik/.test(industryString)) return 'hospital';
  if (/pendidikan|sekolah/.test(industryString)) return 'school';
  if (/kuliner|restoran|kafe|kopi/.test(industryString)) return 'restaurant_kitchen';
  if (/agency|agensi|kreatif|digital/.test(industryString)) return 'coworking';
  return 'hq_office';
}

export function resolveWorkplace(company = {}, templates = []) {
  const type = workplaceTypeFor(company);
  const sceneId = company.sceneTemplate || type;
  const template =
    templates.find((item) => item.id === sceneId) ||
    templates.find((item) => item.workplaceType === type) ||
    null;

  if (!template) {
    return {
      id: sceneId,
      workplaceType: type,
      companyId: company.id || null,
      companyName: company.name || 'Lokasi kerja',
      accent: company.sceneAccent || '#76d6a0',
      decor: company.sceneDecor || [],
      objects: [],
      npcs: [],
      busyHours: [],
      name: 'Ruang kerja',
    };
  }

  return {
    ...template,
    workplaceType: type,
    companyId: company.id || null,
    companyName: company.name || template.name || 'Lokasi kerja',
    accent: company.sceneAccent || template.accent || '#76d6a0',
    decor: company.sceneDecor || template.decor || [],
  };
}

export function tasksForObjects(template = {}, profession = {}) {
  const tasks = Array.isArray(profession.tasks) ? profession.tasks : [];
  return (template.objects || []).map((object) => {
    const fallbackTask = object.taskIndex !== undefined ? tasks[object.taskIndex] : null;
    const matchedTask = tasks.find((task) => task.id === object.taskId) || fallbackTask || null;
    return {
      ...object,
      task: matchedTask,
      available: Boolean(matchedTask),
    };
  });
}

export function moveWorldLocation(save = {}, locationId) {
  const migrated = migrateWorldSave(save);
  migrated.world ||= { ...DEFAULT_WORLD_SAVE.world };
  migrated.world.currentPlace = locationId;
  migrated.world.locationId = locationId;
  migrated.world.visited = Array.isArray(migrated.world.visited) ? migrated.world.visited : ['home'];
  if (!migrated.world.visited.includes(locationId)) {
    migrated.world.visited.push(locationId);
  }
  return migrated.world;
}

export function sceneForCompany(company = {}, templates = []) {
  return resolveWorkplace(company, templates);
}

export function normalizeWorldSave(save = {}) {
  return migrateWorldSave(save);
}
