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
  scene.background = new THREE.Color(options.background || '#101b18');
  scene.fog = new THREE.Fog(options.background || '#101b18', 8, 30);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
  camera.position.set(8, 8, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 18;
  controls.target.set(0, 1.2, 0);

  const hemi = new THREE.HemisphereLight('#dfefff', '#182d28', 1.2);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight('#fff9e7', 1.5);
  sun.position.set(6, 12, 4);
  sun.castShadow = true;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 5.5, 0.8, 32),
    new THREE.MeshStandardMaterial({ color: '#2d463d', roughness: 0.9, metalness: 0.1 })
  );
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 3.2, 5.5),
    new THREE.MeshStandardMaterial({ color: '#335648', roughness: 0.9, metalness: 0.15 })
  );
  room.position.y = 1.6;
  room.position.z = -0.3;
  room.castShadow = true;
  room.receiveShadow = true;
  scene.add(room);

  const businessColor = new THREE.Color(options.color || '#6ec9a4');
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.7, 1.2),
    new THREE.MeshStandardMaterial({ color: businessColor, metalness: 0.1, roughness: 0.8 })
  );
  desk.position.set(0, 0.9, 0.6);
  desk.castShadow = true;
  scene.add(desk);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.7, 0.12),
    new THREE.MeshStandardMaterial({ color: '#dfeaf1', emissive: '#5d7e8a', emissiveIntensity: 0.6 })
  );
  screen.position.set(0, 1.2, 0.95);
  scene.add(screen);

  const chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.2, 0.9),
    new THREE.MeshStandardMaterial({ color: '#d9ba8a', roughness: 0.8 })
  );
  chair.position.set(-1.6, 0.55, 1.4);
  scene.add(chair);

  const plant = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.42, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: '#b08a5b', roughness: 0.8 })
  );
  pot.position.y = 0.25;
  const foliage = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 18, 18),
    new THREE.MeshStandardMaterial({ color: '#4ab780', roughness: 0.7 })
  );
  foliage.position.y = 1;
  plant.add(pot, foliage);
  plant.position.set(2.1, 0, 1.8);
  scene.add(plant);

  const npcMaterial = new THREE.MeshStandardMaterial({ color: '#f6d5a7', roughness: 0.9 });
  const npc = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.2, 6, 12), npcMaterial);
  npc.position.set(-2.2, 1.1, -0.5);
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
    scene,
    camera,
    renderer,
    controls,
    destroy() {
      cancelAnimationFrame(animationHandle);
      window.removeEventListener('resize', resize);
      label.remove();
      container.innerHTML = '';
      renderer.dispose();
      controls.dispose();
    },
  };
}
