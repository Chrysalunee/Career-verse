import { render } from './ui.js';
import { clamp, createState, loadGame, saveGame, acceptanceChance, evaluateTask, salaryFor, canPromote, xpToNextLevel, formatMoney } from './engine.js';

const app = document.querySelector('#app');
let state = loadGame();
let professions = [];
let companies = [];
let screen = state.screen || 'home';
let task = null;

const professionIds = ['digital-marketer', 'programmer', 'guru', 'perawat', 'chef', 'data-analyst', 'uiux-designer', 'content-creator'];
const companyIds = ['kopi-kilat', 'nusa-global', 'kreasi-bersama', 'kodeku-labs', 'sma-nusa-bangsa', 'rs-harapan-sehat', 'klinik-sehat-bersama', 'restoran-rasa-nusantara', 'bistro-senja', 'piksel-nusantara', 'garda-nusantara'];

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Tidak bisa memuat ${path} (HTTP ${response.status})`);
  return response.json();
}
async function loadData() {
  [professions, companies] = await Promise.all([
    Promise.all(professionIds.map(id => readJson(`./data/professions/${id}.json`))),
    Promise.all(companyIds.map(id => readJson(`./data/companies/${id}.json`)))
  ]);
  if (!professions.some(item => item.id === state.professionId)) state.professionId = null;
  if (!companies.some(item => item.id === state.companyId)) state.companyId = null;
  if (state.employed && (!state.professionId || !state.companyId)) state.employed = false;
  if (!['home', 'jobs', 'company', 'interview', 'offer', 'work', 'task', 'result', 'history'].includes(screen)) screen = 'home';
  start();
}
function getProfession() { return professions.find(item => item.id === state.professionId) || null; }
function getCompany() { return companies.find(item => item.id === state.companyId) || null; }
function persist() {
  state.screen = screen;
  const saved = saveGame(state);
  const status = document.querySelector('#save-status');
  if (status) status.textContent = saved ? '✓ Progres tersimpan otomatis' : 'Penyimpanan lokal tidak tersedia';
}
function start() {
  if (!professions.length) return;
  if (state.employed && screen === 'home') screen = 'work';
  render(app, {
    screen, state, professions, companies,
    profession: getProfession(), company: getCompany(), task,
    callbacks: {
      chooseProfession, chooseCompany, apply, answerInterview, acceptOffer, negotiate,
      backToJobs, backToHome, beginDay, answerTask, answerEvent, rest, study,
      showHistory, quit, promote, goBack
    }
  });
}
function navigate(nextScreen) { screen = nextScreen; persist(); start(); }
function chooseProfession(id) {
  if (!professions.some(item => item.id === id)) return;
  state.professionId = id;
  state.companyId = null;
  navigate('jobs');
}
function chooseCompany(id) {
  const chosen = companies.find(item => item.id === id);
  if (!chosen || !chosen.roles.includes(state.professionId)) return;
  state.companyId = id;
  navigate('company');
}
function apply() {
  const p = getProfession(), c = getCompany();
  if (!p || !c) return;
  state.lastChance = acceptanceChance(state, c, p);
  state.offer = false;
  state.negotiation = '';
  navigate('interview');
}
function answerInterview(answer) {
  state.lastChance = clamp(state.lastChance + (answer === 'good' ? 12 : answer === 'neutral' ? 2 : -8), 5, 98);
  state.interviewFeedback = answer === 'good'
    ? 'Jawabanmu menjelaskan prioritas, komunikasi, dan hasil secara konkret.'
    : answer === 'neutral'
      ? 'Jawaban cukup baik; contoh nyata akan membuatnya lebih kuat.'
      : 'Menyepakati kapasitas secara jujur membantu menjaga ekspektasi kerja.';
  state.offer = Math.random() * 100 < state.lastChance;
  if (state.offer) {
    const c = getCompany();
    state.offeredSalary = Math.min(salaryFor(c.salary[0], 0, 1.03), c.salary[1]);
  }
  navigate('offer');
}
function acceptOffer() {
  const p = getProfession(), c = getCompany();
  if (!p || !c || !state.offer) return;
  state.employed = true;
  state.salary = state.offeredSalary;
  state.level = p.careerLadder[0] || 'Junior';
  state.day = 1;
  state.tasksDone = 0;
  state.history ||= [];
  state.history.push({ company: c.name, role: state.level, day: 1, note: 'Mulai onboarding dan masa percobaan' });
  state.onboarding = `Hari pertama di ${c.name}! Kenali tim dan sepakati target awal bersama ${c.boss}.`;
  navigate('work');
}
function negotiate() {
  const c = getCompany();
  if (!c || !state.offer) return;
  const ask = Math.round(state.offeredSalary * 1.08 / 100000) * 100000;
  if (ask <= c.salary[1] && Math.random() < 0.65) {
    state.offeredSalary = ask;
    state.negotiation = 'Negosiasi berhasil. Pastikan rincian kompensasi dan tunjangan tertulis.';
  } else state.negotiation = 'Perusahaan belum dapat menyetujui angka tersebut; tawaran awal masih berlaku.';
  persist();
  start();
}
function beginDay() {
  const p = getProfession();
  if (!p?.tasks?.length || !state.employed) return;
  task = p.tasks[state.tasksDone % p.tasks.length];
  navigate('task');
}
function answerTask(index) {
  if (!task?.options?.[index]) return;
  const option = task.options[index];
  const result = evaluateTask(option.score, state);
  state.energy = clamp(state.energy + result.energy, 0, 100);
  state.stress = clamp(state.stress + result.stress, 0, 100);
  state.reputation = clamp(state.reputation + result.rep, 0, 100);
  state.internal = clamp(state.internal + result.internal, 0, 100);
  state.relationship = clamp(state.relationship + (result.score >= 75 ? 3 : 1), 0, 100);
  state.satisfaction = clamp(state.satisfaction + (result.score >= 70 ? 4 : -2), 0, 100);
  state.xp += result.xp;
  state.tasksDone += 1;
  state.day += 1;
  state.lastResult = { title: task.title, score: result.score, feedback: option.feedback, info: getProfession()?.realWorld || '' };
  while (state.xp >= xpToNextLevel(Math.floor(state.skill))) {
    state.xp -= xpToNextLevel(Math.floor(state.skill));
    state.skill = clamp(Number((state.skill + 0.2).toFixed(1)), 1, 10);
    if (!state.achievements.includes('skill-up')) state.achievements.push('skill-up');
  }
  state.payday = '';
  state.review = '';
  if (state.tasksDone % 5 === 0) {
    const livingCost = 350000;
    state.money += state.salary - livingCost;
    state.payday = `Gajian ${formatMoney(state.salary)}; biaya hidup ilustratif ${formatMoney(livingCost)}.`;
    state.review = result.score >= 70
      ? 'Review mingguan: kontribusimu konsisten. Sepakati prioritas selanjutnya.'
      : 'Review mingguan: pilih satu area untuk ditingkatkan dan minta masukan spesifik.';
  }
  const p = getProfession();
  state.event = state.tasksDone % 3 === 0 && p?.events?.length
    ? p.events[Math.floor(Math.random() * p.events.length)] : null;
  state.promotion = canPromote(state, p) ? p.careerLadder[p.careerLadder.indexOf(state.level) + 1] : null;
  if (!state.achievements.includes('first-task')) state.achievements.push('first-task');
  navigate('result');
}
function answerEvent(choice) {
  if (!state.event) return;
  if (choice === 'talk') {
    state.stress = clamp(state.stress - 5, 0, 100);
    state.internal = clamp(state.internal + 2, 0, 100);
    state.relationship = clamp(state.relationship + 3, 0, 100);
    state.eventOutcome = 'Kamu membahas kapasitas dan menyepakati prioritas bersama tim.';
  } else {
    state.stress = clamp(state.stress + 8, 0, 100);
    state.energy = clamp(state.energy - 8, 0, 100);
    state.eventOutcome = 'Kamu mengambil pekerjaan tambahan; rencanakan pemulihan setelahnya.';
  }
  state.event = null;
  persist();
  start();
}
function rest() {
  state.energy = clamp(state.energy + 22, 0, 100);
  state.stress = clamp(state.stress - 14, 0, 100);
  state.day += 1;
  state.eventOutcome = 'Hari ini digunakan untuk istirahat dan memulihkan energi.';
  navigate('work');
}
function study() {
  if (state.money < 250000) state.studyMessage = 'Saldo belum cukup untuk kursus Rp250.000.';
  else {
    state.money -= 250000;
    state.skill = clamp(Number((state.skill + 0.3).toFixed(1)), 1, 10);
    state.studyMessage = 'Kursus selesai; skill naik 0,3.';
  }
  navigate('work');
}
function showHistory() { navigate('history'); }
function quit() {
  if (state.employed) state.history.push({ company: getCompany()?.name || 'Tempat kerja', role: state.level, day: state.day, note: 'Mengundurkan diri dengan pemberitahuan.' });
  state.employed = false;
  state.offer = false;
  navigate(state.professionId ? 'jobs' : 'home');
}
function promote() {
  const p = getProfession();
  if (!state.promotion || !canPromote(state, p)) return;
  state.level = state.promotion;
  state.salary = Math.round(state.salary * 1.15);
  state.internal = 40;
  state.history.push({ company: getCompany()?.name || 'Tempat kerja', role: state.level, day: state.day, note: 'Promosi dan kenaikan gaji 15%' });
  state.promotion = null;
  if (!state.achievements.includes('promotion')) state.achievements.push('promotion');
  navigate('work');
}
function backToJobs() { navigate('jobs'); }
function backToHome() { state.professionId = null; state.companyId = null; navigate('home'); }
function goBack() {
  if (screen === 'company') return backToJobs();
  if (screen === 'jobs') return backToHome();
  if (screen === 'interview') return navigate('company');
  if (screen === 'offer') return backToJobs();
  return navigate(state.employed ? 'work' : state.professionId ? 'jobs' : 'home');
}

document.querySelector('#export-save')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'career-verse-save.json'; link.click();
  URL.revokeObjectURL(url);
});
document.querySelector('#import-save')?.addEventListener('change', async event => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid');
    state = { ...createState(), ...data };
    screen = state.screen || 'home';
    persist();
    start();
  } catch { alert('File save tidak valid.'); }
  event.target.value = '';
});
document.querySelector('#reset-game')?.addEventListener('click', () => {
  if (confirm('Hapus progres dan mulai ulang?')) {
    state = createState(); screen = 'home'; task = null; persist(); start();
  }
});
loadData().catch(error => {
  app.innerHTML = `<section class="panel"><h1>Belum dapat memuat game</h1><p>${error.message}</p><p>Pastikan data tersedia di branch main, lalu muat ulang halaman.</p></section>`;
});
