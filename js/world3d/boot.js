import { DEFAULT_WORKPLACE_TYPES, getCompanyScene, mapInteractiveObjects } from './workplaces.js';

export { DEFAULT_WORKPLACE_TYPES, getCompanyScene, mapInteractiveObjects } from './workplaces.js';
export { MALL_LOCATIONS, visitMall } from './mall.js';
export { CITY_LINKS, buildCityMap, getCityTripInfo } from './city.js';

export async function loadWorldCatalog() {
  const [templateResponse, workplaceResponse] = await Promise.all([
    fetch('./data/world/templates/templates.json'),
    fetch('./data/world/company-workplaces.json'),
  ]);
  const templatesJson = templateResponse.ok ? await templateResponse.json() : { templates: [] };
  const workplaceJson = workplaceResponse.ok ? await workplaceResponse.json() : { companies: [] };
  return {
    templates: Array.isArray(templatesJson.templates) ? templatesJson.templates : [],
    workplaceMap: Array.isArray(workplaceJson.companies) ? workplaceJson.companies : [],
  };
}

export async function mountWorldScene(container, options = {}) {
  if (!container || typeof window === 'undefined') return null;
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
  const OrbitControlsModule = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js');
  const { OrbitControls } = OrbitControlsModule;

  const scene = new THREE.Scene();
  const sky = options.background || '#d9efff';
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 13, 34);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
  camera.position.set(8, 7.5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 18;
  controls.target.set(0, 1.2, 0);

  scene.add(new THREE.HemisphereLight('#ffffff', '#c8b6d9', 1.8));
  const sun = new THREE.DirectionalLight('#fff4df', 2.4);
  sun.position.set(6, 12, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  const fill = new THREE.PointLight('#c7e8ff', 1.1, 18);
  fill.position.set(-4, 5, 4);
  scene.add(fill);

  const mat = (color, roughness = 0.82, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.5, 0.65, 48), mat('#f6dfd0'));
  ground.position.y = -0.48;
  ground.receiveShadow = true;
  scene.add(ground);

  const rug = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 0.035, 48), mat('#d9cdfb'));
  rug.position.y = -0.13;
  scene.add(rug);

  const room = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 5.5), mat('#fff2e8'));
  room.position.set(0, 1.6, -0.3);
  room.castShadow = true;
  room.receiveShadow = true;
  scene.add(room);

  // Colorful wall panels make the room feel bright without changing gameplay.
  const wallPanels = [
    { x: -1.85, y: 1.7, z: 2.47, color: '#f5b7d0' },
    { x: 0, y: 1.7, z: 2.47, color: '#c9baf4' },
    { x: 1.85, y: 1.7, z: 2.47, color: '#a9ddf5' },
  ];
  for (const panel of wallPanels) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.55, 0.06), mat(panel.color));
    mesh.position.set(panel.x, panel.y, panel.z);
    scene.add(mesh);
  }

  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.25, 0.09), mat('#ffffff', 0.35));
  windowFrame.position.set(-1.65, 2.05, 2.38);
  scene.add(windowFrame);
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.38, 1.08, 0.05), new THREE.MeshStandardMaterial({ color: '#bce8ff', emissive: '#75c9f4', emissiveIntensity: 0.25, roughness: 0.25 }));
  windowGlass.position.set(-1.65, 2.05, 2.32);
  scene.add(windowGlass);

  const businessColor = new THREE.Color(options.color || '#a58be8');
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 1.2), new THREE.MeshStandardMaterial({ color: businessColor, metalness: 0.05, roughness: 0.68 }));
  desk.position.set(0, 0.9, 0.6);
  desk.castShadow = true;
  scene.add(desk);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.12), new THREE.MeshStandardMaterial({ color: '#f7fbff', emissive: '#a7dfff', emissiveIntensity: 0.45 }));
  screen.position.set(0, 1.2, 0.95);
  scene.add(screen);

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.25), mat('#ffd36e', 0.55));
  keyboard.position.set(0, 0.94, 1.15);
  scene.add(keyboard);

  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.9), mat('#ff9b91'));
  seat.position.y = 0.55;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 0.18), mat('#f28bb5'));
  back.position.set(0, 1.05, -0.35);
  chair.add(seat, back);
  chair.position.set(-1.6, 0, 1.4);
  scene.add(chair);

  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.5, 16), mat('#ffb88f'));
  pot.position.y = 0.25;
  const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.6, 18, 18), mat('#b89bea'));
  foliage.position.y = 1;
  plant.add(pot, foliage);
  plant.position.set(2.1, 0, 1.8);
  scene.add(plant);

  const npc = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.05, 6, 12), mat('#8f7ad8'));
  body.position.y = 0.95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), mat('#ffd6bd'));
  head.position.y = 1.8;
  npc.add(body, head);
  npc.position.set(-2.2, 0, -0.5);
  scene.add(npc);

  const label = document.createElement('div');
  label.className = 'world3d-label';
  label.textContent = options.label || 'Lokasi kerja';
  container.appendChild(label);

  const resize = () => {
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', resize);

  let animationHandle = null;
  const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    animationHandle = requestAnimationFrame(tick);
  };
  tick();

  return {
    scene, camera, renderer, controls,
    destroy() {
      cancelAnimationFrame(animationHandle);
      window.removeEventListener('resize', resize);
      label.remove();
      container.innerHTML = '';
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
      renderer.dispose();
      controls.dispose();
    },
  };
}
