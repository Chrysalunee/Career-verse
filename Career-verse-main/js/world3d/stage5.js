import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { applyWorldPlaceInteraction, applyWorldNpcConversation, advanceWorldNeeds, advanceWorldClock } from './gameplay.js';
import { getCompanyScene as resolveCompanyScene } from './workplaces.js';
const KEY='career-verse-save';
const places=[
{id:'home',name:'Rumah',x:-13,z:12,w:9,d:8,h:6,c:'#f2c7a5',desc:'Istirahat dan mandi: energi +25, kebersihan +35.'},
{id:'work',name:'Kantor Nusa Global',x:17,z:-13,w:11,d:10,h:12,c:'#8cc9d8',desc:'Tempat membangun karier dan menjalani aktivitas kerja.'},
{id:'cafe',name:'Kafe Senja',x:-17,z:-12,w:9,d:8,h:5,c:'#f2a66f',desc:'Makan dan bertemu warga: lapar +28.'},
{id:'market',name:'Pasar Harian',x:16,z:13,w:10,d:9,h:6,c:'#f0c85c',desc:'Belanja kebutuhan sehari-hari: lapar +28.'},
{id:'school',name:'Sekolah Nusa Bangsa',x:31,z:1,w:10,d:12,h:7,c:'#f3d98d',desc:'Belajar dan meningkatkan kemampuan diri.'},
{id:'park',name:'Taman Kota',x:-31,z:0,w:8,d:8,h:4,c:'#b69be8',desc:'Bersantai: hiburan +25, sosial +12.'}
];
const clamp=v=>Math.max(0,Math.min(100,v));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
function tag(text){const c=document.createElement('canvas');c.width=1024;c.height=224;const x=c.getContext('2d');x.fillStyle='#6e5aaee8';x.beginPath();x.roundRect(12,12,1000,200,36);x.fill();x.fillStyle='white';x.font='bold 68px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,112,940);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(7,1.55,1);return s}
export async function loadWorldCatalog(){
  const readJson = async (relativePath) => {
    const response = await fetch(new URL(relativePath, import.meta.url));
    if (!response.ok) throw new Error(`Katalog dunia tidak dapat dimuat: ${relativePath}`);
    return response.json();
  };
  try {
    const [templateData, workplaceMap] = await Promise.all([
      readJson('../../data/world/templates/templates.json'),
      readJson('../../data/world/company-workplaces.json')
    ]);
    return {
      templates: Array.isArray(templateData.templates) ? templateData.templates : [],
      workplaceMap
    };
  } catch (error) {
    console.error('[Career-Verse] Gagal memuat katalog tempat kerja:', error);
    return { templates: [], workplaceMap: { companies: [] }, error };
  }
}
export function getCompanyScene(company, metadata = {}, templates = []) {
  // Normalize both catalog payloads before resolving; this prevents stale/alternate JSON shapes from crashing the 3D screen.
  const normalizedMetadata = Array.isArray(metadata) ? { companies: metadata } : (metadata || {});
  const normalizedTemplates = Array.isArray(templates) ? templates : (Array.isArray(templates?.templates) ? templates.templates : []);
  return resolveCompanyScene(company || {}, normalizedMetadata, normalizedTemplates);
}
export async function mountWorldScene(container, options = {}){
if(!container)throw Error('Area dunia 3D tidak ditemukan.');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2.25));renderer.setSize(container.clientWidth||innerWidth,container.clientHeight||innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;container.replaceChildren(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#c6d2d8');scene.fog=new THREE.Fog('#c6d2d8',92,190);const camera=new THREE.PerspectiveCamera(58,(container.clientWidth||innerWidth)/(container.clientHeight||innerHeight),.1,220);
const hemi=new THREE.HemisphereLight('#ffffff','#d9c9e8',2.6);scene.add(hemi);const sun=new THREE.DirectionalLight('#fff3dc',3.0);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const material=(c,roughness=.78,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});
const cityRoot=new THREE.Group();cityRoot.name='Career-Verse City';scene.add(cityRoot);
function box(parent,x,y,z,w,h,d,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(140,140),material('#b9b8ae'));floor.rotation.x=-Math.PI/2;floor.position.y=-.25;floor.receiveShadow=true;cityRoot.add(floor);
box(cityRoot,0,-.12,0,13,.2,110,'#42494d');box(scene,0,-.12,0,110,.2,13,'#42494d');
box(scene,-8.2,.02,0,2.8,.28,110,'#c8c4b9');box(scene,8.2,.02,0,2.8,.28,110,'#c8c4b9');
box(scene,0,.02,-8.2,110,.28,2.8,'#c8c4b9');box(scene,0,.02,8.2,110,.28,2.8,'#c8c4b9');
for(let i=-5;i<=5;i++){box(scene,0,.015,i*9,.16,.03,3.5,'#e5dcc4');box(scene,i*9,.015,0,3.5,.03,.16,'#e5dcc4')}
for(const side of [-1,1])for(let i=-50;i<50;i+=2)box(scene,side*8.2,.18,i,.025,.02,1.7,'#aaa79e');
const hits=[];
const palettes={
 home:{wall:'#d5cfc2',trim:'#eee9df',roof:'#555e64',glass:'#8faeb9',door:'#594a40',accent:'#9b806b'},
 work:{wall:'#9faeb4',trim:'#e8e9e5',roof:'#46545d',glass:'#789ba9',door:'#394b57',accent:'#a8755d'},
 cafe:{wall:'#c6b49e',trim:'#f1e8d9',roof:'#514e49',glass:'#91aeb6',door:'#59483d',accent:'#ad765a'},
 market:{wall:'#c5c0b3',trim:'#eee9dc',roof:'#59636a',glass:'#89a8b2',door:'#55493e',accent:'#9b795e'},
 school:{wall:'#c9c8bd',trim:'#f1eee5',roof:'#58636a',glass:'#8caab3',door:'#46535a',accent:'#a17e60'},
 park:{wall:'#d8d0c2',trim:'#f3eee4',roof:'#6c756e',glass:'#9eb9b5',door:'#77624e',accent:'#9b8b70'}
};
function windowPanel(g,x,y,z,w,h,p){
 box(g,x,y,z,w,h,.1,p.trim);
 box(g,x,y,z+.07,w-.16,h-.16,.07,p.glass);
 box(g,x,y,z+.12,.07,h-.12,.08,p.trim);
 box(g,x,y,z+.12,w-.12,.07,.08,p.trim);
 box(g,x,y,z+.12,w-.12,.07,.08,p.trim);
}
function makeSign(g,p,front,width){
 // Billboard sign: always readable from the street, never hidden by facade geometry.
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=384;
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.shadowColor='rgba(42,30,65,.22)';ctx.shadowBlur=24;ctx.shadowOffsetY=10;
 ctx.fillStyle='#fffaf2';ctx.beginPath();ctx.roundRect(20,20,1496,344,58);ctx.fill();
 ctx.shadowColor='transparent';ctx.lineWidth=14;ctx.strokeStyle=palettes[p.id].accent;ctx.stroke();
 ctx.fillStyle='#49375f';
 let fontSize=112;ctx.textAlign='center';ctx.textBaseline='middle';
 do{ctx.font='900 '+fontSize+'px system-ui, Arial';fontSize-=4}
 while(ctx.measureText(p.name.toUpperCase()).width>1360&&fontSize>48);
 ctx.fillText(p.name.toUpperCase(),768,192,1360);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));
 sprite.scale.set(Math.max(4.8,Math.min(width, p.name.length*.24+2.2)),1.2,1);
 sprite.position.set(0,Math.min(p.h*.72, p.id==='work'?9.5:p.h+1.1),front+1.15);
 sprite.renderOrder=1000;g.add(sprite);
}
for(const p of places){
 const g=new THREE.Group();g.position.set(p.x,0,p.z);cityRoot.add(g);
 const pal=palettes[p.id]||palettes.home,front=p.d/2+.12;
 const foundation=box(g,0,.18,0,p.w+.6,.36,p.d+.6,pal.trim);
 foundation.position.y=.18;
 if(p.id==='home'){
   box(g,0,2.0,0,p.w,3.6,p.d,pal.wall);
   box(g,3.15,4.15,-.1,4.1,2.1,p.d*.72,'#f5b8c9');
   box(g,0,3.95,0,p.w+.6,.28,p.d+.6,pal.roof);
   box(g,3.15,5.25,-.1,4.35,.25,p.d*.78,pal.roof);
   box(g,0,.55,front+.8,4.3,.18,2.2,'#d9b7a1');
   box(g,0,1.25,front+.8,1.15,2.2,.2,pal.door);
   for(const x of [-3.0,3.0])windowPanel(g,x,2.3,front+.08,1.65,1.65,pal);
   box(g,-3.2,3.85,front+.1,2.0,.22,.25,pal.accent);
   box(g,3.2,3.85,front+.1,2.0,.22,.25,pal.accent);
   for(const x of [-4.5,4.5]){box(g,x,.8,front+1.3,.18,1.4,.18,'#a77b64');const shrub=new THREE.Mesh(new THREE.SphereGeometry(.72,14,12),material('#667d68'));shrub.position.set(x,.9,front+1.3);g.add(shrub)}
 }else if(p.id==='work'){
   box(g,0,p.h/2,0,p.w,p.h,p.d,pal.wall);
   box(g,0,p.h+.2,0,p.w+.8,.4,p.d+.8,pal.roof);
   box(g,0,p.h*.55,front+.08,p.w+.12,1.35,.22,pal.trim);
   for(let floor=0;floor<3;floor++){
     const yy=2.1+floor*3.1;
     for(const x of [-4.1,-1.4,1.4,4.1])windowPanel(g,x,yy,front+.22,1.45,1.75,pal);
     box(g,0,yy-1.0,front+.18,p.w,.14,.22,pal.accent);
   }
   box(g,0,1.5,front+.38,1.45,2.7,.25,pal.door);
   box(g,0,p.h+1.0,0,3.5,1.0,3.5,pal.accent);
   box(g,0,p.h+1.55,0,2.7,.12,2.7,pal.trim);
   for(const x of [-4.2,4.2])box(g,x,1.0,front+1.0,.2,1.9,.2,pal.roof);
 }else if(p.id==='cafe'){
   box(g,0,p.h/2,0,p.w,p.h,p.d,pal.wall);
   box(g,0,p.h+.15,0,p.w+.6,.3,p.d+.6,pal.roof);
   box(g,0,2.35,front+.08,p.w*.78,2.3,.12,pal.glass);
   for(const x of [-p.w*.3,p.w*.3])box(g,x,2.35,front+.17,.12,2.5,.12,pal.trim);
   box(g,0,1.3,front+.2,1.1,2.6,.22,pal.door);
   box(g,0,3.75,front+.75,p.w+.5,.22,1.5,pal.accent);
   for(let x=-4.2;x<=4.2;x+=1.4)box(g,x,3.35,front+.75,.08,.8,1.5,x%2?pal.trim:pal.roof);
   box(g,0,4.45,front+.05,p.w*.72,.65,.2,pal.roof);
   makeSign(g,p,front,p.w*.7);
   for(const x of [-3.4,3.4]){box(g,x,.65,front+1.9,.85,.12,.85,pal.roof);const leg=box(g,x,.35,front+1.9,.09,.7,.09,pal.door)}
 }else if(p.id==='market'){
   box(g,0,2.5,0,p.w,4.7,p.d,pal.wall);
   box(g,0,4.95,0,p.w+.4,.3,p.d+.4,pal.trim);
   for(let x=-4;x<=4;x+=2){box(g,x,2.4,front+.12,1.35,2.4,.16,pal.glass);box(g,x,2.4,front+.24,.08,2.4,.1,pal.trim)}
   box(g,0,1.2,front+.3,1.2,2.4,.2,pal.door);
   for(let x=-4;x<=4;x+=2){box(g,x,4.7,front+1.0,1.9,.18,2.0,pal.accent);box(g,x,4.35,front+1.0,1.9,.18,2.0,pal.roof)}
   for(let i=0;i<7;i++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.23,14,12),material(['#f18b78','#ffd36e','#9ccf9d','#b39be7','#f6a8c8'][i%5]));fruit.position.set(-4.2+i*1.4,1.35,front+1.5);g.add(fruit)}
   makeSign(g,p,front,p.w*.78);
 }else if(p.id==='school'){
   box(g,0,p.h/2,0,p.w,p.h,p.d,pal.wall);
   box(g,0,p.h+.18,0,p.w+.6,.36,p.d+.6,pal.roof);
   box(g,0,2.1,front+.1,2.2,3.8,.25,pal.door);
   for(const x of [-3.7,-1.8,1.8,3.7])windowPanel(g,x,3.4,front+.08,1.25,1.7,pal);
   box(g,0,p.h+1.15,-1,3.2,2.3,3.0,pal.accent);
   const clockFace=new THREE.Mesh(new THREE.CircleGeometry(.68,32),new THREE.MeshBasicMaterial({color:'#e5dcc4'}));clockFace.position.set(0,p.h+1.2,front+.25);g.add(clockFace);
   box(g,0,p.h+2.25,-1,3.5,.2,3.2,pal.roof);
   makeSign(g,p,front,p.w*.68);
 }else{
   // The park is intentionally an open pavilion, not another box building.
   box(g,0,.25,0,p.w,.5,p.d,'#f7dcae');
   for(const x of [-3.2,3.2])for(const z of [-2.5,2.5])box(g,x,2.0,z,.22,4,.22,pal.roof);
   const canopy=new THREE.Mesh(new THREE.ConeGeometry(5.2,1.5,4),material(pal.wall));canopy.position.y=4.4;canopy.rotation.y=Math.PI/4;g.add(canopy);
   box(g,0,.18,front+1.2,3.2,.3,.9,pal.accent);
   const water=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,.16,32),material('#9edcf4'));water.position.set(0,.35,-1.4);g.add(water);
 }
 if(p.id!=='cafe'&&p.id!=='market'&&p.id!=='school')makeSign(g,p,front,Math.min(p.w*.7,7));
 const hit=new THREE.Mesh(new THREE.BoxGeometry(p.w+3,p.h+4,p.d+3),new THREE.MeshBasicMaterial({visible:false}));
 hit.position.y=Math.max(p.h/2,2);hit.userData.place=p;g.add(hit);hits.push(hit);
}
for(let i=0;i<12;i++){const x=-42+(i*7.4)%84,z=i%2?24:-24;box(scene,x,1.5,z,.45,3,.45,'#72533a');const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,12,10),material('#667d68'));crown.position.set(x,3.4,z);cityRoot.add(crown)}
const player=new THREE.Group();player.position.set(0,0,20);scene.add(player);
function capsule(parent,r,len,c,x,y,z){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),material(c));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function makeHuman(parent,shirt='#e58eb2',hairColor='#30251e',config={}){
 const skinColor=config.skin||'#d7a27f',skin=material(skinColor),skinShade=material('#a96f55'),hair=material(config.hairColor||hairColor),cloth=material(config.outfitColor||shirt),darkCloth=material('#303a45'),eyeWhite=material('#f4eee6'),iris=material(config.eyes||'#49352d'),lip=material('#985c59');
 const mesh=(geometry,mat,x,y,z,scale=null)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const limb=(a,b,r1,r2,mat)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);const m=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),16,1),mat,...p.clone().add(q).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m};
 const torsoProfile=[new THREE.Vector2(.16,0),new THREE.Vector2(.19,.12),new THREE.Vector2(.22,.34),new THREE.Vector2(.29,.58),new THREE.Vector2(.34,.78),new THREE.Vector2(.31,.91),new THREE.Vector2(.16,.96),new THREE.Vector2(.13,.98)];
 const bodyShape=new THREE.LatheGeometry(torsoProfile,32);bodyShape.computeVertexNormals();
 const body=mesh(bodyShape,cloth,0,.91,0);body.scale.set(config.body==='Athletic'?1.08:config.body==='Curvy'?1.12:config.body==='Slim'?.9:1,1,.76);
 // Neck and naturally tapered head with a narrower jaw.
 limb([0,1.77,0],[0,1.94,0],.09,.085,skin);
 const head=mesh(new THREE.SphereGeometry(.245,40,32),skin,0,2.12,0);
 head.scale.set(config.face==='Round'?.99:config.face==='Square'?1.02:.91,1.12,.91);
 // Jaw/chin volume and cheek planes.
 mesh(new THREE.SphereGeometry(.17,28,20),skin,0,2.005,.035,[.88,.62,.84]);
 for(const side of [-1,1]){
  mesh(new THREE.SphereGeometry(.052,20,16),skin,side*.226,2.11,0,[.72,1.05,.8]);
  // Eye socket, eyeball, iris, pupil and eyelid line.
  mesh(new THREE.SphereGeometry(.061,24,16),skinShade,side*.091,2.145,.194,[1.15,.78,.38]);
  mesh(new THREE.SphereGeometry(.048,24,18),eyeWhite,side*.091,2.145,.215,[1.12,.88,.55]);
  mesh(new THREE.SphereGeometry(.027,20,16),iris,side*.091,2.143,.247,[.9,1,.45]);
  mesh(new THREE.SphereGeometry(.012,16,12),material('#17191c'),side*.091,2.143,.258);
  const brow=mesh(new THREE.TorusGeometry(.055,.009,8,24,Math.PI),hair,side*.09,2.205,.203);brow.rotation.z=side*.1;
  // Hair falls around the temples as separate locks.
  const strand=mesh(new THREE.SphereGeometry(.075,18,14),hair,side*.205,2.13,-.015,[.72,1.45,.8]);
  strand.rotation.z=side*.12;
 }
 // Nose bridge, tip, nostrils and shaped lips.
 mesh(new THREE.SphereGeometry(.033,20,16),skin,0,2.09,.224,[.72,1.4,.72]);
 mesh(new THREE.SphereGeometry(.045,20,16),skin,0,2.045,.25,[.9,.72,.85]);
 for(const side of [-1,1])mesh(new THREE.SphereGeometry(.012,12,10),skinShade,side*.025,2.035,.268,[1,.6,.65]);
 mesh(new THREE.SphereGeometry(.047,20,12),lip,0,1.985,.22,[1,.27,.55]);
 mesh(new THREE.SphereGeometry(.032,20,12),skin,0,1.999,.224,[1,.12,.5]);
 // Scalp cap and individually curved hair locks.
 const cap=mesh(new THREE.SphereGeometry(.255,32,24,0,Math.PI*2,0,Math.PI*.62),hair,0,2.245,-.025,[1.02,1,.98]);
 const hairStyle=config.hair||'Long layers';
 const lockLength=hairStyle==='Short crop'?.19:hairStyle==='Bob'?.43:hairStyle==='Ponytail'?.55:.7;
 for(const side of [-1,1]){
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.17,2.31,.09),new THREE.Vector3(side*.23,2.2,.08),new THREE.Vector3(side*.245,2.02,.025),new THREE.Vector3(side*.22,1.98-lockLength*.42,-.015),new THREE.Vector3(side*.18,1.92-lockLength*.5,-.035)]);
  mesh(new THREE.TubeGeometry(curve,20,.055,10,false),hair,0,0,0);
 }
 if(hairStyle==='Ponytail'||hairStyle==='Long layers'||hairStyle==='Curly'){
  const backCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.24,-.18),new THREE.Vector3(0,1.92,-.2),new THREE.Vector3(.02,1.45,-.19),new THREE.Vector3(.03,1.3,-.16)]);
  mesh(new THREE.TubeGeometry(backCurve,24,.09,12,false),hair,0,0,0);
 }
 if(hairStyle==='Bun')mesh(new THREE.SphereGeometry(.105,20,16),hair,0,2.42,-.16);
 // Separate sleeves, forearms, palms and five-finger silhouettes.
 parent.userData.legs=[];
 for(const side of [-1,1]){
  limb([side*.25,1.58,0],[side*.34,1.24,.005],.105,.085,cloth);
  limb([side*.34,1.24,.005],[side*.37,.98,.025],.075,.052,skin);
  mesh(new THREE.SphereGeometry(.066,18,14),skin,side*.37,.925,.04,[.78,1.05,.62]);
  for(let f=0;f<4;f++)limb([side*(.335+f*.022),.91,.07],[side*(.335+f*.022),.85,.075],.012,.009,skin);
  const upper=limb([side*.105,.94,0],[side*.11,.48,0],.105,.075,darkCloth);
  parent.userData.legs.push(upper);
  limb([side*.11,.48,0],[side*.11,.13,.04],.075,.055,darkCloth);
  // Shoes with a distinct sole and toe shape.
  mesh(new THREE.SphereGeometry(.105,20,14),material('#292a2d'),side*.11,.085,.09,[.85,.52,1.55]);
  mesh(new THREE.BoxGeometry(.17,.025,.27),material('#b9b4aa'),side*.11,.035,.085);
 }
 // Collar and a clean front placket give the outfit its own silhouette.
 mesh(new THREE.ConeGeometry(.095,.16,4),material('#f0e8dc'),-.075,1.72,.12,[.7,1,.3]).rotation.z=Math.PI;
 mesh(new THREE.ConeGeometry(.095,.16,4),material('#f0e8dc'),.075,1.72,.12,[.7,1,.3]).rotation.z=Math.PI;
 box(parent,0,1.36,.235,.018,.48,.018,'#e9dfd1');
}
const playerCharacter=options.character||{};
makeHuman(player,playerCharacter.outfitColor||'#e58eb2',playerCharacter.hairColor||'#30251e',playerCharacter);
player.scale.y=Math.max(.88,Math.min(1.22,(Number(playerCharacter.height)||168)/168));
player.userData.character=playerCharacter;
const routes=[[[-5,-5],[-11,-2],[-8,5]],[[6,7],[10,4],[4,0]],[[24,-2],[20,-7],[28,3]]],npcs=[];
const npcNames=['Alya · warga kota','Bima · pekerja kreatif','Dimas · mahasiswa'];
routes.forEach((r,i)=>{const n=new THREE.Group();n.position.set(r[0][0],0,r[0][1]);scene.add(n);makeHuman(n,['#ed8a78','#5f9fda','#e2b34f'][i],['#3a2823','#29251f','#493226'][i]);npcs.push({node:n,route:r,index:1,name:npcNames[i]})});
const hud=document.createElement('div');hud.className='cv5hud';hud.innerHTML='<div class="top"><b>CAREER-VERSE · LIFE SIMULATOR</b><strong class="clock">08:00 · HARI 1</strong><div class="needs"></div></div><div class="help">WASD bergerak · Shift berlari · E masuk / interaksi · Drag mouse untuk kamera</div><div class="prompt">Jelajahi kota, masuk ke bangunan, dan jalani aktivitas.</div>';container.append(hud);
const style=document.createElement('style');style.textContent='.cv5hud{position:absolute;inset:0;pointer-events:none;color:#403653;font:13px system-ui;text-shadow:none}.cv5hud .top{position:absolute;top:14px;left:16px;right:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:start}.cv5hud .top>b,.cv5hud .clock,.cv5hud .needs span{background:#fffaf2ed;border:1px solid #ffffff;padding:10px 12px;border-radius:12px;box-shadow:0 5px 18px #46315a1c}.cv5hud .top>b{color:#7258bd;grid-column:1;grid-row:1;white-space:normal;overflow-wrap:anywhere;max-width:100%}.cv5hud .needs{grid-column:1/-1;grid-row:2;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-start;max-width:100%}.cv5hud .needs span{font-size:11px;color:#55466f;white-space:normal;overflow-wrap:anywhere;line-height:1.35}.cv5hud .help,.cv5hud .prompt{position:absolute;bottom:14px;left:14px;background:#fffaf2ed;border:1px solid #fff;padding:10px 13px;border-radius:12px;box-shadow:0 5px 18px #46315a1c;color:#51446e}.cv5hud .prompt{left:50%;bottom:58px;transform:translateX(-50%);text-align:center;background:#f5eaffed;color:#58417c;width:max-content;max-width:calc(100% - 28px);white-space:normal;line-height:1.45;overflow-wrap:anywhere}.cv5hud .clock{grid-column:2;grid-row:1;font-size:16px;font-weight:bold;color:#5a4b78;white-space:normal;max-width:100%;text-align:center}@media(max-width:760px){.cv5hud .needs{max-width:190px}.cv5hud .help{display:block;max-width:calc(100% - 28px);white-space:normal;line-height:1.45;overflow-wrap:anywhere}}';style.textContent+='.cv-interior-label{position:absolute;z-index:6;top:70px;left:50%;transform:translateX(-50%);padding:9px 16px;border-radius:999px;background:#f7f4eeed;border:1px solid #fff;color:#34485b;font:800 12px/1.4 system-ui,sans-serif;letter-spacing:.12em;box-shadow:0 8px 24px #26374422;pointer-events:none;max-width:calc(100% - 24px);text-align:center}.cv5hud .prompt{font-size:14px;font-weight:700;background:#f7f4eeed;color:#34485b}';container.append(style);

const interiorRoot=new THREE.Group();interiorRoot.name='Bangunan interior';scene.add(interiorRoot);interiorRoot.visible=false;
let insideBuilding=null,cityReturnPosition=null,interiorTargets=[],interiorPlaque=null;
function buildInterior(place){
 interiorRoot.clear();interiorTargets=[];
 const wall=place.id==='home'?'#e5ded1':place.id==='work'?'#d9e0e1':place.id==='cafe'?'#d9c5ad':place.id==='market'?'#ddd9ce':'#e1e0d6';
 const add=(x,y,z,w,h,d,c)=>box(interiorRoot,x,y,z,w,h,d,c);
 add(0,-.16,0,12,.3,12,'#b6a38b');add(0,2.2,-5.8,12,4.4,.25,wall);add(-5.8,2.2,0,.25,4.4,12,wall);add(5.8,2.2,0,.25,4.4,12,wall);add(-2.7,2.2,5.8,6.6,4.4,.25,wall);add(2.7,3.8,5.8,6.6,1.2,.25,wall);add(0,4.45,0,12,.18,12,'#e9e4d9');add(0,1.15,5.58,1.5,2.3,.12,'#6a5547');
 const lamp=new THREE.PointLight('#fff0d4',1.25,24);lamp.position.set(0,3.8,0);interiorRoot.add(lamp);
 const target=(id,label,x,z)=>interiorTargets.push({id,label,x,z});
 if(place.id==='home'){
  add(-2.4,.42,-1.7,3.1,.65,2.2,'#8a7465');add(-2.4,.85,-1.7,3,.35,2.1,'#d4c6b2');add(-2.4,1.12,-2.35,2.8,.3,.65,'#eee5d7');add(2.4,.48,-2.5,1.6,.9,.9,'#e8e0d3');add(3.9,1.1,1,1,2.2,1,'#d8d8d1');target('daily-home','Tempat tidur dan area rumah',-2.4,-1.7);target('daily-home','Area bersiap',3.9,1);
 }else if(place.id==='work'){
  add(-2.1,.9,-2.2,2.5,.18,1.2,'#80634d');add(-2.1,1.35,-2.5,1.05,.65,.12,'#46535a');add(2.1,.85,-2.2,2.4,.18,1.15,'#80634d');add(2.1,1.25,-2.4,.9,.55,.12,'#46535a');target('work-desk','Meja kerja',-2.1,-2.2);target('work-desk','Meja kerja tim',2.1,-2.2);
 }else if(place.id==='cafe'){
  for(const [x,z] of [[-2,-1.8],[2,-1.8],[-2,2],[2,2]]){add(x,.85,z,1.6,.14,1.1,'#80634d');add(x-.55,.42,z,.12,.8,.12,'#46535a');add(x+.55,.42,z,.12,.8,.12,'#46535a')}
  add(0,1.1,-4.7,4.4,1.2,.8,'#8b715b');target('daily-cafe','Meja kafe',0,-1.8);
 }else if(place.id==='market'){
  for(const x of [-3.4,0,3.4]){add(x,1.35,-2.8,1,2.7,3.5,'#8b7864');for(let y=.65;y<2.5;y+=.7)add(x,y,-.95,1.05,.08,2.9,'#d8c6a5')}
  add(0,.8,3,2.8,1.4,.8,'#88745e');target('daily-market','Rak dan kasir',0,3);
 }else if(place.id==='school'){
  for(const z of [-2,1,3.6])for(const x of [-2.7,2.7]){add(x,.8,z,1.8,.14,1,'#80634d');add(x,1.35,z-.4,1.6,.9,.1,'#52616a')}
  add(0,2.1,-5.55,4.5,1.6,.12,'#40565e');target('daily-school','Ruang kelas',0,1);
 }
 interiorPlaque=document.createElement('div');interiorPlaque.className='cv-interior-label';interiorPlaque.textContent='INTERIOR · '+place.name.toUpperCase();container.append(interiorPlaque);
}
function enterBuilding(place){insideBuilding=place;cityReturnPosition={x:player.position.x,z:player.position.z};cityRoot.visible=false;npcs.forEach(n=>n.node.visible=false);buildInterior(place);interiorRoot.visible=true;player.position.set(0,0,3.5);prompt.textContent='Kamu berada di '+place.name+'. Jelajahi interior dan tekan E pada area aktivitas. Dekati pintu untuk keluar.';}
function leaveBuilding(){if(!insideBuilding)return;interiorRoot.visible=false;interiorRoot.clear();interiorPlaque?.remove();interiorPlaque=null;cityRoot.visible=true;npcs.forEach(n=>n.node.visible=true);player.position.set(cityReturnPosition?.x??insideBuilding.x,0,cityReturnPosition?.z??insideBuilding.z+8);prompt.textContent='Kamu kembali ke area kota. Jelajahi bangunan lain.';insideBuilding=null;cityReturnPosition=null;}

const saved=read(),needs={hunger:clamp(saved.needs?.hunger??82),energy:clamp(saved.needs?.energy??90),hygiene:clamp(saved.needs?.hygiene??88),social:clamp(saved.needs?.social??55),fun:clamp(saved.needs?.fun??72)},names={hunger:'Lapar',energy:'Energi',hygiene:'Bersih',social:'Sosial',fun:'Hiburan'},needsEl=hud.querySelector('.needs');
function updateNeeds(){needsEl.innerHTML=Object.keys(needs).map(k=>'<span>'+names[k]+': '+Math.round(needs[k])+'%</span>').join('')}updateNeeds();
let clock=saved.world?.clockMinutes??480,day=saved.world?.calendarDay??saved.day??1,yaw=0,pitch=.58,drag=false,lx=0,ly=0,alive=true,saveTimer=0,needsRefresh=0;const keys={},prompt=hud.querySelector('.prompt');
function persist(){const s=read();s.needs={...needs};s.world={...(s.world||{}),clockMinutes:clock,calendarDay:day,position:{x:player.position.x,z:player.position.z}};write(s)}
function interact(){
 if(insideBuilding){if(player.position.z>4.5){leaveBuilding();return}const target=interiorTargets.find(item=>Math.hypot(player.position.x-item.x,player.position.z-item.z)<2.2);if(target){prompt.textContent='Membuka '+target.label+'...';options.onInteract?.({id:target.id,place:insideBuilding});return}prompt.textContent='Dekati furnitur atau area aktivitas. Dekati pintu untuk keluar.';return}
 let nearestNpc=null,npcDistance=3.8;
 for(const npc of npcs){const d=Math.hypot(player.position.x-npc.node.position.x,player.position.z-npc.node.position.z);if(d<npcDistance){npcDistance=d;nearestNpc=npc}}
 if(nearestNpc){
  const save=read();applyWorldNpcConversation(save,nearestNpc.name);Object.assign(needs,save.needs||{});
  prompt.textContent='Kamu berbincang dengan '+nearestNpc.name+'. Sosial +8, hiburan +3, hubungan +2.';
  updateNeeds();write(save);persist();return;
 }
 let place=null,distance=9;
 for(const candidate of places){const d=Math.hypot(player.position.x-candidate.x,player.position.z-candidate.z);if(d<distance){distance=d;place=candidate}}
 if(!place){prompt.textContent='Dekati warga atau salah satu lokasi kota, lalu tekan E.';return}
 if(place.id==='park'){prompt.textContent='Kamu berada di Taman Kota. Menikmati waktu luang...';options.onInteract?.({id:'daily-park',place});return}
 if(['work','home','cafe','market','school'].includes(place.id)){enterBuilding(place);return}
 const save=read(),result=applyWorldPlaceInteraction(save,place.id);
 if(!result.ok){prompt.textContent=result.message;return}
 Object.assign(needs,save.needs||{});updateNeeds();
 prompt.textContent=result.message;write(save);persist();
}
const syncActivity=e=>{const s=e.detail||read();if(s.needs){Object.assign(needs,s.needs);updateNeeds()}if(Number.isFinite(s.world?.clockMinutes))clock=s.world.clockMinutes;if(Number.isFinite(s.world?.calendarDay))day=s.world.calendarDay;};
window.addEventListener('careerverse-world-activity-complete',syncActivity);
const down=e=>{if(e.button!==0)return;drag=true;lx=e.clientX;ly=e.clientY},move=e=>{if(!drag)return;yaw-=(e.clientX-lx)*.005;pitch=Math.max(-.1,Math.min(.8,pitch+(e.clientY-ly)*.003));lx=e.clientX;ly=e.clientY},up=()=>drag=false;
const kd=e=>{keys[e.key.toLowerCase()]=true;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e'&&!e.repeat)interact()},ku=e=>keys[e.key.toLowerCase()]=false;
renderer.domElement.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
if(saved.world?.position){player.position.x=saved.world.position.x??0;player.position.z=saved.world.position.z??20}
let last=0;function animate(now){if(!alive)return;const dt=Math.min((now-last)/1000||0,.05);last=now;saveTimer+=dt;const gameMinutes=dt*2,advanced=advanceWorldClock(clock,day,gameMinutes);clock=advanced.clockMinutes;day=advanced.calendarDay;advanceWorldNeeds(needs,gameMinutes);needsRefresh+=dt;if(needsRefresh>=1){needsRefresh=0;updateNeeds()}const f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dir=new THREE.Vector3(side,0,-f).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).normalize();if(f||side){player.position.addScaledVector(dir,(keys.shift?8:5)*dt);if(player.userData.legs?.length){const swing=Math.sin(now*(keys.shift?.018:.012))*((keys.shift?1.0:.65));player.userData.legs.forEach((leg,index)=>{leg.rotation.x=(index===0?1:-1)*swing})}player.position.x=THREE.MathUtils.clamp(player.position.x,insideBuilding?-5:-47,insideBuilding?5:47);player.position.z=THREE.MathUtils.clamp(player.position.z,insideBuilding?-5:-47,insideBuilding?5:47);player.rotation.y=Math.atan2(dir.x,dir.z)}else if(player.userData.legs?.length){player.userData.legs.forEach(leg=>{leg.rotation.x*=.72})}npcs.forEach(n=>{const t=n.route[n.index],dx=t[0]-n.node.position.x,dz=t[1]-n.node.position.z,d=Math.hypot(dx,dz);if(d<.3)n.index=(n.index+1)%n.route.length;else{n.node.position.x+=dx/d*1.2*dt;n.node.position.z+=dz/d*1.2*dt}});const h=Math.floor(clock/60),m=Math.floor(clock%60);hud.querySelector('.clock').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' · HARI '+day;const light=THREE.MathUtils.clamp(Math.sin(clock/1440*Math.PI*2-Math.PI/2)*.5+.5,.12,1);sun.intensity=.25+light*2;hemi.intensity=.55+light*1.5;scene.background.set(light<.28?'#46525f':light<.55?'#9a9d9a':'#c6d2d8');scene.fog.color.copy(scene.background);const target=new THREE.Vector3(player.position.x,1.1,player.position.z),dist=insideBuilding?8:12;camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*dist,target.y+Math.sin(pitch)*dist+3,target.z+Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(target);renderer.render(scene,camera);if(saveTimer>8){saveTimer=0;persist()}requestAnimationFrame(animate)}
const resize=()=>{const w=container.clientWidth||innerWidth,h=container.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)};window.addEventListener('resize',resize);requestAnimationFrame(animate);
return {destroy(){alive=false;interiorPlaque?.remove();window.removeEventListener('resize',resize);window.removeEventListener('careerverse-world-activity-complete',syncActivity);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);renderer.domElement.removeEventListener('pointerdown',down);renderer.dispose();hud.remove();style.remove()},getGameClock(){return {clockMinutes:clock,calendarDay:day,position:{x:player.position.x,z:player.position.z}}}};
}