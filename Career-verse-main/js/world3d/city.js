// city.js
export const CITY_PLACES = [
  { id: 'home', name: 'Rumah', icon: '🏠', travel: { walk: 0, angkot: 5, motor: 3 } },
  { id: 'workplace', name: 'Tempat kerja', icon: '🏢', travel: { walk: 8, angkot: 5, motor: 3 } },
  { id: 'mall', name: 'Mal', icon: '🏬', travel: { walk: 10, angkot: 6, motor: 3 } },
  { id: 'learning', name: 'Tempat belajar', icon: '📚', travel: { walk: 8, angkot: 5, motor: 3 } },
];

export function travelTo(save = {}, destination, transport = 'walk') {
  const target = CITY_PLACES.find((place) => place.id === destination);
  if (!target) {
    return { ok: false, minutes: 0, reason: 'Tujuan tidak ditemukan.' };
  }

  save.world ||= { currentPlace: 'home', visited: ['home'] };
  const minutes = target.travel[transport] ?? target.travel.walk;

  if (save.world.transportEnabled) {
    const costByTransport = { walk: 3, motor: 2, angkot: 1 };
    const cost = costByTransport[transport] ?? 2;
    save.energy = Math.max(0, (Number(save.energy) || 0) - cost);
  }

  save.world.currentPlace = destination;
  save.world.locationId = destination;
  save.world.visited ||= ['home'];
  if (!save.world.visited.includes(destination)) {
    save.world.visited.push(destination);
  }

  return { ok: true, minutes, destination: target.name, transport };
}

export function setTransportEnabled(save = {}, enabled) {
  save.world ||= {};
  save.world.transportEnabled = Boolean(enabled);
  return save.world.transportEnabled;
}
