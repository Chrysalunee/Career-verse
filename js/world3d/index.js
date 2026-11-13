// mall.js
export const MALL_LOCATIONS = [
  { id: 'mall-cafe', name: 'Kafe Sudut Rona', type: 'cafe', icon: '☕', action: 'meal', cost: 45000, energy: 15, stress: -8, dialogue: ['Pesan minuman dan istirahat', 'Sapa barista dengan ramah'] },
  { id: 'mall-foodcourt', name: 'Food court', type: 'food_court', icon: '🍜', action: 'meal', cost: 65000, energy: 25, stress: -10, dialogue: ['Makan sebelum kembali bekerja', 'Berbincang santai dengan pelanggan'] },
  { id: 'mall-store', name: 'Toko Langkah Kecil', type: 'mall_store', icon: '🛍️', action: 'shop', cost: 120000, energy: 5, stress: -5, dialogue: ['Lihat barang kebutuhan', 'Tunda belanja dan simpan uang'] },
  { id: 'mall-learning', name: 'Ruang Belajar', type: 'learning', icon: '📚', action: 'course', cost: 200000, energy: -5, stress: -3, skill: 0.2, dialogue: ['Ikuti kelas singkat', 'Simpan materi untuk nanti'] },
  { id: 'mall-rest', name: 'Area istirahat', type: 'rest', icon: '🌿', action: 'rest', cost: 0, energy: 18, stress: -12, dialogue: ['Duduk dan pulihkan diri', 'Lanjutkan perjalanan'] },
];

export function mallLocation(id) {
  return MALL_LOCATIONS.find((place) => place.id === id) || null;
}

export function visitMall(save = {}, placeId) {
  const place = mallLocation(placeId);
  if (!place) {
    return { ok: false, reason: 'Lokasi tidak ditemukan.' };
  }

  if ((Number(save.money) || 0) < place.cost) {
    return { ok: false, reason: `Dana belum cukup untuk ${place.name}.` };
  }

  save.money = (Number(save.money) || 0) - place.cost;
  save.energy = Math.max(0, Math.min(100, (Number(save.energy) || 0) + (place.energy || 0)));
  save.stress = Math.max(0, Math.min(100, (Number(save.stress) || 0) + (place.stress || 0)));

  if (typeof place.skill === 'number') {
    save.skill = Math.min(10, Number((Number(save.skill) || 1) + place.skill));
  }

  return { ok: true, place, dialogue: place.dialogue[0] || 'Interaksi selesai.' };
}
