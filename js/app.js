import { render } from './ui.js';
import { clamp, createState, loadGame, saveGame, acceptanceChance, evaluateTask, salaryFor, canPromote, xpToNextLevel, formatMoney } from './engine.js';

const app = document.querySelector('#app');
let state = loadGame();
let professions = [];
let companies = [];
let screen = state.screen || 'home';
let currentTask = null;

async function loadData() {
  const professionIds = ['digital-marketer','programmer','guru','perawat','chef','data-analyst','uiux-designer','content-creator'];
  const companyIds = ['kopi-kilat','nusa-global','kreasi-bersama','kodeku-labs','sma-nusa-bangsa','rs-harapan-sehat','klinik-sehat-bersama','restoran-rasa-nusantara','bistro-senja','piksel-nusantara','garda-nusantara'];
  const read = async path => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Tidak bisa memuat ${path} (HTTP ${response.status})`);
    return response.json();
  };
  [professions, companies] = await Promise.all([
    Promise.all(professionIds.map(id => read(`./data/professions/${id}.json`))),
    Promise.all(companyIds.map(id => read(`./data/companies/${id}.json`)))
  ]);
  if (!professions.some(p => p.id === state.professionId)) state.professionId = null;
  if (!companies.some(c => c.id === state.companyId)) state.companyId = null;
  if (!['home','jobs','company','interview','result','work','task','resultTask','history'].includes(screen)) screen = 'home';
  start();
}
function persist() {
  state.screen = screen;
  const saved = saveGame(state);
  const status = document.querySelector('#save-status');
  if (status) status.textContent = saved ? '✓ Progres tersimpan otomatis' : 'Penyimpanan tidak tersedia';
}
function selectedProfession() { return professions.find(p => p.id === state.professionId) || null; }
function selectedCompany() { return companies.find(c => c.id === state.companyId) || null; }
function start() {
  if (!professions.length) return;
  if (state.employed && screen === 'home') screen = 'work';
  render(app, {
    screen, state, professions, companies,
    profession: selectedProfession(), company: selectedCompany(), currentTask,
    callbacks: {
      chooseProfession: selectProfession, chooseCompany: selectCompany,
      applyForJob, answerInterview, acceptOffer, negotiateOffer, goJobs,
      beginDay, answerTask, handleEventChoice, rest, study, showHistory,
      quit, promote, returnToWork
    }
  });
}
function update(nextScreen) { screen = nextScreen; persist(); start(); }
function selectProfession(id) { state.professionId = id; state.companyId = null; update('jobs'); }
function selectCompany(id) { state.companyId = id; update('company'); }
function applyForJob() {
  const profession = selectedProfession(), company = selectedCompany();
  if (!profession || !company) return;
  state.lastChance = acceptanceChance(state, company, profession);
  update('interview');
}
function answerInterview(answer) {
  const bonus = answer === 'good' ? 12 : answer === 'neutral' ? 2 : -8;
  state.lastChance = clamp(state.lastChance + bonus, 5, 98);
  state.interviewFeedback = answer === 'good'
    ? 'Jawabanmu jelas, terstruktur, dan menyeimbangkan kebutuhan tugas dengan komunikasi profesional.'
    : answer === 'neutral' ? 'Jawaban sudah cukup. Contoh konkret akan membuatmu terlihat lebih siap.'
      : 'Jujur soal kapasitas dan risiko membantu tim menyepakati ekspektasi yang realistis.';
  state.offer = Math.random() * 100 < state.lastChance;
  if (state.offer) {
    const company = selectedCompany();
    state.offeredSalary = Math.min(salaryFor(company.salary[0], 0, 1.03), company.salary[1]);
  }
  update('result');
}
function acceptOffer() {
  const company = selectedCompany(), profession = selectedProfession();
  if (!company || !profession || !state.offer) return;
  state.employed = true; state.salary = state.offeredSalary || company.salary[0];
  state.level = profession.careerLadder[0] || 'Intern';
  state.day = 1; state.tasksDone = 0; state.history ||= [];
  state.history.push({ company: company.name, role: state.level, day: 1, note: 'Masa onboarding dan probation dimulai' });
  state.onboarding = `Hari pertama! ${company.boss} mengajakmu mengenal tim dan menyepakati target probation.`;
  update('work');
}
function negotiateOffer() {
  const company = selectedCompany(); if (!company) return;
  const ask = Math.round((state.offeredSalary || company.salary[0]) * 1.08 / 100000) * 100000;
  if (ask <= company.salary[1] && Math.random() < 0.65) {
    state.offeredSalary = ask; state.negotiation = 'Negosiasi berhasil. Pastikan rincian kompensasi dan tunjangan tertulis.';
  } else state.negotiation = 'Perusahaan belum dapat menyetujui angka tersebut; tawaran awal masih berlaku.';
  update('result');
}
function beginDay() {
  const profession = selectedProfession();
  if (!profession?.tasks?.length) return;
  currentTask = profession.tasks[state.tasksDone % profession.tasks.length];
  update('task');
}
function answerTask(index) {
  if (!currentTask || !currentTask.options[index]) return;
  const option = currentTask.options[index], result = evaluateTask(currentTask.options[index].score, state);
  state.energy = clamp(state.energy + result.energy, 0, 100);
  state.stress = clamp(state.stress + result.stress, 0, 100);
  state.reputation = clamp(state.reputation + result.rep, 0, 100);
  state.internal = clamp(state.internal + result.internal, 0, 100);
  state.relationship = clamp(state.relationship + (result.score >= 75 ? 3 : 1), 0, 100);
  state.satisfaction = clamp(state.satisfaction + (result.score >= 70 ? 4 : -2), 0, 100);
  state.xp += result.xp; state.tasksDone += 1; state.day += 1;
  state.lastResult = { title: currentTask.title, feedback: option.feedback, score: result.score, info: selectedProfession()?.realWorld || '' };
  while (state.xp >= xpToNextLevel(Math.floor(state.skill))) {
    state.xp -= xpToNextLevel(Math.floor(state.skill));
    state.skill = clamp(Number((state.skill + 0.2).toFixed(1)), 1, 10);
    if (!state.achievements.includes('skill-up')) state.achievements.push('skill-up');
  }
  state.payday = ''; state.review = '';
  if (state.tasksDone % 5 === 0) {
    const cost = 350000; state.money += state.salary - cost;
    state.payday = `Gajian ${formatMoney(state.salary)} · biaya hidup ilustratif ${formatMoney(cost)} telah dihitung.`;
    state.review = result.score >= 70 ? 'Review mingguan: kontribusimu konsisten. Catat dampak kerja dan sepakati prioritas berikutnya.' : 'Review mingguan: pilih satu area untuk ditingkatkan dan minta umpan balik spesifik.';
    if (result.score >= 70) state.internal = clamp(state.internal + 3, 0, 100);
  }
  const profession = selectedProfession();
  state.event = profession?.events?.length && state.tasksDone % 3 === 0 ? profession.events[Math.floor(Math.random() * profession.events.length)] : null;
  state.promotion = canPromote(state, profession) ? profession.careerLadder[profession.careerLadder.indexOf(state.level) + 1] : null;
  if (!state.achievements.includes('first-task')) state.achievements.push('first-task');
  update('resultTask');
}
function handleEventChoice(choice) {
  if (!state.event) return;
  if (choice === 'talk') {
    state.stress = clamp(state.stress - 5, 0, 100); state.internal = clamp(state.internal + 2, 0, 100); state.relationship = clamp(state.relationship + 3, 0, 100);
    state.eventOutcome = 'Kamu membicarakan kapasitas dan menyepakati prioritas bersama tim.';
  } else {
    state.stress = clamp(state.stress + 8, 0, 100); state.energy = clamp(state.energy - 8, 0, 100); state.reputation = clamp(state.reputation + 1, 0, 100);
    state.eventOutcome = 'Kamu mengambil pekerjaan tambahan. Perhatikan beban kerja dan rencanakan pemulihan.';
  }
  state.event = null; persist(); start();
}
function rest() { state.energy = clamp(state.energy + 22, 0, 100); state.stress = clamp(state.stress - 14, 0, 100); state.day += 1; state.eventOutcome = 'Kamu menggunakan satu hari untuk memulihkan energi.'; update('work'); }
function study() {
  if (state.money < 250000) state.studyMessage = 'Saldo belum cukup untuk kursus Rp250.000. Simpan dana dari gajian.';
  else { state.money -= 250000; state.skill = clamp(Number((state.skill + 0.3).toFixed(1)), 1, 10); state.xp = 0; state.studyMessage = 'Kursus selesai: skill naik 0,3.'; }
  update('work');
}
function showHistory() { update('history'); }
function quit() {
  if (state.employed) state.history.push({ company: selectedCompany()?.name || 'Tempat kerja', role: state.level, day: state.day, note: 'Mengundurkan diri dengan pemberitahuan.' });
  state.employed = false; state.offer = false; update(state.professionId ? 'jobs' : 'home');
}
function promote() {
  const profession = selectedProfession();
  if (!state.promotion || !canPromote(state, profession)) return;
  state.level = state.promotion; state.salary = Math.round(state.salary * 1.15); state.internal = 40;
  state.history.push({ company: selectedCompany()?.name || 'Tempat kerja', role: state.level, day: state.day, note: 'Promosi dan kenaikan gaji 15%.' });
  state.promotion = null;
  if (!state.achievements.includes('promotion')) state.achievements.push('promotion');
  update('work');
}
function goJobs() { state.employed = false; state.offer = false; update(state.professionId ? 'jobs' : 'home'); }
function returnToWork() { update(state.employed ? 'work' : state.professionId ? 'jobs' : 'home'); }

document.querySelector('#export-save')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'career-verse-save.json'; link.click(); URL.revokeObjectURL(url);
});
document.querySelector('#import-save')?.addEventListener('change', async event => {
  try {
    const file = event.target.files[0]; if (!file) return;
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid');
    state = { ...createState(), ...data }; screen = state.screen || 'home'; persist(); start();
  } catch { alert('File save tidak valid.'); }
  event.target.value = '';
});
document.querySelector('#reset-game')?.addEventListener('click', () => {
  if (confirm('Hapus progres lokal dan mulai ulang?')) { state = createState(); currentTask = null; screen = 'home'; persist(); start(); }
});

loadData().catch(error => {
  app.innerHTML = `<section class="panel"><h1>Belum dapat memuat game</h1><p>${error.message}</p><p>Jalankan server lokal: <code>python3 -m http.server 8000</code>, lalu buka http://localhost:8000.</p></section>`;
});
