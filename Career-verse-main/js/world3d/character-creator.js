import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const KEY = 'career-verse-save';
const defaults = {
  name: 'Alex', presentation: 'Feminine', age: 24, height: 168, body: 'Average',
  skin: '#c98f70', face: 'Oval', eyes: '#594235', brows: 'Natural',
  hair: 'Long layers', hairColor: '#30251f', outfit: 'Smart casual',
  outfitColor: '#a86f79', shoes: 'Sneakers', glasses: 'None',
  personality: 'Creative', expression: 'Happy'
};
const choices = {
  presentation: ['Feminine','Masculine','Androgynous'],
  body: ['Slim','Average','Athletic','Curvy'],
  skin: ['#f4d6bd','#e8b998','#c98f70','#9b6348','#70452f'],
  face: ['Oval','Round','Heart','Square','Diamond'],
  eyes: ['#594235','#273e50','#66845d','#7893a8','#342d2b'],
  brows: ['Soft','Natural','Defined'],
  hair: ['Short crop','Bob','Medium waves','Long layers','Curly','Ponytail','Bun'],
  hairColor: ['#201b1a','#493026','#79513a','#b77b42','#d8b47b','#9a9691','#5c3c57'],
  outfit: ['Casual','Formal','Office','Streetwear','Korean minimal','Sportwear','Party','Sleepwear'],
  outfitColor: ['#a86f79','#435b70','#b7a58d','#667b68','#d18c72','#4b414d','#eee8dc','#272d35'],
  shoes: ['Sneakers','Loafers','Boots','Heels','Sport shoes'],
  glasses: ['None','Round glasses','Square glasses'],
  personality: ['Friendly','Introvert','Extrovert','Ambitious','Creative','Professional','Adventurous','Independent'],
  expression: ['Happy','Neutral','Surprised','Confident']
};
const labels = {
  presentation:'Gender presentation',body:'Bentuk tubuh',skin:'Warna kulit',face:'Bentuk wajah',eyes:'Warna mata',
  brows:'Bentuk alis',hair:'Gaya rambut',hairColor:'Warna rambut',outfit:'Gaya pakaian',
  outfitColor:'Warna pakaian',shoes:'Sepatu',glasses:'Kacamata',personality:'Kepribadian',expression:'Ekspresi'
};
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readSave(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function writeSave(save){try{localStorage.setItem(KEY,JSON.stringify(save));return true}catch{return false}}

export async function openCharacterCreator(existing = null) {
  const current = {...defaults,...(existing||{})};
  const overlay=document.createElement('section');
  overlay.className='cv-character-creator';
  overlay.innerHTML=`
    <style>
      .cv-character-creator{position:fixed;inset:0;z-index:100000;background:#e9e5df;color:#29343b;font:15px/1.45 Inter,system-ui,sans-serif;display:grid;grid-template-rows:auto 1fr auto;overflow:hidden}
      .cvcc-head{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:#f8f6f1;border-bottom:1px solid #d8d2c8}
      .cvcc-head strong{letter-spacing:.13em;font-size:14px}.cvcc-head span{font-size:13px;color:#65717a}
      .cvcc-main{min-height:0;display:grid;grid-template-columns:minmax(210px,260px) minmax(280px,1fr) minmax(220px,280px);gap:16px;padding:16px;overflow:auto}
      .cvcc-panel{background:#f8f6f1;border:1px solid #d9d4ca;border-radius:16px;padding:16px;overflow:auto}
      .cvcc-panel h3{font-size:16px;margin:0 0 12px}.cvcc-tabs{display:grid;gap:7px}
      .cvcc-tab,.cvcc-option,.cvcc-action{border:1px solid #d8d2c8;background:#fffefa;color:#34424a;border-radius:10px;padding:11px 12px;text-align:left;font:600 14px/1.3 system-ui,sans-serif;cursor:pointer}
      .cvcc-tab[aria-selected=true],.cvcc-option[aria-pressed=true]{background:#e6edf0;border-color:#718b99;color:#263c49}
      .cvcc-preview{position:relative;min-height:480px;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 50% 36%,#fffdf8 0,#dce2e2 58%,#aeb9bd 100%);border:1px solid #d9d4ca}
      .cvcc-preview canvas{display:block;width:100%;height:100%;min-height:480px;touch-action:none}
      .cvcc-preview-note{position:absolute;left:16px;bottom:14px;background:#f8f6f1e8;border-radius:9px;padding:8px 11px;font-size:12px;color:#53616a}
      .cvcc-field{display:grid;gap:6px;margin:0 0 13px}.cvcc-field label{font-size:13px;font-weight:700;color:#4c5961}
      .cvcc-field input,.cvcc-field select{width:100%;min-height:42px;border:1px solid #d2ccc2;border-radius:9px;background:#fffefa;color:#28343b;padding:9px 10px;font:500 14px system-ui,sans-serif}
      .cvcc-color-options{display:flex;gap:9px;flex-wrap:wrap}.cvcc-swatch{width:34px;height:34px;border-radius:50%;border:2px solid #fff;outline:1px solid #c6c0b6;cursor:pointer}.cvcc-swatch[aria-pressed=true]{outline:3px solid #516d7b}
      .cvcc-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 22px;background:#f8f6f1;border-top:1px solid #d8d2c8}
      .cvcc-footer small{color:#66727a}.cvcc-actions{display:flex;gap:9px;flex-wrap:wrap}.cvcc-action{padding:12px 18px;text-align:center}.cvcc-action.primary{background:#344d5b;color:white;border-color:#344d5b}
      @media(max-width:850px){.cvcc-main{grid-template-columns:1fr 1fr}.cvcc-preview{grid-column:1/-1;grid-row:1;min-height:360px}.cvcc-preview canvas{min-height:360px}.cvcc-panel{min-height:250px}}
      @media(max-width:560px){.cvcc-head{padding:12px 14px}.cvcc-head span{display:none}.cvcc-main{grid-template-columns:1fr;padding:10px;gap:10px}.cvcc-preview{grid-column:auto;grid-row:auto;min-height:330px}.cvcc-preview canvas{min-height:330px}.cvcc-panel{max-height:none}.cvcc-footer{padding:10px;align-items:stretch;flex-direction:column}.cvcc-actions{display:grid;grid-template-columns:1fr 1fr}.cvcc-action{padding:11px 8px}}
    </style>
    <header class="cvcc-head"><div><strong>CAREER-VERSE</strong><div style="font-size:13px;color:#66727a">CHARACTER STUDIO</div></div><span>Rancang karakter yang akan menjalani ceritamu</span></header>
    <main class="cvcc-main">
      <aside class="cvcc-panel"><h3>Kategori karakter</h3><div class="cvcc-tabs" role="tablist">
        <button class="cvcc-tab" data-category="identity" aria-selected="true">Identitas</button>
        <button class="cvcc-tab" data-category="face">Wajah & detail</button>
        <button class="cvcc-tab" data-category="hair">Rambut</button>
        <button class="cvcc-tab" data-category="fashion">Fashion</button>
        <button class="cvcc-tab" data-category="personality">Kepribadian</button>
      </div></aside>
      <section class="cvcc-preview"><canvas aria-label="Preview karakter 3D"></canvas><div class="cvcc-preview-note">Geser untuk memutar · Scroll untuk zoom</div></section>
      <aside class="cvcc-panel"><h3 class="cvcc-options-title">Identitas karakter</h3><div class="cvcc-options"></div></aside>
    </main>
    <footer class="cvcc-footer"><small>Preview 3D diperbarui langsung saat pilihan diubah.</small><div class="cvcc-actions">
      <button class="cvcc-action" data-action="reset">Reset</button><button class="cvcc-action" data-action="random">Acak</button><button class="cvcc-action primary" data-action="save">Simpan & masuk game</button>
    </div></footer>`;
  document.body.append(overlay);
  const canvas=overlay.querySelector('canvas'),optionHost=overlay.querySelector('.cvcc-options'),title=overlay.querySelector('.cvcc-options-title');
  let category='identity',drag=false,lastX=0,yaw=.25,zoom=5.8,resolvePromise;
  const result=new Promise(resolve=>resolvePromise=resolve);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#dce2e2');
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,2.25,zoom);camera.lookAt(0,1.15,0);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  scene.add(new THREE.HemisphereLight('#ffffff','#8c8175',2));
  const key=new THREE.DirectionalLight('#fff1dc',3.2);key.position.set(-3,6,5);scene.add(key);
  const fill=new THREE.DirectionalLight('#d7e5ef',1.3);fill.position.set(4,3,-4);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.3,48),new THREE.MeshStandardMaterial({color:'#c5c4bd',roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
  const avatar=new THREE.Group();scene.add(avatar);
  const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  function part(parent,geometry,color,x,y,z,scale=null){const mesh=new THREE.Mesh(geometry,mat(color));mesh.position.set(x,y,z);if(scale)mesh.scale.set(...scale);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
  function rebuild(){
    avatar.clear();
    const add=(geo,color,x,y,z,scale=null)=>{const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;avatar.add(m);return m};
    const line=(a,b,r1,r2,color)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);const m=add(new THREE.CylinderGeometry(r2,r1,d.length(),18,1),color,...p.clone().add(q).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m};
    const skin=current.skin, hair=current.hairColor, cloth=current.outfitColor;
    // Tailored torso silhouette instead of a capsule-shaped body.
    const profile=[new THREE.Vector2(.13,0),new THREE.Vector2(.16,.1),new THREE.Vector2(.19,.27),new THREE.Vector2(.25,.48),new THREE.Vector2(.31,.69),new THREE.Vector2(.3,.82),new THREE.Vector2(.15,.88),new THREE.Vector2(.11,.9)];
    const torso=add(new THREE.LatheGeometry(profile,40),cloth,0,.91,0);
    torso.scale.set(current.body==='Athletic'?1.08:current.body==='Curvy'?1.13:current.body==='Slim'?.9:1,1,.78);
    line([0,1.78,0],[0,1.94,0],.085,.08,skin);
    // Head, jaw and cheeks.
    add(new THREE.SphereGeometry(.245,40,32),skin,0,2.12,0,current.face==='Round'?[1,1.08,.94]:current.face==='Square'?[1.04,1,.94]:current.face==='Heart'?[.9,1.1,.92]:[.92,1.12,.92]);
    add(new THREE.SphereGeometry(.17,28,20),skin,0,2.0,.035,[.88,.62,.84]);
    for(const side of [-1,1]){
      add(new THREE.SphereGeometry(.05,20,16),skin,side*.22,2.1,.015,[.8,1,.8]);
      // Eyes with whites, iris, pupils and brows.
      add(new THREE.SphereGeometry(.055,24,18),'#795c4b',side*.09,2.145,.194,[1.15,.8,.45]);
      add(new THREE.SphereGeometry(.044,24,18),'#f7f2e9',side*.09,2.145,.218,[1.1,.9,.55]);
      add(new THREE.SphereGeometry(.025,20,16),current.eyes,side*.09,2.144,.246,[.9,1,.5]);
      add(new THREE.SphereGeometry(.011,16,12),'#17191c',side*.09,2.144,.257);
      const brow=add(new THREE.TorusGeometry(.052,.008,8,24,Math.PI),hair,side*.09,2.205,.2);brow.rotation.z=side*.08;
      // Nose bridge and tip.
      add(new THREE.SphereGeometry(.03,18,14),skin,0,2.09,.224,[.72,1.35,.72]);
      add(new THREE.SphereGeometry(.042,18,14),skin,0,2.045,.25,[.9,.72,.8]);
      // Ears.
      add(new THREE.SphereGeometry(.045,18,14),skin,side*.25,2.1,0,[.72,1.15,.8]);
      // Separate arms, forearms and hands.
      line([side*.25,1.58,0],[side*.34,1.23,.005],.1,.082,cloth);
      line([side*.34,1.23,.005],[side*.37,.98,.025],.072,.05,skin);
      add(new THREE.SphereGeometry(.062,18,14),skin,side*.37,.93,.045,[.8,1,.7]);
      for(let finger=0;finger<4;finger++)line([side*(.335+finger*.021),.9,.075],[side*(.335+finger*.021),.84,.08],.011,.008,skin);
      // Legs and shoes.
      line([side*.105,.94,0],[side*.11,.49,0],.105,.075,'#34414a');
      line([side*.11,.49,0],[side*.11,.13,.035],.073,.052,'#34414a');
      add(new THREE.SphereGeometry(.1,20,14),'#25292d',side*.11,.08,.09,[.85,.5,1.5]);
      add(new THREE.BoxGeometry(.17,.025,.26),'#d4cbbb',side*.11,.035,.08);
    }
    // Mouth and subtle expression.
    add(new THREE.SphereGeometry(.043,20,12),current.expression==='Happy'?'#b86b68':'#995d5a',0,1.985,.222,[1,.25,.5]);
    // Hair cap plus curved side locks and back volume.
    add(new THREE.SphereGeometry(.255,36,28,0,Math.PI*2,0,Math.PI*.64),hair,0,2.245,-.025,[1.02,1,.98]);
    const hairStyle=current.hair||'Long layers';
    for(const side of [-1,1]){
      const length=hairStyle==='Short crop'?.17:hairStyle==='Bob'?.38:hairStyle==='Ponytail'?.5:.68;
      const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.17,2.31,.08),new THREE.Vector3(side*.23,2.19,.07),new THREE.Vector3(side*.245,2.02,.02),new THREE.Vector3(side*.22,1.98-length*.45,-.015),new THREE.Vector3(side*.18,1.92-length*.5,-.04)]);
      add(new THREE.TubeGeometry(curve,22,.052,10,false),hair,0,0,0);
    }
    if(['Long layers','Medium waves','Curly','Ponytail'].includes(hairStyle)){
      const back=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.25,-.17),new THREE.Vector3(0,1.95,-.2),new THREE.Vector3(.02,1.55,-.19),new THREE.Vector3(.03,1.3,-.16)]);
      add(new THREE.TubeGeometry(back,24,.085,12,false),hair,0,0,0);
    }
    if(hairStyle==='Bun')add(new THREE.SphereGeometry(.105,20,16),hair,0,2.42,-.16);
    if(current.glasses!=='None')for(const side of [-1,1]){const ring=add(new THREE.TorusGeometry(.075,.012,8,24),'#343a40',side*.09,2.145,.255);ring.scale.set(1,.85,1)}
    avatar.scale.y=Number(current.height)/168;
    avatar.rotation.y=yaw;
  }
  function field(key){
    const label=labels[key]||key;
    if(key==='name'||key==='age'||key==='height'){
      const type=key==='name'?'text':'number',min=key==='age'?18:key==='height'?140:undefined,max=key==='age'?70:key==='height'?205:undefined;
      return `<div class="cvcc-field"><label for="cvcc-${key}">${label}</label><input id="cvcc-${key}" data-key="${key}" type="${type}" value="${esc(current[key])}" ${min? `min="${min}" max="${max}"`:''}></div>`;
    }
    if(key==='skin'||key==='eyes'||key==='hairColor'||key==='outfitColor'){
      return `<div class="cvcc-field"><label>${label}</label><div class="cvcc-color-options">${choices[key].map(c=>`<button type="button" class="cvcc-swatch" data-key="${key}" data-value="${c}" aria-label="${c}" aria-pressed="${current[key]===c}" style="background:${c}"></button>`).join('')}</div></div>`;
    }
    return `<div class="cvcc-field"><label for="cvcc-${key}">${label}</label><select id="cvcc-${key}" data-key="${key}">${choices[key].map(v=>`<option ${current[key]===v?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`;
  }
  const groups={
    identity:['name','presentation','age','height','body'],
    face:['face','skin','eyes','brows','expression'],
    hair:['hair','hairColor'],
    fashion:['outfit','outfitColor','shoes','glasses'],
    personality:['personality']
  };
  const names={identity:'Identitas karakter',face:'Wajah & detail',hair:'Rambut',fashion:'Fashion & wardrobe',personality:'Kepribadian'};
  function renderOptions(){title.textContent=names[category];optionHost.innerHTML=groups[category].map(field).join('')}
  overlay.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;overlay.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));renderOptions()}));
  optionHost.addEventListener('input',event=>{const el=event.target;if(!el.dataset.key)return;current[el.dataset.key]=el.type==='number'?Number(el.value):el.value;rebuild()});
  optionHost.addEventListener('change',event=>{const el=event.target;if(el.dataset.key){current[el.dataset.key]=el.type==='number'?Number(el.value):el.value;rebuild()}});
  optionHost.addEventListener('click',event=>{const b=event.target.closest('[data-value]');if(!b)return;current[b.dataset.key]=b.dataset.value;renderOptions();rebuild()});
  overlay.querySelector('[data-action="reset"]').addEventListener('click',()=>{Object.assign(current,defaults);renderOptions();rebuild()});
  overlay.querySelector('[data-action="random"]').addEventListener('click',()=>{for(const [key,values] of Object.entries(choices))current[key]=values[Math.floor(Math.random()*values.length)];current.name=current.name||'Alex';renderOptions();rebuild()});
  overlay.querySelector('[data-action="save"]').addEventListener('click',()=>{const name=String(current.name||'').trim();if(!name){const input=overlay.querySelector('[data-key="name"]');input?.focus();return}const save=readSave();save.character={...current,name};if(!writeSave(save)){alert('Penyimpanan browser tidak tersedia. Aktifkan penyimpanan lokal untuk menyimpan karakter.');return}cleanup();resolvePromise(save.character)});
  function down(e){drag=true;lastX=e.clientX;canvas.setPointerCapture?.(e.pointerId)}
  function move(e){if(!drag)return;yaw+=(e.clientX-lastX)*.012;lastX=e.clientX;rebuild()}
  function up(){drag=false}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(4,Math.min(8,zoom+e.deltaY*.004));camera.position.z=zoom},{passive:false});
  let raf=0,alive=true;
  function resize(){const w=canvas.clientWidth||640,h=canvas.clientHeight||480;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();renderOptions();rebuild();
  function animate(t){if(!alive)return;avatar.position.y=Math.sin(t*.0014)*.012;renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  raf=requestAnimationFrame(animate);
  function cleanup(){alive=false;cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);renderer.dispose();overlay.remove()}
  return result;
}
