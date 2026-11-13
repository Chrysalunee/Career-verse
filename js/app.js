import { createState, loadGame, saveGame, acceptanceChance, evaluateTask, salaryFor, clamp, canPromote, xpToNextLevel } from './engine.js';
import { render } from './ui.js';

const app = document.querySelector('#app');
let state = loadGame();
let professions = [];
let companies = [];
let screen = state.screen || 'home';
let currentTask = null;

async function loadData() {
  // Daftar ID ini sengaja eksplisit: JSON tetap bisa diedit kontributor tanpa bundler.
  const professionIds = ['digital-marketer','programmer','guru','perawat','chef'];
  const companyIds = ['kopi-kilat','nusa-global','kreasi-bersama','kodeku-labs','sma-nusa-bangsa','rs-harapan-sehat','klinik-sehat-bersama','restoran-rasa-nusantara','bistro-senja'];
  const read = async path => { const response = await fetch(path); if (!response.ok) throw new Error(`Tidak bisa memuat ${path}`); return response.json(); };
  [professions, companies] = await Promise.all([
    Promise.all(professionIds.map(id => read(`data/professions/${id}.json`))),
    Promise.all(companyIds.map(id => read(`data/companies/${id}.json`)))
  ]);
  if (!professions.some(p => p.id === state.professionId) || !companies.some(c => c.id === state.companyId)) {
    if (!state.employed) screen = 'home';
  }
  start();
}
function persist() {
  state.screen = screen;
  const saved = saveGame(state);
  const status = document.querySelector('#save-status');
  if (status) status.textContent = saved ? '✓ Progres tersimpan' : 'Penyimpanan browser tidak tersedia';
}
function selectedProfession() { return professions.find(p => p.id === state.professionId); }
function selectedCompany() { return companies.find(c => c.id === state.companyId); }
function start() {
  if (!professions.length) return;
  const p = selectedProfession(), c = selectedCompany();
  if (state.employed && (!p || !c)) { state.employed = false; screen = 'home'; }
  if (state.employed && screen === 'home') screen = 'work';
  render(app, {
    screen, state, professions, companies, profession: p, company: c, currentTask,
    callbacks: { chooseProfession, chooseCompany, apply, answerInterview, acceptOffer, negotiate, goJobs, beginDay, answerTask, answerEvent, rest, study, showHistory, quit, promote, returnToWork }
  });
}
function update(view = screen) { screen = view; persist(); start(); }
function chooseProfession(id) { state.professionId = id; state.companyId = null; update('jobs'); }
function chooseCompany(id) { state.companyId = id; update('company'); }
function apply() {
  const chance = acceptanceChance(state, selectedCompany(), selectedProfession());
  state.lastChance = chance;
  state.interviewAnswered = false;
  update('interview');
}
function answerInterview(answer) {
  const bonus = answer === 'good' ? 12 : answer === 'neutral' ? 2 : -8;
  const chance = clamp(state.lastChance + bonus, 5, 98);
  state.lastChance = chance;
  state.interviewFeedback = answer === 'good'
    ? 'Jawabanmu menjelaskan prioritas, komunikasi, dan hasil secara konkret.'
    : answer === 'neutral'
      ? 'Ada dasar yang baik. Contoh spesifik akan membuat jawaban lebih kuat.'
      : 'Kapasitas dan risiko perlu dibicarakan terbuka; berjanji berlebihan bisa merugikan tim.';
  state.offer = Math.random() * 100 < chance;
  if (state.offer) {
    const company = selectedCompany();
    const index = Math.max(0, selectedProfession().careerLadder.indexOf(selectedProfession().careerLadder[0]));
    state.offeredSalary = Math.min(salaryFor(company.salary[0], index, 1.03), company.salary[1]);
  }
  update('result');
}
function acceptOffer() {
  const company = selectedCompany(), profession = selectedProfession();
  if (!company || !profession || !state.offer) return;
  state.employed = true;
  state.salary = state.offeredSalary;
  state.level = profession.careerLadder[0];
  state.day = 1; state.tasksDone = 0; state.streak = 0;
  state.history ||= [];
  state.history.push({ company: company.name, role: state.level, day: state.day, note: 'Onboarding dan masa percobaan dimulai' });
  state.onboarding = `Hari pertama! ${company.boss} memperkenalkanmu kepada ${company.coworkers[0].split(' — ')[0]}. Sepakati target probation dan tanyakan jalur eskalasi bila prioritas bertabrakan.`;
  update('work');
}
function negotiate() {
  const company = selectedCompany();
  const ask = Math.round(state.offeredSalary * 1.08 / 100000) * 100000;
  if (ask <= company.salary[1] && Math.random() < 0.65) {
    state.offeredSalary = ask;
    state.negotiation = 'Negosiasi berhasil. Pastikan rincian kompensasi dan tunjangan tertulis dalam penawaran.';
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
  const option = currentTask.options[index];
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
  state.lastScore = result.score;
  const oldSkill = state.skill;
  while (state.xp >= xpToNextLevel(state.skill)) {
    state.xp -= xpToNextLevel(state.skill);
    state.skill = Math.min(10, Math.round((state.skill + 0.2) * 10) / 10);
  }
  if (state.skill > oldSkill && !state.achievements.includes('skill-up')) state.achievements.push('skill-up');
  // Gaji dibayar per lima hari kerja; biaya hidup dibayar terpisah agar pilihan finansial terasa.
  state.payday = null;
  state.review = null;
  if (state.tasksDone % 5 === 0) {
    const livingCost = 350000;
    state.money += state.salary - livingCost;
    state.payday = `Gajian ${formatMoney(state.salary)} · biaya hidup ilustratif ${formatMoney(livingCost)} telah dihitung.`;
    state.review = result.score >= 70
      ? 'Review mingguan: kontribusimu konsisten. Catat dampak kerja dan sepakati prioritas berikutnya.'
      : 'Review mingguan: pilih satu area untuk ditingkatkan dan minta dukungan atau umpan balik yang spesifik.';
    if (result.score >= 70) state.internal = clamp(state.internal + 3, 0, 100);
  }
  const profession = selectedProfession();
  state.lastResult = { title: currentTask.title, feedback: option.feedback, score: result.score, info: profession.realWorld };
  state.event = state.tasksDone % 3 === 0 && profession.events?.length
    ? profession.events[Math.floor(Math.random() * profession.events.length)] : null;
  state.promotion = canPromote(state, profession) ? profession.careerLadder[profession.careerLadder.indexOf(state.level) + 1] : null;
  if (state.tasksDone >= 1 && !state.achievements.includes('first-task')) state.achievements.push('first-task');
  update('resultTask');
}
function answerEvent(choice) {
  if (choice === 'talk') {
    state.stress = clamp(state.stress - 5, 0, 100);
    state.internal = clamp(state.internal + 2, 0, 100);
    state.relationship = clamp(state.relationship + 3, 0, 100);
    state.eventOutcome = 'Kamu mengomunikasikan kapasitas dan menyepakati prioritas bersama tim.';
  } else {
    state.stress = clamp(state.stress + 8, 0, 100);
    state.energy = clamp(state.energy - 8, 0, 100);
    state.reputation = clamp(state.reputation + 1, 0, 100);
    state.eventOutcome = 'Kamu mengambil pekerjaan tambahan. Hasil cepat bisa membantu, tetapi perhatikan beban kerja dan batas sehat.';
  }
  state.event = null;
  persist(); start();
}
function rest() {
  state.energy = clamp(state.energy + 22, 0, 100);
  state.stress = clamp(state.stress - 14, 0, 100);
  state.day += 1;
  state.eventOutcome = 'Kamu menggunakan satu hari untuk memulihkan energi. Istirahat terencana mendukung kinerja berkelanjutan.';
  update('work');
}
function study() {
  const cost = 250000;
  if (state.money < cost) { state.studyMessage = 'Saldo belum cukup. Simpan dana dari gajian atau coba lagi nanti.'; update('work'); return; }
  state.money -= cost;
  state.skill = Math.min(10, Math.round((state.skill + 0.3) * 10) / 10);
  state.xp = 0;
  state.studyMessage = 'Investasi belajar selesai: skill naik 0,3. Gunakan skill pada tugas berikutnya.';
  update('work');
}
function showHistory() { update('history'); }
function quit() {
  if (state.employed) {
    state.history.push({ company: selectedCompany()?.name || 'Tempat kerja', role: state.level, day: state.day, note: 'Mengundurkan diri dengan pemberitahuan; referensi dipengaruhi relasi dan komunikasi.' });
    state.employed = false;
  }
  state.offer = false;
  update(state.professionId ? 'jobs' : 'home');
}
function promote() {
  const profession = selectedProfession();
  if (!state.promotion || !canPromote(state, profession)) return;
  state.level = state.promotion;
  state.salary = Math.round(state.salary * 1.15);
  state.internal = 40;
  state.history.push({ company: selectedCompany().name, role: state.level, day: state.day, note: 'Promosi dan penyesuaian gaji 15%' });
  state.promotion = null;
  state.achievements.push('promotion');
  update('work');
}
function goJobs() { state.employed = false; state.offer = false; update('jobs'); }
function returnToWork() { update('work'); }
function formatMoney(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0); }

window.answerInterview = answerInterview;
document.querySelector('#export-save').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = 'career-verse-save.json'; link.click(); URL.revokeObjectURL(url);
});
document.querySelector('#import-save').addEventListener('change', async event => {
  try {
    const data = JSON.parse(await event.target.files[0].text());
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid');
    state = { ...createState(), ...data };
    screen = state.screen || 'home'; persist(); start();
  } catch { alert('File save tidak valid.'); }
  event.target.value = '';
});
document.querySelector('#reset-game').addEventListener('click', () => {
  if (confirm('Hapus progres lokal dan mulai ulang?')) { state = createState(); currentTask = null; screen = 'home'; persist(); start(); }
});
loadData().catch(error => {
  app.innerHTML = `<section class="panel"><h1>Belum dapat memuat game</h1><p>${error.message}</p><p>Jalankan server lokal: <code>python3 -m http.server 8000</code>, lalu buka http://localhost:8000.</p></section>`;
});
