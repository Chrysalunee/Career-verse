// Helpers jadwal kerja berbasis giliran, tanpa timer real-time.
export const ACTIVITY_TYPES = ['task', 'meeting', 'break', 'study', 'overtime', 'empty'];
const pad = value => String(value).padStart(2, '0');
export const formatHour = hour => `${pad(hour)}.00`;

export function createDaySchedule(day, company = {}, schedules = {}, meetings = {}) {
  const style = company.workStyle || (company.companyType || '').toLowerCase();
  const cfg = schedules.styles?.[style] || schedules.styles?.default || { start: 8, end: 17, lunch: 12, standup: true };
  const slots = [];
  for (let hour = cfg.start; hour < cfg.end; hour += 1) {
    if (hour === cfg.lunch) {
      slots.push({ id: `d${day}-${hour}`, hour, type: 'break', label: 'Istirahat makan siang', locked: true, completed: false });
      continue;
    }
    const slot = { id: `d${day}-${hour}`, hour, type: 'task', label: 'Waktu fokus', locked: false, completed: false, prepared: false };
    if (cfg.standup && hour === cfg.start + 1) {
      slot.type = 'meeting'; slot.label = 'Stand-up harian'; slot.locked = true; slot.meetingId = 'standup';
    }
    const meetingList = meetings.items || [];
    const candidate = meetingList.find(item => hour === item.hour && (day + hour) % (item.everyDays || 1) === 0);
    if (candidate && !slot.locked) {
      slot.type = 'meeting'; slot.label = candidate.title; slot.locked = true; slot.meetingId = candidate.id;
    }
    slots.push(slot);
  }
  return { day, slots, cursor: 0, lunchTaken: false, focusMode: false, interruptions: 0, focusMinutes: 0, meetingsAttended: 0, repliesSent: 0, overtimeCount: 0, ended: false, summary: null };
}

export function migrateWorkdaySave(saved = {}) {
  const defaults = {
    workdayMode: 'full', workday: null, deadlines: [], inbox: { emails: [], chats: [], unread: 0 },
    dailyHistory: [], workPreferences: { reducedMotion: false, largeFont: false, disableToasts: false }
  };
  const migrated = { ...defaults, ...saved };
  // Save lama memakai alur langsung tugas; pertahankan kebiasaan pemain.
  if (!Object.hasOwn(saved, 'workdayMode')) migrated.workdayMode = 'compact';
  migrated.deadlines = Array.isArray(migrated.deadlines) ? migrated.deadlines : [];
  migrated.dailyHistory = Array.isArray(migrated.dailyHistory) ? migrated.dailyHistory : [];
  migrated.inbox = { ...defaults.inbox, ...(migrated.inbox || {}) };
  migrated.inbox.emails = Array.isArray(migrated.inbox.emails) ? migrated.inbox.emails : [];
  migrated.inbox.chats = Array.isArray(migrated.inbox.chats) ? migrated.inbox.chats : [];
  migrated.workPreferences = { ...defaults.workPreferences, ...(migrated.workPreferences || {}) };
  return migrated;
}

export function setSlotType(workday, index, type) {
  const slot = workday?.slots?.[index];
  if (!slot || slot.locked || slot.completed || !ACTIVITY_TYPES.includes(type)) return false;
  slot.type = type;
  slot.label = ({ task: 'Waktu fokus', meeting: 'Rapat yang dijadwalkan', break: 'Istirahat', study: 'Belajar / kursus', overtime: 'Lembur (opsional)', empty: 'Waktu fleksibel' })[type];
  return true;
}

export function currentSlot(workday) {
  if (!workday) return null;
  for (let i = workday.cursor; i < workday.slots.length; i += 1) if (!workday.slots[i].completed) return workday.slots[i];
  return null;
}

export function slotEnergyDelta(type) {
  return ({ task: -8, meeting: -5, break: 18, study: -4, overtime: -12, empty: 0 })[type] ?? 0;
}

export function applySlotActivity(state, workday, slot) {
  if (!slot || slot.completed) return { energy: 0, stress: 0, focusMinutes: 0 };
  const before = state.energy;
  state.energy = Math.max(0, Math.min(100, state.energy + slotEnergyDelta(slot.type)));
  let stress = 0;
  let focusMinutes = 0;
  if (slot.type === 'overtime') { stress = 10; workday.overtimeCount += 1; }
  if (slot.type === 'break') workday.lunchTaken = true;
  if (slot.type === 'task' || slot.type === 'study') focusMinutes = 45;
  if (slot.type === 'meeting') workday.meetingsAttended += 1;
  if (slot.type === 'task' && !workday.lunchTaken && slot.hour > 12) state.energy = Math.max(0, state.energy - 5);
  state.stress = Math.max(0, Math.min(100, state.stress + stress));
  slot.completed = true;
  workday.cursor = Math.max(workday.cursor, workday.slots.indexOf(slot) + 1);
  workday.focusMinutes += focusMinutes;
  return { energy: state.energy - before, stress, focusMinutes };
}

export function dailyProductivity(workday, state) {
  if (!workday) return 0;
  const lunchPenalty = workday.lunchTaken ? 0 : 15;
  const score = workday.focusMinutes / 4 + workday.meetingsAttended * 2 - workday.interruptions * 5 - (state.stress || 0) * 0.2 - (100 - (state.energy || 0)) * 0.15 - lunchPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function finishDaySummary(workday, state, deadlines = [], tip = '') {
  return {
    day: workday.day, productivity: dailyProductivity(workday, state), tasksDone: deadlines.filter(item => item.status === 'selesai').length,
    meetingsAttended: workday.meetingsAttended, repliesSent: workday.repliesSent,
    nextDeadline: sortDeadlines(deadlines)[0] || null, tip,
    overtimeCount: workday.overtimeCount, interruptions: workday.interruptions, focusMinutes: workday.focusMinutes
  };
}
