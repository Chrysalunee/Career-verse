import { createState, loadGame, saveGame, acceptanceChance, evaluateTask, salaryFor, clamp } from './engine.js';
import { render } from './ui.js';

const app = document.querySelector('#app');
let state = loadGame();
let professions = [];
let companies = [];
let screen = state.screen || 'home';
let taskIndex = 0;
let currentTask = null;

async function loadData() {
  const professionIds = ['digital-marketer','programmer','guru','perawat','chef'];
  const companyIds = ['kopi-kilat','nusa-global','kreasi-bersama','kodeku-labs','sma-nusa-bangsa','rs-harapan-sehat','klinik-sehat-bersama','restoran-rasa-nusantara','bistro-senja'];
  const read = async path => { const r = await fetch(path); if (!r.ok) throw new Error(`Tidak bisa memuat ${path}`); return r.json(); };
  [professions, companies] = await Promise.all([Promise.all(professionIds.map(id => read(`data/professions/${id}.json`))), Promise.all(companyIds.map(id => read(`data/companies/${id}.json`)))]);
  start();
}
function persist() { state.screen = screen; saveGame(state); const status=document.querySelector('#save-status'); if(status) status.textContent='Progres tersimpan otomatis'; }
function selectedProfession() { return professions.find(p=>p.id===state.professionId); }
function selectedCompany() { return companies.find(c=>c.id===state.companyId); }
function show(view) { screen=view; persist(); start(); }
function start() {
  if (!professions.length) return;
  if (state.employed && screen === 'home') screen='work';
  render(app, {screen,state,professions,companies,profession:selectedProfession(),company:selectedCompany(),currentTask,taskIndex,callbacks:{chooseProfession,chooseCompany,apply,answerTask,beginDay,goJobs,showHistory,negotiate,quit}});
}
function chooseProfession(id) { state.professionId=id; screen='jobs'; persist(); start(); }
function chooseCompany(id) { state.companyId=id; screen='company'; persist(); start(); }
function apply() { const p=selectedProfession(), c=selectedCompany(); const chance=acceptanceChance(state,c,p); state.lastChance=chance; screen='interview'; persist(); start(); }
function answerInterview(answer) {
  const score=answer==='good'?12:answer==='neutral'?2:-8;
  const chance=clamp(state.lastChance+score,5,98); state.lastChance=chance;
  state.interviewAnswered=true; state.interviewFeedback=answer==='good'?'Jawaban yang jelas dan jujur membantu pewawancara memahami cara kerjamu.':'Pewawancara ingin mendengar contoh spesifik dan cara kamu belajar dari pengalaman.';
  if (Math.random()*100 < chance) {
    state.offer=true; const c=selectedCompany(); const p=selectedProfession(); state.offeredSalary=salaryFor(c.salary[0],state.levelIndex||0,1.08); state.offeredSalary=Math.min(state.offeredSalary,c.salary[1]); state.professionName=p.name;
  } else state.offer=false;
  screen='result'; persist(); start();
}
function acceptOffer() {
  state.employed=true; state.money=state.money||0; state.stress=state.stress||12; state.energy=state.energy||90; state.reputation=state.reputation||10; state.internal=state.internal||10; state.skill=state.skill||1; state.day=state.day||1; state.salary=state.offeredSalary; state.level=selectedProfession().careerLadder[0]; state.history=state.history||[];
  state.history.push({company:selectedCompany().name,role:state.level,day:state.day,note:'Memulai pekerjaan baru'}); screen='work'; persist(); start();
}
function negotiate() { const cap=selectedCompany().salary[1]; const requested=Math.round(state.offeredSalary*1.08); if(requested<=cap && Math.random()<.65){state.salary=requested;state.offeredSalary=requested;state.negotiation='Negosiasi berhasil. Kompensasi baru disepakati.';}else{state.negotiation='Perusahaan belum dapat menyetujui angka tersebut. Tawaran awal tetap tersedia.';} screen='result';persist();start(); }
function beginDay() {
  const p=selectedProfession(); if(!p) return;
  currentTask=p.tasks[taskIndex%p.tasks.length]; taskIndex++;
  screen='task'; persist(); start();
}
function answerTask(index) {
  const option=currentTask.options[index]; const result=evaluateTask(option.score,state); state.energy=clamp(state.energy+result.energy,0,100); state.stress=clamp(state.stress+result.stress,0,100); state.reputation=clamp(state.reputation+result.rep,0,100); state.internal=clamp(state.internal+result.internal,0,100); state.skill=clamp(state.skill+(option.score>=75?0.12:0.04),1,10); state.satisfaction=clamp((state.satisfaction||55)+(option.score>=70?4:-2),0,100); state.money+=Math.round((state.salary/22)*0.15); state.day++; state.tasksDone=(state.tasksDone||0)+1;
  const p=selectedProfession(); state.lastResult={title:currentTask.title,feedback:option.feedback,score:option.score,info:p.realWorld};
  if(state.day%5===0){state.money+=state.salary;state.review=option.score>=70?'Review mingguan: kontribusimu konsisten. Bicarakan hasil dan prioritas berikutnya dengan atasan.':'Review mingguan: pilih satu area untuk ditingkatkan dan minta dukungan yang spesifik.'; if(option.score>=70)state.internal=clamp(state.internal+3,0,100);}
  if(state.tasksDone%3===0){const event=p.events[Math.floor(Math.random()*p.events.length)]; state.randomEvent=event;state.stress=clamp(state.stress+4,0,100);} else state.randomEvent=null;
  const eligible=(state.internal>=70 && state.skill>=3 && (state.tasksDone||0)>=8);
  if(eligible){const ladder=p.careerLadder;const i=ladder.indexOf(state.level);if(i>=0&&i<ladder.length-1){state.promotion=ladder[i+1];}}
  screen='resultTask';persist();start();
}
function promote() { if(!state.promotion)return; state.level=state.promotion;state.promotion=null;state.salary=Math.round(state.salary*1.15);state.internal=45;state.history.push({company:selectedCompany().name,role:state.level,day:state.day,note:'Promosi dan kenaikan gaji'});persist();start(); }
function goJobs(){state.employed=false;state.offer=false;state.companyId=null;screen='jobs';persist();start();}
function showHistory(){screen='history';start();}
function quit(){state.employed=false;state.history.push({company:selectedCompany()?.name||'Pekerjaan terakhir',role:state.level,day:state.day,note:'Mengundurkan diri dengan pemberitahuan'});screen='home';persist();start();}

document.querySelector('#export-save').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='karier-nyata-save.json';a.click();URL.revokeObjectURL(a.href);});
document.querySelector('#import-save').addEventListener('change',async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!data||typeof data!=='object')throw new Error();state={...createState(),...data};screen=state.screen||'home';persist();start();}catch{alert('File save tidak valid.');}});
document.querySelector('#reset-game').addEventListener('click',()=>{if(confirm('Hapus progres lokal dan mulai ulang?')){state=createState();screen='home';taskIndex=0;currentTask=null;persist();start();}});
loadData().catch(error=>{app.innerHTML=`<section class="panel"><h1>Belum dapat memuat game</h1><p>${error.message}</p><p>Jalankan melalui server lokal, misalnya <code>python3 -m http.server</code>, lalu buka http://localhost:8000. Browser biasanya membatasi pembacaan JSON saat file dibuka langsung.</p></section>`;});

function answerTask(index){ /* didefinisikan ulang di bawah untuk menjaga alur mini-game */ }
