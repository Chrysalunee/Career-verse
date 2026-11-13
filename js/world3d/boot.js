// Mount an optional, keyboard-accessible workplace world over the existing menu game.
import { applyWorldTask, getCompanyScene, mapInteractiveObjects, moveWorld, readSave, WORLD_SAVE_KEY } from './gameplay.js';
import { MALL_LOCATIONS, visitMall } from './mall.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const readJson = async path => { const response = await fetch(path); if (!response.ok) throw new Error(`Data tidak tersedia: ${path}`); return response.json(); };
let dataPromise;
const loadWorldData = () => dataPromise ||= Promise.all([
  readJson('./data/world/templates/templates.json'),
  readJson('./data/world/company-workplaces.json'),
  readJson('./data/professions/digital-marketer.json').catch(() => null),
]).then(([templateData, metadata]) => ({ templates: templateData.templates || [], metadata }));
function loadSave() { return readSave(localStorage.getItem(WORLD_SAVE_KEY)); }
function saveGame(state) { try { localStorage.setItem(WORLD_SAVE_KEY, JSON.stringify(state)); return true; } catch { return false; } }
function launchButton() {
  if (document.querySelector('#open-world3d')) return;
  const button = document.createElement('button');
  button.id = 'open-world3d'; button.type = 'button'; button.className = 'world-launcher primary';
  button.textContent = '🧊 Jelajahi Dunia 3D';
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', openWorld);
  document.body.append(button);
}
function closeWorld() { document.querySelector('#world3d-overlay')?.remove(); document.querySelector('#open-world3d')?.focus(); }
async function openWorld() {
  const save = loadSave();
  const overlay = document.createElement('div'); overlay.className = 'world-overlay'; overlay.id = 'world3d-overlay';
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-labelledby','world-title');
  overlay.innerHTML = '<section class="world-window"><p role="status">Memuat lokasi…</p></section>';
  document.body.append(overlay);
  overlay.addEventListener('click', event => { if (event.target === overlay) closeWorld(); });
  overlay.addEventListener('keydown', event => { if (event.key === 'Escape') closeWorld(); });
  try {
    const [worldData, profession, company] = await Promise.all([
      loadWorldData(),
      save.professionId ? readJson(`./data/professions/${encodeURIComponent(save.professionId)}.json`).catch(() => null) : Promise.resolve(null),
      save.companyId ? readJson(`./data/companies/${encodeURIComponent(save.companyId)}.json`).catch(() => null) : Promise.resolve(null),
    ]);
    renderWorld(overlay, save, worldData, profession, company);
  } catch (error) {
    overlay.querySelector('.world-window').innerHTML = `<h2 id="world-title">Dunia Careerverse</h2><p>${esc(error.message)}</p><button type="button" data-world-close>Tutup</button>`;
    overlay.querySelector('[data-world-close]').onclick = closeWorld;
  }
}
function renderWorld(overlay, save, worldData, profession, company, activeTask = null, activeObject = null, notice = '') {
  const place = save.world.currentPlace || 'home';
  const employed = Boolean(save.employed && company && profession);
  const scene = employed ? getCompanyScene(company, worldData.metadata, worldData.templates) : null;
  const objects = scene ? mapInteractiveObjects(scene, profession) : [];
  const mall = place === 'mall';
  const title = mall ? 'Mal Careerverse' : place === 'workplace' && scene ? `${scene.name} · ${company.name}` : place === 'learning' ? 'Ruang belajar' : place === 'home' ? 'Rumah dan kota' : scene?.name || 'Kota Careerverse';
  const activeItems = mall ? MALL_LOCATIONS.map(item => `<button class="world-object" data-mall="${esc(item.id)}"><span class="world-object-icon">${item.icon}</span><strong>${esc(item.name)}</strong><small>Biaya ${new Intl.NumberFormat('id-ID').format(item.cost)} · ${esc(item.dialogue[0])}</small></button>`).join('') : objects.map((item, index) => `<button class="world-object" data-object="${index}" ${item.task ? '' : 'disabled'}><span class="world-object-icon">${index % 2 ? '🗂️' : '🖥️'}</span><strong>${esc(item.name)}</strong><small>${esc(item.hint || 'Objek interaktif')} ${item.task ? `· Tugas: ${esc(item.task.title || 'Mini-game profesi')}` : '· Tidak tersedia untuk profesi ini'}</small></button>`).join('');
  const cityLinks = ['home','workplace','mall','learning'].map(id => `<button type="button" data-travel="${id}">${({home:'🏠 Rumah',workplace:'🏢 Tempat kerja',mall:'🏬 Mal',learning:'📚 Belajar'})[id]}</button>`).join('');
  const taskMarkup = activeTask ? `<section class="world-task panel"><button type="button" class="world-back" data-world-back>← Kembali ke lokasi</button><span class="eyebrow">Mini-game profesi · ${esc(profession?.name || '')}</span><h2>${esc(activeTask.title || 'Tugas kerja')}</h2><p>${esc(activeTask.prompt || 'Pilih cara terbaik menangani pekerjaan ini.')}</p><div class="world-choice-list">${(activeTask.options || []).map((option,index) => `<button type="button" data-task-choice="${index}">${esc(option.label || `Pilihan ${index+1}`)}</button>`).join('')}</div></section>` : '';
  overlay.querySelector('.world-window').innerHTML = `<header class="world-header"><div><span class="eyebrow">Careerverse · mode isometrik</span><h1 id="world-title" tabindex="-1">${esc(title)}</h1><p>${employed ? `${esc(company.logo)} ${esc(company.name)} · ${esc(profession.name)} · Energi ${Number(save.energy)||0}/100` : 'Pilih tujuan dari peta kota. Tempat kerja perusahaan muncul setelah kamu menerima tawaran kerja.'}</p></div><button type="button" data-world-close aria-label="Tutup dunia">Tutup ✕</button></header>
    ${notice ? `<p class="notice" role="status">${esc(notice)}</p>` : ''}
    <div class="world-layout"><div class="world-scene" style="--scene-accent:${esc(scene?.accent || '#78d8a2')}" role="img" aria-label="Tampilan isometrik ${esc(title)}. Objek dan tugas tersedia sebagai tombol di daftar berikut."><div class="iso-back-wall"></div><div class="iso-window"></div><div class="iso-floor"></div><div class="iso-rug"></div><div class="iso-desk"><span>▰</span></div><div class="iso-screen">▣</div><div class="iso-plant">🪴</div><div class="iso-chair">▥</div><div class="iso-npc">${esc(scene?.npcs?.[0]?.name || '👤')}</div><div class="iso-decor">${esc((scene?.decor || ['meja kerja','papan proyek','tanaman']).slice(0,3).join(' · '))}</div><span class="iso-label">${esc(scene?.workplaceType || (mall ? 'area publik' : 'kota'))}</span></div>
    <aside class="world-side"><h2>🗺️ Pergi ke</h2><div class="world-travel">${cityLinks}</div><label class="world-toggle"><input type="checkbox" data-transport ${save.world.transportEnabled ? 'checked' : ''}> Hitung energi perjalanan</label><label class="world-select">Transportasi<select data-transport-mode><option value="walk">Jalan kaki</option><option value="angkot">Angkot</option><option value="motor">Motor</option></select></label><p class="muted">Perjalanan opsional; tidak ada timer atau gerak paksa.</p></aside></div>
    <section class="panel world-objects"><h2>${mall ? 'Gerai, kafe, dan fasilitas mal' : place === 'workplace' && scene ? 'Objek kerja interaktif' : 'Lokasi kota'}</h2><p class="muted">${esc(scene ? `NPC: ${(scene.npcs||[]).map(npc=>npc.name).join(', ') || 'rekan kerja'}. Jam ramai: ${(scene.busyHours||[]).join(', ') || 'fleksibel'}.` : 'Pilih lokasi dari menu Pergi ke. Daftar berikut bisa digunakan dengan keyboard.')}</p><div class="world-object-list">${activeItems || '<p>Belum ada objek di lokasi ini.</p>'}</div></section>
    ${taskMarkup}<footer class="world-footer"><span>Lokasi: ${esc(place)} · Lokasi dikunjungi: ${(save.world.visited||[]).map(esc).join(', ')}</span><button type="button" data-world-close>Kembali ke Careerverse</button></footer></section>`;
  overlay.querySelectorAll('[data-world-close]').forEach(button => button.onclick = closeWorld);
  overlay.querySelectorAll('[data-travel]').forEach(button => button.onclick = () => {
    const current = loadSave(); current.world ||= {}; current.world.transportEnabled = Boolean(overlay.querySelector('[data-transport]').checked);
    const result = moveWorld(current, button.dataset.travel, overlay.querySelector('[data-transport-mode]').value);
    if (button.dataset.travel === 'workplace' && !current.employed) { renderWorld(overlay, current, worldData, profession, company, null, null, 'Terima tawaran pekerjaan terlebih dahulu agar dapat mengunjungi tempat kerja.'); return; }
    saveGame(current); renderWorld(overlay, current, worldData, profession, company, null, null, result.ok ? `Tiba di ${button.textContent.trim()} · perjalanan ${result.minutes} menit simulasi.` : 'Tujuan tidak ditemukan.');
  });
  overlay.querySelectorAll('[data-object]').forEach(button => button.onclick = () => {
    const item = objects[Number(button.dataset.object)];
    if (!item?.task) return;
    renderWorld(overlay, loadSave(), worldData, profession, company, item.task, item, `Kamu berinteraksi dengan ${item.name}.`);
  });
  overlay.querySelectorAll('[data-mall]').forEach(button => button.onclick = () => {
    const current = loadSave(); const result = visitMall(current, button.dataset.mall);
    if (result.ok) { current.world.currentPlace = 'mall'; current.world.lastInteraction = result.dialogue; saveGame(current); renderWorld(overlay,current,worldData,profession,company,null,null,`${result.dialogue}. Energi ${current.energy}, stres ${current.stress}${result.place.skill ? `, skill ${current.skill}` : ''}.`); }
    else renderWorld(overlay,current,worldData,profession,company,null,null,result.reason);
  });
  overlay.querySelector('[data-world-back]')?.addEventListener('click', () => renderWorld(overlay,loadSave(),worldData,profession,company));
  overlay.querySelectorAll('[data-task-choice]').forEach(button => button.onclick = () => {
    const current = loadSave(); const result = applyWorldTask(current, activeTask, Number(button.dataset.taskChoice));
    if (!result.ok) return;
    current.world.currentPlace = 'workplace'; saveGame(current);
    renderWorld(overlay,current,worldData,profession,company,null,null,`Tugas selesai dengan skor ${result.score}/100. ${activeTask.options[Number(button.dataset.taskChoice)].feedback || ''}`);
  });
  overlay.querySelector('[data-transport]')?.addEventListener('change', event => { const current=loadSave(); current.world.transportEnabled=event.target.checked; saveGame(current); });
  overlay.querySelector('#world-title')?.focus();
}
launchButton();
