// World renderer/template selection helper. The visual scene is CSS/isometric and menu-accessible.
import { CITY_PLACES, travelTo } from './city.js';
import { MALL_LOCATIONS, visitMall } from './mall.js';
import { migrateWorldSave, resolveWorkplace, tasksForObjects, moveWorldLocation, workplaceTypeFor } from './workplaces.js';

export { CITY_PLACES, MALL_LOCATIONS, migrateWorldSave, resolveWorkplace, tasksForObjects, moveWorldLocation, workplaceTypeFor, travelTo, visitMall };

export function worldSceneModel(company, profession, templates) {
  const scene = resolveWorkplace(company, templates);
  const objects = tasksForObjects(scene, profession);
  return { scene, objects, rushHour: scene?.busyHours || [], npcs: scene?.npcs || [], accessibleDescription: scene ? `${scene.name}. ${objects.map(o => `${o.name}: ${o.hint}`).join('. ')}` : 'Lokasi belum tersedia.' };
}
