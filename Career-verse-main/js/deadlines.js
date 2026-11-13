// Pengelolaan tenggat dan proyek yang berlanjut lintas hari kerja.
export function sortDeadlines(items = []) {
  return [...items].sort((a, b) => (a.status === 'selesai' ? 1 : 0) - (b.status === 'selesai' ? 1 : 0) || a.dueDay - b.dueDay || a.dueHour - b.dueHour);
}
export function deadlineLabel(item, day, hour = 8) {
  if (item.status === 'selesai') return 'Selesai';
  if (item.status === 'terlambat' || item.dueDay < day || (item.dueDay === day && item.dueHour < hour)) return 'Terlambat';
  if (item.dueDay === day) return 'Hari ini';
  if (item.dueDay === day + 1) return 'Besok';
  return `Hari ${item.dueDay}`;
}
export function createStarterDeadlines(day = 1, client = 'Klien') {
  return [
    { id: 'brief-review', title: `Tinjau brief ${client}`, client, status: 'belum mulai', dueDay: day, dueHour: 16, slotsNeeded: 1, slotsDone: 0, extensionAsked: false },
    { id: 'project-delivery', title: `Serahkan hasil proyek ${client}`, client, status: 'belum mulai', dueDay: day + 2, dueHour: 16, slotsNeeded: 3, slotsDone: 0, extensionAsked: false }
  ];
}
export function progressDeadline(items, id, amount = 1) {
  const item = items.find(entry => entry.id === id);
  if (!item || item.status === 'selesai') return item || null;
  item.slotsDone = Math.min(item.slotsNeeded, item.slotsDone + amount);
  item.status = item.slotsDone >= item.slotsNeeded ? 'siap review' : 'berjalan';
  return item;
}
export function resolveDeadline(items, id, action) {
  const item = items.find(entry => entry.id === id);
  if (!item) return null;
  if (action === 'approve') item.status = 'selesai';
  if (action === 'late') item.status = 'terlambat';
  return item;
}
export function markLate(items, day, hour = 17) {
  for (const item of items) if (!['selesai', 'terlambat'].includes(item.status) && (item.dueDay < day || (item.dueDay === day && item.dueHour < hour))) item.status = 'terlambat';
  return items;
}
export function extensionChance(relationship, reasonIsClear) {
  return Math.max(5, Math.min(95, Math.round(25 + relationship * 0.55 + (reasonIsClear ? 20 : 0))));
}
