import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
const KEY='career-verse-save';
const places=[
{id:'home',name:'Rumah',x:-13,z:12,w:9,d:8,h:6,c:'#f2c7a5',desc:'Istirahat dan mandi: energi +25, kebersihan +35.'},
{id:'work',name:'Kantor Nusa Global',x:17,z:-13,w:11,d:10,h:12,c:'#8cc9d8',desc:'Tempat membangun karier dan menjalani aktivitas kerja.'},
{id:'cafe',name:'Kafe Senja',x:-17,z:-12,w:9,d:8,h:5,c:'#f2a66f',desc:'Makan dan bertemu warga: lapar +28.'},
{id:'market',name:'Pasar Harian',x:16,z:13,w:10,d:9,h:6,c:'#f0c85c',desc:'Belanja kebutuhan sehari-hari: lapar +28.'},
{id:'school',name:'Sekolah Nusa Bangsa',x:31,z:1,w:10,d:12,h:7,c:'#f3d98d',desc:'Belajar dan meningkatkan kemampuan diri.'},
{id:'park',name:'Taman Kota',x:-31,z:0,w:8,d:8,h:4,c:'#75b978',desc:'Bersantai: hiburan +25, sosial +12.'}
];
const clamp=v=>Math.max(0,Math.min(100,v));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
function tag(text){const c=document.createElement('canvas');c.width=1024;c.height=224;const x=c.getContext('2d');x.fillStyle='#6e5aaee8';x.beginPath();x.roundRect(12,12,1000,200,36);x.fill();x.fillStyle='white';x.font='bold 68px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,112,940);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(7,1.55,1);return s}
export async function loadWorldCatalog(){return {templates:[],workplaceMap:[]}}
export function getCompanyScene(){return null}
export async function mountWorldScene(container){
if(!container)throw Error('Area dunia 3D tidak ditemukan.');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2.25));renderer.setSize(container.clientWidth||innerWidth,container.clientHeight||innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;container.replaceChildren(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#b9e4ff');scene.fog=new THREE.Fog('#b9e4ff',72,165);const camera=new THREE.PerspectiveCamera(58,(container.clientWidth||innerWidth)/(container.clientHeight||innerHeight),.1,220);
const hemi=new THREE.HemisphereLight('#fff0df','#6b8c57',2.35);scene.add(hemi);const sun=new THREE.DirectionalLight('#ffe1ad',2.6);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78});
function box(parent,x,y,z,w,h,d,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(140,140),material('#f5dfd2'));floor.rotation.x=-Math.PI/2;floor.position.y=-.25;floor.receiveShadow=true;scene.add(floor);
box(scene,0,-.12,0,13,.2,110,'#b7a9c9');box(scene,0,-.12,0,110,.2,13,'#b7a9c9');
box(scene,-8.2,.02,0,2.8,.28,110,'#ffe1b8');box(scene,8.2,.02,0,2.8,.28,110,'#e7dafa');
box(scene,0,.02,-8.2,110,.28,2.8,'#b9ad98');box(scene,0,.02,8.2,110,.28,2.8,'#b9ad98');
for(let i=-5;i<=5;i++){box(scene,0,.015,i*9,.16,.03,3.5,'#fff7df');box(scene,i*9,.015,0,3.5,.03,.16,'#ffe6ef')}
for(const side of [-1,1])for(let i=-50;i<50;i+=2)box(scene,side*8.2,.18,i,.025,.02,1.7,'#d8cce9');
const hits=[];
for(const p of places){
 const g=new THREE.Group();g.position.set(p.x,0,p.z);scene.add(g);
 box(g,0,p.h/2,0,p.w,p.h,p.d,p.c);
 box(g,0,.32,p.d/2+.05,p.w,.64,.14,'#e4c79f');
 const front=p.d/2+.09;
 const roofA=new THREE.Mesh(new THREE.BoxGeometry(p.w+1,.22,p.d*.62),new THREE.MeshStandardMaterial({color:'#c65b3e',roughness:.9}));roofA.position.set(0,p.h+.72,-p.d*.2);roofA.rotation.x=-.48;roofA.castShadow=true;g.add(roofA);
 const roofB=new THREE.Mesh(new THREE.BoxGeometry(p.w+1,.22,p.d*.62),new THREE.MeshStandardMaterial({color:'#9b4e38',roughness:.9}));roofB.position.set(0,p.h+.72,p.d*.2);roofB.rotation.x=.48;roofB.castShadow=true;g.add(roofB);
 box(g,0,p.h+1.27,0,p.w+1,.2,.28,'#8e4935');
 for(const x of [-p.w*.28,p.w*.28]){
  box(g,x,p.h*.57,front,1.9,1.9,.14,'#eee0c7');box(g,x,p.h*.57,front+.09,1.63,1.62,.08,'#9cdae2');
  box(g,x,p.h*.57,front+.15,.07,1.68,.1,'#eee0c7');box(g,x,p.h*.57,front+.15,1.68,.07,.1,'#eee0c7');
 }
 box(g,0,1.32,front,.92,2.64,.2,'#805b40');box(g,.31,1.35,front+.13,.055,.055,.06,'#e9c77b');
 box(g,0,p.h*.49,front+.82,p.w+.4,.18,1.55,p.id==='cafe'?'#d2a66a':'#e56b4e');
 for(let k=-4;k<=4;k++)box(g,k*.62,p.h*.49-.15,front+.82,.18,.36,1.56,k%2?'#f0dfc1':'#f28b55');
 box(g,0,p.h*.76,front+.2,Math.min(p.w*.8,8),.82,.2,'#dc5945');
 const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const sx=signCanvas.getContext('2d');sx.fillStyle='#9b4734';sx.fillRect(0,0,512,128);sx.fillStyle='#fff0d5';sx.font='bold 92px Arial';sx.textAlign='center';sx.textBaseline='middle';sx.fillText(p.name.toUpperCase(),512,128,960);
 const signTex=new THREE.CanvasTexture(signCanvas);signTex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(p.w*.8,8),.72),new THREE.MeshBasicMaterial({map:signTex}));sign.position.set(0,p.h*.76,front+.32);g.add(sign);
 if(p.id==='market'||p.id==='cafe'){box(g,0,.8,front+1.8,p.w*.72,1.2,.75,'#805b40');for(let j=0;j<5;j++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),material(['#d84b35','#e1b943','#669b55','#c65b3f','#e6ca67'][j]));fruit.position.set(-p.w*.25+j*p.w*.125,1.5,front+1.8);g.add(fruit)}}
 const hit=new THREE.Mesh(new THREE.BoxGeometry(p.w+2,p.h+3,p.d+2),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=p.h/2;hit.userData.place=p;g.add(hit);hits.push(hit);
}
for(let i=0;i<12;i++){const x=-42+(i*7.4)%84,z=i%2?24:-24;box(scene,x,1.5,z,.45,3,.45,'#72533a');const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,12,10),material('#a58ce9'));crown.position.set(x,3.4,z);scene.add(crown)}
const player=new THREE.Group();player.position.set(0,0,20);scene.add(player);
function capsule(parent,r,len,c,x,y,z){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),material(c));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function makeHuman(parent,shirt='#477b91',hairColor='#30251e'){
 const skin=material('#e0ad89'),skinShadow=material('#b9785d'),hair=material(hairColor);
 const torso=capsule(parent,.31,.62,shirt,0,1.22,0);torso.scale.set(1.05,1,.72);
 capsule(parent,.105,.16,'#e0ad89',0,1.72,0);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.275,28,20),skin);head.position.set(0,1.99,0);head.scale.set(.88,1.12,.9);head.castShadow=true;parent.add(head);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.286,24,18,0,Math.PI*2,0,Math.PI*.66),hair);cap.position.set(0,2.105,-.025);cap.castShadow=true;parent.add(cap);
 for(const side of [-1,1]){const lock=new THREE.Mesh(new THREE.SphereGeometry(.105,12,10),hair);lock.position.set(side*.235,2.0,-.005);lock.scale.set(.75,1.3,.8);parent.add(lock)}
 const fringe=new THREE.Mesh(new THREE.SphereGeometry(.19,18,10),hair);fringe.position.set(0,2.13,.17);fringe.scale.set(1,.38,.55);parent.add(fringe);
 for(const side of [-1,1]){
  const ear=new THREE.Mesh(new THREE.SphereGeometry(.055,10,10),skin);ear.position.set(side*.25,1.98,0);parent.add(ear);
  const white=new THREE.Mesh(new THREE.SphereGeometry(.041,12,10),material('#fff8eb'));white.position.set(side*.09,2.005,.235);parent.add(white);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),material('#382820'));pupil.position.set(side*.09,2.005,.27);parent.add(pupil);
  const brow=capsule(parent,.018,.09,hairColor,side*.09,2.075,.225);brow.rotation.z=side*.12;
 }
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),skinShadow);nose.position.set(0,1.965,.27);nose.scale.set(.72,.8,.7);parent.add(nose);
 const mouth=new THREE.Mesh(new THREE.SphereGeometry(.038,10,8),material('#9d5d55'));mouth.position.set(0,1.89,.25);mouth.scale.set(1,.28,.4);parent.add(mouth);
 parent.userData.legs=[];
 for(const side of [-1,1]){
  const sleeve=capsule(parent,.115,.32,shirt,side*.37,1.4,0);sleeve.rotation.z=side*-.18;
  const forearm=capsule(parent,.075,.28,'#e0ad89',side*.405,1.12,.015);forearm.rotation.z=side*.05;
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.085,12,10),skin);hand.position.set(side*.41,.94,.035);parent.add(hand);
  const leg=capsule(parent,.125,.5,'#40536a',side*.16,.48,0);parent.userData.legs.push(leg);
  box(parent,side*.16,.14,.14,.24,.17,.4,'#302c2b');
 }
 box(parent,0,1.66,.19,.24,.075,.07,'#f4e6cf');
 for(let y=1.48;y>1.08;y-=.14){const button=new THREE.Mesh(new THREE.SphereGeometry(.018,8,8),material('#f4e4c6'));button.position.set(0,y,.225);parent.add(button)}
 box(parent,0,.78,.02,.36,.07,.56,'#5a4539');
}
makeHuman(player,'#477b91','#30251e');
const routes=[[[-5,-5],[-11,-2],[-8,5]],[[6,7],[10,4],[4,0]],[[24,-2],[20,-7],[28,3]]],npcs=[];
routes.forEach((r,i)=>{const n=new THREE.Group();n.position.set(r[0][0],0,r[0][1]);scene.add(n);makeHuman(n,['#ed8a78','#5f9fda','#e2b34f'][i],['#3a2823','#29251f','#493226'][i]);npcs.push({node:n,route:r,index:1})});
const hud=document.createElement('div');hud.className='cv5hud';hud.innerHTML='<div class="top"><b>CAREER-VERSE · STAGE 5</b><strong class="clock">08:00 · HARI 1</strong><div class="needs"></div></div><div class="help">WASD bergerak · Shift berlari · E berinteraksi · Drag mouse untuk kamera</div><div class="prompt">Jelajahi kota. Dekati bangunan dan tekan E.</div>';container.append(hud);
const style=document.createElement('style');style.textContent='.cv5hud{position:absolute;inset:0;pointer-events:none;color:white;font:13px system-ui;text-shadow:0 1px 3px #17251f}.cv5hud .top{position:absolute;top:14px;left:16px;right:16px;display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.cv5hud .top>b,.cv5hud .clock,.cv5hud .needs span{background:#132b26e8;padding:10px 12px;border-radius:9px}.cv5hud .top>b{color:#9ee0bd}.cv5hud .needs{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.cv5hud .needs span{font-size:11px}.cv5hud .help,.cv5hud .prompt{position:absolute;bottom:14px;left:14px;background:#132b26e8;padding:10px 13px;border-radius:9px}.cv5hud .prompt{left:50%;bottom:58px;transform:translateX(-50%);text-align:center;background:#164d3eee}.cv5hud .clock{font-size:16px;font-weight:bold}@media(max-width:760px){.cv5hud .needs{max-width:190px}.cv5hud .help{display:none}}';container.append(style);
const saved=read(),needs={hunger:clamp(saved.needs?.hunger??82),energy:clamp(saved.needs?.energy??90),hygiene:clamp(saved.needs?.hygiene??88),social:clamp(saved.needs?.social??55),fun:clamp(saved.needs?.fun??72)},names={hunger:'Lapar',energy:'Energi',hygiene:'Bersih',social:'Sosial',fun:'Hiburan'},needsEl=hud.querySelector('.needs');
function updateNeeds(){needsEl.innerHTML=Object.keys(needs).map(k=>'<span>'+names[k]+': '+Math.round(needs[k])+'%</span>').join('')}updateNeeds();
let clock=saved.world?.clockMinutes??480,day=saved.world?.calendarDay??saved.day??1,yaw=0,pitch=.58,drag=false,lx=0,ly=0,alive=true,elapsed=0,saveTimer=0;const keys={},prompt=hud.querySelector('.prompt');
function persist(){const s=read();s.needs={...needs};s.world={...(s.world||{}),clockMinutes:clock,calendarDay:day,position:{x:player.position.x,z:player.position.z}};write(s)}
function interact(){let p=null,dmin=9;for(const a of places){const d=Math.hypot(player.position.x-a.x,player.position.z-a.z);if(d<dmin){dmin=d;p=a}}if(!p){prompt.textContent='Dekati salah satu bangunan untuk berinteraksi.';return}if(p.id==='home'){needs.energy=clamp(needs.energy+25);needs.hygiene=clamp(needs.hygiene+35)}if(p.id==='cafe'||p.id==='market')needs.hunger=clamp(needs.hunger+28);if(p.id==='park'){needs.fun=clamp(needs.fun+25);needs.social=clamp(needs.social+12)}if(p.id==='school')needs.fun=clamp(needs.fun+8);if(p.id==='work')needs.energy=clamp(needs.energy-8);updateNeeds();prompt.textContent=p.name+' dikunjungi · '+p.desc;persist()}
const down=e=>{if(e.button!==0)return;drag=true;lx=e.clientX;ly=e.clientY},move=e=>{if(!drag)return;yaw-=(e.clientX-lx)*.005;pitch=Math.max(-.1,Math.min(.8,pitch+(e.clientY-ly)*.003));lx=e.clientX;ly=e.clientY},up=()=>drag=false;
const kd=e=>{keys[e.key.toLowerCase()]=true;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e'&&!e.repeat)interact()},ku=e=>keys[e.key.toLowerCase()]=false;
renderer.domElement.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
if(saved.world?.position){player.position.x=saved.world.position.x??0;player.position.z=saved.world.position.z??20}
let last=0;function animate(now){if(!alive)return;const dt=Math.min((now-last)/1000||0,.05);last=now;elapsed+=dt;saveTimer+=dt;clock=(clock+dt*2)%1440;if(clock<dt*2)day++;if(elapsed>1){const t=elapsed;elapsed=0;for(const [k,v] of Object.entries({hunger:.34,energy:.22,hygiene:.16,social:.12,fun:.14}))needs[k]=clamp(needs[k]-t*v);updateNeeds()}const f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dir=new THREE.Vector3(side,0,-f).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).normalize();if(f||side){player.position.addScaledVector(dir,(keys.shift?8:5)*dt);player.position.x=THREE.MathUtils.clamp(player.position.x,-47,47);player.position.z=THREE.MathUtils.clamp(player.position.z,-47,47);player.rotation.y=Math.atan2(dir.x,dir.z)}npcs.forEach(n=>{const t=n.route[n.index],dx=t[0]-n.node.position.x,dz=t[1]-n.node.position.z,d=Math.hypot(dx,dz);if(d<.3)n.index=(n.index+1)%n.route.length;else{n.node.position.x+=dx/d*1.2*dt;n.node.position.z+=dz/d*1.2*dt}});const h=Math.floor(clock/60),m=Math.floor(clock%60);hud.querySelector('.clock').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' · HARI '+day;const light=THREE.MathUtils.clamp(Math.sin(clock/1440*Math.PI*2-Math.PI/2)*.5+.5,.12,1);sun.intensity=.25+light*2;hemi.intensity=.55+light*1.5;scene.background.set(light<.28?'#344765':light<.55?'#f2a477':'#8fc9e8');scene.fog.color.copy(scene.background);const target=new THREE.Vector3(player.position.x,1.1,player.position.z),dist=12;camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*dist,target.y+Math.sin(pitch)*dist+3,target.z+Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(target);renderer.render(scene,camera);if(saveTimer>8){saveTimer=0;persist()}requestAnimationFrame(animate)}
const resize=()=>{const w=container.clientWidth||innerWidth,h=container.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)};window.addEventListener('resize',resize);requestAnimationFrame(animate);
return {destroy(){alive=false;window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);renderer.domElement.removeEventListener('pointerdown',down);renderer.dispose();hud.remove();style.remove()},getGameClock(){return {clockMinutes:clock,calendarDay:day,position:{x:player.position.x,z:player.position.z}}}};
}