// world3d/index.js
export { CITY_PLACES, travelTo, setTransportEnabled } from './city.js';
export { MALL_LOCATIONS, mallLocation, visitMall } from './mall.js';
export {
  DEFAULT_WORLD_SAVE,
  migrateWorldSave,
  workplaceTypeFor,
  resolveWorkplace,
  tasksForObjects,
  moveWorldLocation,
  sceneForCompany,
  normalizeWorldSave,
} from './workplaces.js';

export function worldSceneModel(company = {}, profession = {}, templates = []) {
  const scene = resolveWorkplace(company, templates);
  const objects = tasksForObjects(scene, profession);
  return {
    scene,
    objects,
    rushHour: scene?.busyHours || [],
    npcs: scene?.npcs || [],
    accessibleDescription: scene
      ? `${scene.name}. ${objects.map((entry) => `${entry.name}: ${entry.hint || 'Aktifitas tersedia.'}`).join('. ')}`
      : 'Lokasi belum tersedia.',
  };
}

export default {
  worldSceneModel,
};
