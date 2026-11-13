import { mountWorldScene, loadWorldCatalog, getCompanyScene } from './boot.js';
import { applyWorldTask, applyCoffeeBreak, applySupervisorConversation } from './gameplay.js';

const SAVE_KEY = 'career-verse-save';
let worldIsOpen = false;
let worldIsOpening = false;
const stage = document.createElement('div');
stage.id = 'careerverse-world3d-stage';
stage.style.display = 'none';

const readSave = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
  } catch {
    return {};
  }
};

const getCompanyMeta = async (companyId) => {
  if (!companyId) return null;
  try {
    const response = await fetch(`./data/companies/${companyId}.json`);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

const getProfessionMeta = async (professionId) => {
  if (!professionId) return null;
  try {
    const response = await fetch(`./data/professions/${professionId}.json`);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

async function openWorld() {
  if (worldIsOpen || worldIsOpening) return;
  worldIsOpening = true;
  try {
  const save = readSave();
  const selectedCompany = await getCompanyMeta(save.companyId);
  const selectedProfession = await getProfessionMeta(save.professionId);
  const catalog = await loadWorldCatalog();
  const scene = getCompanyScene(selectedCompany || {}, catalog.workplaceMap, catalog.templates);
  const tasks = selectedProfession?.tasks || [];
  const currentTask = tasks.length ? tasks[(Number(save.tasksDone) || 0) % tasks.length] : null;

  stage.innerHTML = `
    <div class="world3d-shell">
      <div class="world3d-header">
        <div>
          <span class="eyebrow">Careerverse 3D</span>
          <h2>${selectedCompany?.name || 'Dunia kerja'}</h2>
        </div>
        <button type="button" class="world3d-close" aria-label="Tutup dunia 3D">Tutup</button>
      </div>
      <div class="world3d-view" id="world3d-view" aria-label="Pemandangan 3D tempat kerja"></div>
      <div class="world3d-meta">
        <p><strong>Profesi:</strong> ${selectedProfession?.name || 'Belum dipilih'}</p>
        <p><strong>Tempat kerja:</strong> ${scene?.workplaceType || 'hq_office'}</p>
        <p><strong>Hari:</strong> ${Number(save.day) || 1} · <strong>Energi:</strong> ${Number(save.energy) || 0}% · <strong>Tugas selesai:</strong> ${Number(save.tasksDone) || 0}</p>
      </div>
      <div class="world3d-task-panel" id="world3d-task-panel" hidden></div>
    </div>
  `;

  stage.style.display = 'flex';
  document.body.classList.add('world3d-active');
  const host = document.getElementById('world3d-view');
  let app;
  try {
    app = await mountWorldScene(host, {
    color: scene?.palette?.primary || '#6ec9a4',
    label: `${selectedCompany?.name || 'Kantor'} · ${selectedProfession?.name || 'Profesi'}`,
    task: currentTask,
    day: save.day,
    startMinutes: save.world?.clockMinutes || 9 * 60,
    totalGameMinutes: save.world?.totalGameMinutes || save.world?.clockMinutes || 9 * 60,
    calendarDay: save.world?.calendarDay || save.day || 1,
    onInteract: (target) => {
      if (target.id === 'work-desk') showWorkTask(currentTask);
      else if (target.id === 'npc-ratna') showNpcDialogue();
      else if (target.id === 'coffee-machine') makeCoffee();
    },
    });
    worldIsOpen = true;
  } catch (error) {
    const view = stage.querySelector('.world3d-view');
    if (view) view.textContent = `Dunia 3D gagal dimuat: ${error.message}. Periksa koneksi internet lalu muat ulang halaman.`;
    worldIsOpening = false;
    return;
  }
  worldIsOpening = false;

  const close = stage.querySelector('.world3d-close');
  close.addEventListener('click', () => {
    const latest = readSave(); latest.world ||= {};
    if (app?.getGameClock) Object.assign(latest.world, app.getGameClock());
    persistWorldSave(latest);
    app?.destroy();
    stage.style.display = 'none';
    document.body.classList.remove('world3d-active');
    worldIsOpen = false;
  });
  } catch (error) {
    stage.innerHTML = `<div class="world3d-shell"><div class="world3d-header"><h2>Career-Verse 3D</h2><button type="button" class="world3d-close">Tutup</button></div><div class="world3d-view" style="padding:2rem;color:white">Dunia 3D belum dapat dimuat: ${String(error.message || error)}. Coba muat ulang halaman.</div></div>`;
    stage.style.display = 'flex';
    document.body.classList.add('world3d-active');
    stage.querySelector('.world3d-close')?.addEventListener('click', () => { stage.style.display = 'none'; document.body.classList.remove('world3d-active'); worldIsOpening = false; });
    worldIsOpening = false;
  }

  function persistWorldSave(save) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* storage may be disabled */ }
    window.dispatchEvent(new CustomEvent('careerverse-refresh-career-state', { detail: save }));
  }

  function showNpcDialogue() {
    const panel = stage.querySelector('#world3d-task-panel');
    if (!panel) return;
    const latest = readSave();
    const title = document.createElement('h3'); title.textContent = 'Bu Ratna · Supervisor Kopi Kilat';
    const line = document.createElement('p');
    line.textContent = '“Selamat pagi! Bagaimana adaptasimu hari ini? Kalau ada kendala, ceritakan. Kita cari solusinya bersama.”';
    const choices = [
      { label: 'Sampaikan progres dan target hari ini', relation: 4, reputation: 2, stress: -2, reply: 'Bu Ratna mengapresiasi laporanmu yang jelas. “Bagus, kita samakan prioritasnya.”' },
      { label: 'Minta arahan untuk meningkatkan skill', relation: 5, reputation: 1, skill: 1, reply: 'Bu Ratna memberi beberapa tips praktis dan menawarkan sesi mentoring singkat.' },
      { label: 'Mengobrol santai sebentar', relation: 3, stress: -4, satisfaction: 2, reply: 'Suasana terasa lebih akrab. Kamu kembali bekerja dengan pikiran lebih ringan.' },
    ];
    panel.replaceChildren(title, line);
    const list = document.createElement('div'); list.className = 'world3d-task-options';
    choices.forEach(choice => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'world3d-task-option'; button.textContent = choice.label;
      button.addEventListener('click', () => {
        const current = readSave();
        applySupervisorConversation(current, choice);
        persistWorldSave(current);
        const response = document.createElement('p'); response.className = 'world3d-task-feedback'; response.textContent = choice.reply;
        const done = document.createElement('button'); done.type = 'button'; done.className = 'world3d-task-close'; done.textContent = 'Selesai'; done.addEventListener('click', () => { panel.hidden = true; });
        panel.replaceChildren(title, response, done);
      });
      list.append(button);
    });
    const closePanel = document.createElement('button'); closePanel.type = 'button'; closePanel.className = 'world3d-task-close'; closePanel.textContent = 'Nanti'; closePanel.addEventListener('click', () => { panel.hidden = true; });
    panel.append(list, closePanel); panel.hidden = false;
  }

  function makeCoffee() {
    const panel = stage.querySelector('#world3d-task-panel');
    if (!panel) return;
    const current = readSave();
    applyCoffeeBreak(current);
    persistWorldSave(current);
    panel.replaceChildren();
    const title = document.createElement('h3'); title.textContent = 'Kopi siap!';
    const message = document.createElement('p'); message.textContent = 'Kamu menikmati secangkir kopi. Energi +12, stres -3.';
    const done = document.createElement('button'); done.type = 'button'; done.className = 'world3d-task-close'; done.textContent = 'Lanjutkan'; done.addEventListener('click', () => { panel.hidden = true; });
    panel.append(title, message, done); panel.hidden = false;
  }

  function showWorkTask(task) {
    const panel = stage.querySelector('#world3d-task-panel');
    if (!panel) return;
    if (!task?.options?.length) {
      panel.hidden = false;
      panel.innerHTML = '<p>Belum ada tugas untuk profesi ini.</p><button type="button" class="world3d-task-close">Tutup</button>';
      panel.querySelector('button').addEventListener('click', () => { panel.hidden = true; });
      return;
    }
    panel.replaceChildren();
    const title = document.createElement('h3'); title.textContent = task.title || 'Aktivitas kerja';
    const prompt = document.createElement('p'); prompt.textContent = task.prompt || 'Pilih tindakan terbaik untuk menyelesaikan pekerjaan.';
    const options = document.createElement('div'); options.className = 'world3d-task-options';
    task.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'world3d-task-option';
      button.textContent = option.label || `Pilihan ${index + 1}`;
      button.addEventListener('click', () => {
        const latest = readSave();
        const result = applyWorldTask(latest, task, index);
        if (!result.ok) return;
        latest.screen = 'work'; latest.pendingTask = null;
        latest.world ||= {}; latest.world.lastWorkAt = latest.world.clockMinutes || 9 * 60;
        persistWorldSave(latest);
        window.dispatchEvent(new CustomEvent('careerverse-world-task-complete', { detail: latest }));
        const feedback = document.createElement('p');
        feedback.className = 'world3d-task-feedback';
        feedback.textContent = `${result.score} poin — ${option.feedback || 'Aktivitas selesai.'}`;
        panel.replaceChildren(title, feedback);
        const done = document.createElement('button'); done.type = 'button'; done.className = 'world3d-task-close'; done.textContent = 'Lanjutkan';
        done.addEventListener('click', () => { panel.hidden = true; });
        panel.append(done);
      });
      options.append(button);
    });
    const closePanel = document.createElement('button'); closePanel.type = 'button'; closePanel.className = 'world3d-task-close'; closePanel.textContent = 'Nanti';
    closePanel.addEventListener('click', () => { panel.hidden = true; });
    panel.append(title, prompt, options, closePanel);
    panel.hidden = false;
  }
}

const button = document.createElement('button');
button.type = 'button';
button.className = 'world3d-button';
button.textContent = '🌍 Dunia 3D';
button.setAttribute('aria-label', 'Buka dunia 3D');
button.addEventListener('click', openWorld);
window.addEventListener('careerverse-app-ready', openWorld, { once: true });
window.addEventListener('load', () => { if (!worldIsOpen && !worldIsOpening) openWorld(); }, { once: true });
window.addEventListener('careerverse-world-task-complete', event => {
  // Keep the main career screen and the 3D interaction on the same save state.
  window.dispatchEvent(new CustomEvent('careerverse-refresh-career-state', { detail: event.detail }));
});

document.body.appendChild(stage);
document.body.appendChild(button);
