const SAVE_KEY = 'career-verse-save';

// State awal menyimpan semua nilai supaya save lama bisa dimigrasikan dengan aman.
export function createState() {
  return {
    screen: 'home', professionId: null, companyId: null, employed: false,
    day: 1, energy: 90, stress: 12, reputation: 10, internal: 10,
    money: 1200000, skill: 1, satisfaction: 55, tasksDone: 0, xp: 0,
    relationship: 25, streak: 0, lastScore: 0, level: null, salary: 0,
    history: [], achievements: [], event: null, lastResult: null
  };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return saved && typeof saved === 'object' ? { ...createState(), ...saved } : createState();
  } catch {
    return createState();
  }
}

export function saveGame(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}

export function acceptanceChance(state, company, profession) {
  const fit = company?.roles?.includes(profession?.id) ? 1 : 0;
  const skill = clamp(state.skill || 1, 1, 10) / 10;
  const reputation = clamp(state.reputation || 0, 0, 100) / 100;
  const relation = clamp(state.relationship || 0, 0, 100) / 100;
  return Math.round(clamp(25 + fit * 30 + skill * 20 + reputation * 15 + relation * 10, 5, 95));
}

export function evaluateTask(baseScore, state) {
  const fatigue = state.energy < 25 ? 12 : state.energy < 45 ? 6 : 0;
  const burnout = state.stress > 80 ? 10 : state.stress > 60 ? 5 : 0;
  const score = Math.round(clamp(baseScore - fatigue - burnout + Math.min(5, (state.skill || 1) * 0.6), 0, 100));
  return {
    score,
    energy: score >= 80 ? -7 : score >= 55 ? -10 : -13,
    stress: score >= 80 ? 2 : score >= 55 ? 5 : 9,
    rep: score >= 85 ? 4 : score >= 65 ? 2 : score < 40 ? -1 : 0,
    internal: score >= 75 ? 3 : 0,
    xp: score >= 80 ? 30 : score >= 55 ? 20 : 12
  };
}

export function salaryFor(base, levelIndex = 0, multiplier = 1) {
  return Math.round((base * (1 + Math.max(0, levelIndex) * 0.18) * multiplier) / 1000) * 1000;
}

export function canPromote(state, profession) {
  const ladder = profession?.careerLadder || [];
  const index = ladder.indexOf(state.level);
  return index >= 0 && index < ladder.length - 1 && state.tasksDone >= 8 && state.skill >= 2.5 && state.internal >= 50;
}

export function xpToNextLevel(level) { return 100 + Math.max(0, level - 1) * 40; }
