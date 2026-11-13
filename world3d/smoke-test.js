import { CITY_PLACES, travelTo } from './city.js';
import { MALL_LOCATIONS, visitMall } from './mall.js';
import { migrateWorldSave, resolveWorkplace, tasksForObjects, moveWorldLocation, workplaceTypeFor } from './workplaces.js';

const templates = [
  {id:'hq_office',workplaceType:'hq_office',name:'Kantor pusat',npcs:[{name:'Rekan kerja'}],objects:[{id:'desk',name:'Meja kerja',taskIndex:0}]},
  {id:'cafe',workplaceType:'cafe',name:'Kafe dan gerai minuman',npcs:[{name:'Pelanggan'}],objects:[{id:'espresso-machine',name:'Mesin espresso',taskIndex:0}]},
  {id:'school',workplaceType:'school',name:'Ruang kelas',npcs:[{name:'Murid'}],objects:[{id:'class-board',name:'Papan kelas',taskIndex:0}]},
  {id:'hospital',workplaceType:'hospital',name:'Ruang layanan kesehatan',npcs:[{name:'Pasien simulasi'}],objects:[{id:'nurse-station',name:'Meja perawat',taskIndex:0}]},
  {id:'restaurant_kitchen',workplaceType:'restaurant_kitchen',name:'Dapur restoran',npcs:[{name:'Pelanggan'}],objects:[{id:'prep-station',name:'Meja persiapan',taskIndex:0}]},
  {id:'coworking',workplaceType:'coworking',name:'Ruang kerja bersama',npcs:[{name:'Rekan coworking'}],objects:[{id:'shared-desk',name:'Meja kolaborasi',taskIndex:0}]},
  {id:'home',workplaceType:'home',name:'Ruang kerja rumah',npcs:[{name:'Kamu'}],objects:[{id:'home-desk',name:'Meja kerja',taskIndex:0}]},
  {id:'mall_store',workplaceType:'mall_store',name:'Gerai di mal',npcs:[{name:'Pengunjung mal'}],objects:[{id:'shop-counter',name:'Meja layanan gerai',taskIndex:0}]}
];

function assert(condition, message) { if (!condition) throw new Error(message); }
assert(workplaceTypeFor({id:'kopi-kilat'}) === 'cafe', 'Gagal: KopiKilat harus menggunakan scene kafe');
assert(resolveWorkplace({id:'kodeku-labs',name:'Kodeku'},templates)?.id === 'home', 'Gagal: template fallback perusahaan tidak terpilih');
const scene = resolveWorkplace({id:'nusa-global',name:'Nusa',workplaceType:'hq_office'},templates);
assert(tasksForObjects(scene,{tasks:[{title:'Tugas coding'}]})[0].task.title === 'Tugas coding', 'Gagal: objek tidak terhubung ke tugas profesi');
let save = migrateWorldSave({professionId:'programmer',companyId:'nusa-global',day:4});
assert(save.worldMode === 'menu' && save.day === 4, 'Gagal: migrasi save lama mengubah field lama');
assert(moveWorldLocation(save,'mall').currentPlace === 'mall', 'Gagal: perpindahan lokasi');
const citySave = {...save,world:{...save.world,transportEnabled:true},energy:80};
assert(travelTo(citySave,'workplace','walk').ok && citySave.energy < 80, 'Gagal: transport mengubah energi secara opsional');
const mallSave = {...save,money:300000,energy:50,stress:40};
assert(visitMall(mallSave,'mall-foodcourt').ok && mallSave.energy > 50, 'Gagal: interaksi mal');
console.log('world3d smoke checks passed');
