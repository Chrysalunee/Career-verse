export const CITY_LINKS = [
  { id: 'home', label: 'Rumah', description: 'Mulai hari, istirahat, dan ruang pribadi.' },
  { id: 'workplace', label: 'Tempat kerja', description: 'Lokasi tugas profesi dan akses perusahaan.' },
  { id: 'mall', label: 'Mal', description: 'Area sosial, kursus, dan hiburan ringan.' },
  { id: 'learning', label: 'Tempat belajar', description: 'Ruang pengembangan skill dan pendidikan.' },
];

export function buildCityMap() {
  return {
    home: ['workplace', 'mall', 'learning'],
    workplace: ['home', 'mall', 'learning'],
    mall: ['home', 'workplace', 'learning'],
    learning: ['home', 'workplace', 'mall'],
  };
}

export function getCityTripInfo(placeId = 'home') {
  const map = buildCityMap();
  return map[placeId] || [];
}
