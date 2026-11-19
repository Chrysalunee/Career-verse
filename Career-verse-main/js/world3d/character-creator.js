import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const KEY = 'career-verse-save';
const defaults = {
  name: 'Alex', presentation: 'Feminine', age: 24, height: 168, body: 'Average',
  skin: '#c98f70', face: 'Oval', eyes: '#594235', brows: 'Natural',
  hair: 'Long layers', hairColor: '#30251f', outfit: 'Casual',
  outfitColor: '#a86f79', shoes: 'Sneakers', glasses: 'None',
  personality: 'Creative', expression: 'Happy'
};
const choices = {
  presentation: ['Feminine','Masculine'],
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
  presentation:'Jenis kelamin karakter',body:'Bentuk tubuh',skin:'Warna kulit',face:'Bentuk wajah',eyes:'Warna mata',
  brows:'Bentuk alis',hair:'Gaya rambut',hairColor:'Warna rambut',outfit:'Gaya pakaian',
  outfitColor:'Warna pakaian',shoes:'Sepatu',glasses:'Kacamata',personality:'Kepribadian',expression:'Ekspresi'
};
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readSave(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function writeSave(save){try{localStorage.setItem(KEY,JSON.stringify(save));return true}catch{return false}}

export async function openCharacterCreator(existing = null) {
  const current = {...defaults,...(existing||{})};
  if (!['Feminine','Masculine'].includes(current.presentation)) current.presentation = 'Feminine';
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
      .cvcc-view-controls{position:absolute;right:12px;top:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:70%}
      .cvcc-view-controls button{border:1px solid #c9c6bf;background:#fffdf8ef;color:#34424a;border-radius:8px;padding:7px 10px;font:600 12px system-ui;cursor:pointer}
      .cvcc-view-controls button:hover,.cvcc-view-controls button:focus-visible{background:#e6edf0;outline:2px solid #718b99}
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
      <section class="cvcc-preview"><canvas aria-label="Preview karakter 3D"></canvas><nav class="cvcc-view-controls" aria-label="Sudut pandang karakter"><button type="button" data-view="front">Depan</button><button type="button" data-view="side">Samping</button><button type="button" data-view="back">Belakang</button><button type="button" data-view="zoom-in" aria-label="Perbesar">+</button><button type="button" data-view="zoom-out" aria-label="Perkecil">−</button></nav><div class="cvcc-preview-note">Geser untuk memutar · Scroll untuk zoom</div></section>
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
    const add=(geo,color,x,y,z,scale=null,roughness=.72)=>{
      const material=new THREE.MeshStandardMaterial({color,roughness,metalness:0});
      const mesh=new THREE.Mesh(geo,material);
      mesh.position.set(x,y,z);
      if(scale) mesh.scale.set(...scale);
      mesh.castShadow=true; mesh.receiveShadow=true; avatar.add(mesh); return mesh;
    };
    const segment=(a,b,rTop,rBottom,color,radial=24)=>{
      const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);
      const mesh=add(new THREE.CylinderGeometry(rTop,rBottom,d.length(),radial,2),color,...p.clone().add(q).multiplyScalar(.5).toArray());
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
      return mesh;
    };
    const skin=current.skin, hair=current.hairColor, cloth=current.outfitColor;
    const feminine=current.presentation==='Feminine';
    const slim=current.body==='Slim', athletic=current.body==='Athletic', curvy=current.body==='Curvy';
    const shoulder=feminine?.285:.385, waist=feminine?.205:.285, hip=feminine?(curvy?.35:.315):(curvy?.30:.275);
    // Layered tailored torso: shoulders, waist and hips have distinct human proportions.
    const torsoProfile=[
      new THREE.Vector2(hip*.78,0),new THREE.Vector2(hip,.08),new THREE.Vector2(hip*.96,.22),
      new THREE.Vector2(waist,.42),new THREE.Vector2(waist*1.04,.52),
      new THREE.Vector2(shoulder*.92,.70),new THREE.Vector2(shoulder,.79),
      new THREE.Vector2(shoulder*.72,.84),new THREE.Vector2(.105,.86)
    ];
    const torso=add(new THREE.LatheGeometry(torsoProfile,48),cloth,0,.94,0);
    torso.scale.set(slim?.92:1,1,.76);
    // Neck and collar.
    segment([0,1.72,0],[0,1.91,0],feminine?.075:.09,feminine?.082:.095,skin);
    add(new THREE.TorusGeometry(.105,.018,10,36),feminine?'#eee5dc':'#d9dfe1',0,1.77,.006).rotation.x=Math.PI/2;
    // Head sculpted from a tapered profile, not a sphere.
    const faceScale=current.face==='Round'?[1.04,1.03,.94]:current.face==='Square'?[1.02,1,.96]:current.face==='Heart'?[.94,1.05,.94]:current.face==='Diamond'?[.92,1.05,.94]:[.96,1.08,.94];
    const headProfile=[
      new THREE.Vector2(.035,-.245),new THREE.Vector2(.095,-.225),new THREE.Vector2(.155,-.17),
      new THREE.Vector2(.205,-.075),new THREE.Vector2(.218,.045),new THREE.Vector2(.202,.155),
      new THREE.Vector2(.15,.225),new THREE.Vector2(.075,.255),new THREE.Vector2(0,.26)
    ];
    const genderFaceScale=feminine?faceScale:[faceScale[0]*1.08,faceScale[1]*.98,faceScale[2]*1.02];
    const head=add(new THREE.LatheGeometry(headProfile,56),skin,0,2.13,0,genderFaceScale);
    // Cheek volume and ears.
    for(const side of [-1,1]){
      add(new THREE.SphereGeometry(feminine?.052:.045,28,20),skin,side*.145,2.055,.105,[.92,.62,.42]);
      add(new THREE.SphereGeometry(.031,24,18),skin,side*.214,2.105,0,[.72,1.05,.62]);
      add(new THREE.SphereGeometry(.021,18,14),'#b97869',side*.226,2.105,.018,[.7,1,.5]);
    }
    // Eyes with iris, pupil, catchlight and shaped upper lids.
    const eyeColor=current.eyes;
    for(const side of [-1,1]){
      add(new THREE.SphereGeometry(feminine?.051:.046,32,24),'#f8f4ed',side*.087,2.157,.183,[1.12,.72,.46]);
      add(new THREE.SphereGeometry(.026,28,20),eyeColor,side*.087,2.157,.211,[.9,1,.44]);
      add(new THREE.SphereGeometry(.012,22,16),'#17191b',side*.087,2.157,.225,[.9,1,.44]);
      add(new THREE.SphereGeometry(.009,16,12),'#ffffff',side*.077,2.17,.247);
      const lid=add(new THREE.TorusGeometry(.061,.009,8,28,Math.PI),hair,side*.087,2.17,.197);
      lid.rotation.z=Math.PI;
      const brow=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(side*.035,2.235,.176),new THREE.Vector3(side*.09,2.25,.184),new THREE.Vector3(side*.145,2.23,.17)
      ),16,feminine?.009:.014,8,false),current.brows==='Soft'?'#76594b':hair,0,0,0);
      // Nose bridge, tip and nostril definition.
      add(new THREE.SphereGeometry(feminine?.027:.031,24,18),skin,0,2.095,.205,[.68,1.75,.7]);
      add(new THREE.SphereGeometry(.031,24,18),skin,0,2.045,.218,[.95,.62,.72]);
      for(const n of [-1,1]) add(new THREE.SphereGeometry(.009,12,10),'#9b6857',n*.022,2.035,.236);
      // Arms with shoulder, elbow and wrist transitions.
      segment([side*(feminine?.255:.29),1.61,0],[side*(feminine?.34:.37),1.34,.005],feminine?.095:.108,feminine?.078:.09,cloth);
      add(new THREE.SphereGeometry(.078,22,16),cloth,side*.34,1.34,.005,[.9,1,.9]);
      segment([side*(feminine?.34:.37),1.31,.005],[side*(feminine?.375:.405),1.02,.035],feminine?.071:.078,feminine?.048:.052,skin);
      add(new THREE.SphereGeometry(.052,20,16),skin,side*.38,.97,.045,[.85,1.2,.65]);
      for(let finger=0;finger<4;finger++){
        const fx=side*(.351+finger*.019);
        segment([fx,.95,.07],[fx,.875,.085],.011,.007,skin,12);
      }
      segment([side*.105,.98,0],[side*.112,.53,0],.105,.078,'#343a40');
      segment([side*.112,.53,0],[side*.115,.14,.015],.075,.052,'#343a40');
      add(new THREE.SphereGeometry(.095,24,16),'#262b30',side*.115,.085,.095,[.88,.48,1.45]);
      add(new THREE.BoxGeometry(.18,.022,.25),'#d6cbbc',side*.115,.035,.085);
    }
    // Lips with cupid bow and a soft smile line.
    const lipColor=feminine?'#a95f65':'#89564f';
    add(new THREE.SphereGeometry(feminine?.039:.032,24,16),lipColor,0,1.985,.205,[1.2,.38,.55]);
    add(new THREE.SphereGeometry(feminine?.032:.026,24,16),feminine?'#bd7778':'#965f58',0,1.966,.202,[1.05,.28,.5]);
    // Hair cap and multiple curved locks; silhouette varies by chosen style.
    add(new THREE.SphereGeometry(.235,48,36,0,Math.PI*2,0,Math.PI*.58),hair,0,2.285,-.035,[1.04,.94,1.02]);
    const style=current.hair||'Long layers';
    const long=['Long layers','Medium waves','Curly','Ponytail'].includes(style);
    const bob=style==='Bob';
    for(const side of [-1,1]){
      const fringe=style==='Short crop'?.08:bob?.32:long?.62:.42;
      const points=[
        new THREE.Vector3(side*.13,2.40,.045),
        new THREE.Vector3(side*.205,2.29,.105),
        new THREE.Vector3(side*.235,2.13,.105),
        new THREE.Vector3(side*.225,2.00-fringe*.45,.055),
        new THREE.Vector3(side*.19,1.93-fringe*.45,-.015)
      ];
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.045,12,false),hair,0,0,0);
      if(long){
        for(let strand=0;strand<3;strand++){
          const x=side*(.16+strand*.035);
          const curve=new THREE.CatmullRomCurve3([
            new THREE.Vector3(x,2.29,-.12),new THREE.Vector3(x+side*.025,2.03,-.17),
            new THREE.Vector3(x+side*.012,1.72,-.16),new THREE.Vector3(x-side*.015,1.38,-.12)
          ]);
          add(new THREE.TubeGeometry(curve,28,.018,8,false),hair,0,0,0);
        }
      }
    }
    if(long||bob){
      const backCurve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(-.17,2.30,-.13),new THREE.Vector3(-.20,1.98,-.19),
        new THREE.Vector3(.0,1.76,-.21),new THREE.Vector3(.20,1.98,-.19),new THREE.Vector3(.17,2.30,-.13)
      ]);
      add(new THREE.TubeGeometry(backCurve,40,bob?.075:.095,12,false),hair,0,0,0);
    }
    if(style==='Bun') add(new THREE.SphereGeometry(.105,28,20),hair,0,2.47,-.15,[1,1,.9]);
    if(style==='Ponytail'){
      const tail=new THREE.CatmullRomCurve3([new THREE.Vector3(.12,2.27,-.15),new THREE.Vector3(.22,2.1,-.23),new THREE.Vector3(.25,1.84,-.22),new THREE.Vector3(.19,1.62,-.18)]);
      add(new THREE.TubeGeometry(tail,32,.055,12,false),hair,0,0,0);
    }
    if(['Formal','Office'].includes(current.outfit)){
      const trim=current.outfit==='Formal'?'#eee8df':'#e7e1d8';
      add(new THREE.ConeGeometry(.09,.18,4),trim,-.075,1.72,.13,[.72,1,.32]).rotation.z=Math.PI;
      add(new THREE.ConeGeometry(.09,.18,4),trim,.075,1.72,.13,[.72,1,.32]).rotation.z=Math.PI;
      if(current.outfit==='Formal')add(new THREE.ConeGeometry(.045,.23,4),'#394b59',0,1.54,.145,[.5,1,.35]);
    }else if(['Streetwear','Korean minimal'].includes(current.outfit)){
      for(const side of [-1,1])add(new THREE.BoxGeometry(.075,.54,.035),'#394b59',side*.205,1.43,.19);
      if(current.outfit==='Streetwear')add(new THREE.SphereGeometry(.075,18,12),cloth,0,1.84,-.12,[1,.65,.45]);
    }else if(current.outfit==='Sportwear'){
      for(const side of [-1,1])add(new THREE.BoxGeometry(.035,.58,.025),'#f2eee7',side*.19,1.42,.205);
    }else if(current.outfit==='Party')add(new THREE.TorusGeometry(.105,.018,8,28),'#eee8df',0,1.72,.12).rotation.x=Math.PI/2;
    else if(current.outfit==='Sleepwear')for(const side of [-1,1])add(new THREE.BoxGeometry(.025,.42,.02),'#eee5dc',side*.17,1.4,.205);
    if(current.glasses!=='None'){
      for(const side of [-1,1]){
        const frame=add(new THREE.TorusGeometry(.066,.009,8,32), '#343a40',side*.087,2.157,.246);
        frame.scale.set(1.18,.78,1);
      }
      segment([-.02,2.157,.247],[.02,2.157,.247],.008,.008,'#343a40',10);
    }
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
  overlay.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    const view=button.dataset.view;
    if(view==='front')yaw=0;else if(view==='side')yaw=Math.PI/2;else if(view==='back')yaw=Math.PI;
    else if(view==='zoom-in')zoom=Math.max(4,zoom-.45);else if(view==='zoom-out')zoom=Math.min(8,zoom+.45);
    camera.position.z=zoom;rebuild();
  }));
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
