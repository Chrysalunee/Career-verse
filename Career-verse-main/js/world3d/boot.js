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
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b8d0c5');
  scene.fog = new THREE.Fog('#b8d0c5', 17, 34);

  const camera = new THREE.PerspectiveCamera(52, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
  camera.position.set(0, 6.5, 9);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth || 640, container.clientHeight || 420);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight('#f1fbff', '#526c5d', 1.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff2d7', 2.2);
  sun.position.set(-5, 11, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
  scene.add(sun);

  const mat = (color, roughness = 0.82, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(13, 0.35, 11), mat('#c6b69c'));
  floor.position.y = -0.2; floor.receiveShadow = true; scene.add(floor);
  const rug = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.04, 5.4), mat('#789487'));
  rug.position.set(0, 0.005, -0.2); scene.add(rug);
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(13, 4.4, 0.25), mat('#e8e2d3'));
  wallBack.position.set(0, 2, -5.5); wallBack.receiveShadow = true; scene.add(wallBack);
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.4, 11), mat('#d6dfd4'));
  wallLeft.position.set(-6.5, 2, 0); scene.add(wallLeft);
  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.4, 11), mat('#d6dfd4'));
  wallRight.position.set(6.5, 2, 0); scene.add(wallRight);
  // Window panels and mullions give the room depth without blocking the playable floor.
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.65, 0.06), new THREE.MeshStandardMaterial({ color: '#a9d8e1', roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.72 }));
  windowGlass.position.set(-3.5, 2.65, -5.34); scene.add(windowGlass);
  for (const x of [-4.9, -3.5, -2.1]) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.8, 0.1), mat('#f7f1e6'));
    mullion.position.set(x, 2.65, -5.28); scene.add(mullion);
  }

  const accent = options.color || '#4e9c79';
  const desk = new THREE.Group();
  const desktop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.25), mat('#8b6044'));
  desktop.position.y = 1.05; desktop.castShadow = true; desk.add(desktop);
  for (const x of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), mat('#554b43'));
    leg.position.set(x, 0.5, 0); leg.castShadow = true; desk.add(leg);
  }
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.62, 0.09), mat('#263b3c', 0.25, 0.25));
  monitor.position.set(0, 1.48, -0.25); desk.add(monitor);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.49), new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.28 }));
  screen.position.set(0, 1.48, -0.198); desk.add(screen);
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.035, 0.28), mat('#d8ded7'));
  keyboard.position.set(0, 1.17, 0.28); desk.add(keyboard);
  desk.position.set(0.5, 0, -2.2); scene.add(desk);

  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.85), mat('#375a50'));
  seat.position.y = 0.75; chair.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.05, 0.16), mat('#375a50'));
  back.position.set(0, 1.25, -0.34); chair.add(back);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 12), mat('#6b7771', 0.3, 0.65));
  stem.position.y = 0.35; chair.add(stem);
  chair.position.set(0.5, 0, -0.85); scene.add(chair);

  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.5, 16), mat('#b77e57'));
  pot.position.y = 0.25; plant.add(pot);
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 14), mat('#4b8962'));
  leaves.position.y = 0.95; leaves.scale.set(0.85, 1.15, 0.85); plant.add(leaves);
  plant.position.set(4.8, 0, -3.6); scene.add(plant);

  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.65), mat('#9d795d'));
  counter.position.set(-4.7, 0.52, -3.8); counter.castShadow = true; scene.add(counter);
  const coffeeMachine = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.5), mat('#384b48', 0.32, 0.2));
  coffeeMachine.position.set(-4.7, 1.38, -3.8); coffeeMachine.castShadow = true; scene.add(coffeeMachine);

  // Simple NPC silhouette, placed near the work desk.
  const npc = new THREE.Group();
  const npcBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.7, 5, 10), mat('#b86f55'));
  npcBody.position.y = 0.9; npc.add(npcBody);
  const npcHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), mat('#d7a77e'));
  npcHead.position.y = 1.55; npc.add(npcHead);
  const npcHair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 10), mat('#40342f'));
  npcHair.position.set(0, 1.68, -0.03); npcHair.scale.set(1, 0.62, 1); npc.add(npcHair);
  npc.position.set(-2.6, 0, -1.2); scene.add(npc);

  // Player avatar built from actual 3D geometry (no flat character sprite).
  const player = new THREE.Group();
  const skin = mat('#d9a47c');
  const shirt = mat('#3d8068');
  const pants = mat('#34424a');
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 14), skin);
  head.position.y = 1.62; player.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 12), mat('#302a29'));
  hair.position.set(0, 1.75, -0.035); hair.scale.set(1, 0.58, 1); player.add(hair);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.58, 5, 12), shirt);
  torso.position.y = 1.02; player.add(torso);
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.48, 4, 8), shirt);
  leftArm.position.set(-0.37, 1.02, 0); player.add(leftArm);
  const rightArm = leftArm.clone(); rightArm.position.x = 0.37; player.add(rightArm);
  const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.48, 4, 8), pants);
  leftLeg.position.set(-0.14, 0.38, 0); player.add(leftLeg);
  const rightLeg = leftLeg.clone(); rightLeg.position.x = 0.14; player.add(rightLeg);
  player.traverse(obj => { if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; } });
  player.position.set(-2.5, 0, 2.5); scene.add(player);

  const prompt = document.createElement('div');
  prompt.className = 'world3d-prompt';
  prompt.setAttribute('aria-live', 'polite');
  container.appendChild(prompt);
  const hud = document.createElement('div');
  hud.className = 'world3d-controls-hint';
  hud.innerHTML = '<strong>WASD</strong> Bergerak <span>·</span> <strong>Drag mouse</strong> Kamera <span>·</span> <strong>E</strong> Interaksi <span>·</span> <strong>Shift</strong> Lari';
  container.appendChild(hud);
  const clockHud = document.createElement('div');
  clockHud.className = 'world3d-clock';
  clockHud.setAttribute('aria-live', 'polite');
  container.appendChild(clockHud);

  const keys = new Set();
  let nearObject = null;
  let cameraYaw = 0;
  let cameraPitch = 0.66;
  let draggingCamera = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  const canvas = renderer.domElement;
  const onPointerDown = event => {
    if (event.button !== 0) return;
    draggingCamera = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = event => {
    if (!draggingCamera) return;
    const dx = event.clientX - lastPointerX;
    const dy = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    cameraYaw -= dx * 0.006;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch + dy * 0.004, 0.32, 1.12);
  };
  const onPointerUp = () => { draggingCamera = false; };
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  const onKeyDown = event => {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'shift', 'e'].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === 'e' && nearObject) options.onInteract?.(nearObject);
  };
  const onKeyUp = event => keys.delete(event.key.toLowerCase());
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  const resize = () => {
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
  };
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let frame = null;
  let nearDesk = false;
  let totalGameMinutes = Number(options.totalGameMinutes) || (Number(options.startMinutes) || 9 * 60);
  let gameMinutes = totalGameMinutes % 1440;
  const sessionStartTotalMinutes = totalGameMinutes;
  const startingCalendarDay = Number(options.calendarDay) || Number(options.day) || 1;
  const desiredCamera = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.04);
    totalGameMinutes += dt * 1.8;
    gameMinutes = totalGameMinutes % 1440;
    const calendarDay = startingCalendarDay + Math.floor((totalGameMinutes - sessionStartTotalMinutes) / 1440);
    const hour = Math.floor(gameMinutes / 60);
    const minute = Math.floor(gameMinutes % 60);
    clockHud.textContent = `Hari ${calendarDay} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const forward = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
    const side = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    direction.set(
      side * Math.cos(cameraYaw) - forward * Math.sin(cameraYaw),
      0,
      -side * Math.sin(cameraYaw) - forward * Math.cos(cameraYaw),
    );
    const moving = direction.lengthSq() > 0;
    if (moving) {
      direction.normalize();
      const speed = keys.has('shift') ? 5.2 : 3.2;
      const nextX = THREE.MathUtils.clamp(player.position.x + direction.x * speed * dt, -5.6, 5.6);
      const nextZ = THREE.MathUtils.clamp(player.position.z + direction.z * speed * dt, -4.7, 4.6);
      const blocked = (x, z) =>
        (Math.abs(x - 0.5) < 1.38 && Math.abs(z + 2.2) < 0.82) ||
        (Math.hypot(x - 0.5, z + 0.85) < 0.72) ||
        (Math.abs(x + 4.7) < 0.62 && Math.abs(z + 3.8) < 0.62);
      if (!blocked(nextX, player.position.z)) player.position.x = nextX;
      if (!blocked(player.position.x, nextZ)) player.position.z = nextZ;
      player.rotation.y = Math.atan2(direction.x, direction.z);
      const swing = Math.sin(clock.elapsedTime * 10) * 0.42;
      leftLeg.rotation.x = swing; rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing * 0.65; rightArm.rotation.x = swing * 0.65;
    } else {
      leftLeg.rotation.x *= 0.75; rightLeg.rotation.x *= 0.75;
      leftArm.rotation.x *= 0.75; rightArm.rotation.x *= 0.75;
    }
    const deskDistance = player.position.distanceTo(new THREE.Vector3(0.5, 0, -2.2));
    const npcDistance = player.position.distanceTo(npc.position);
    const coffeeDistance = player.position.distanceTo(new THREE.Vector3(-4.7, 0, -3.8));
    nearDesk = deskDistance < 2.05;
    const nearNpc = npcDistance < 1.8;
    const nearCoffee = coffeeDistance < 1.8;
    nearObject = nearDesk ? { id: 'work-desk', label: 'Meja kerja', task: options.task || null } : nearNpc ? { id: 'npc-ratna', label: 'Bu Ratna' } : nearCoffee ? { id: 'coffee-machine', label: 'Mesin kopi' } : null;
    prompt.textContent = nearDesk ? 'Tekan E untuk memulai aktivitas kerja' : nearNpc ? 'Tekan E untuk berbicara dengan Bu Ratna' : nearCoffee ? 'Tekan E untuk membuat kopi (+energi)' : 'Jelajahi kantor Kopi Kilat';
    prompt.classList.toggle('is-active', Boolean(nearObject));
    // Bu Ratna follows a simple office routine between her desk and the counter.
    const npcTargetX = Math.sin(clock.elapsedTime * 0.22) > 0.35 ? -2.6 : -3.8;
    npc.position.x += (npcTargetX - npc.position.x) * (1 - Math.exp(-0.55 * dt));
    npc.position.z = -1.2 + Math.sin(clock.elapsedTime * 0.8) * 0.22;
    npc.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.22;
    // A subtle daylight cycle changes the sun intensity and sky tone over the workday.
    const daylight = 0.72 + 0.28 * Math.sin(((gameMinutes / 1440) * Math.PI * 2) - Math.PI / 2);
    sun.intensity = 1.35 + daylight * 0.95;
    scene.background.set(daylight < 0.45 ? '#718b91' : '#b8d0c5');
    const cameraDistance = 7.4;
    desiredCamera.set(
      player.position.x + Math.sin(cameraYaw) * cameraDistance,
      player.position.y + Math.sin(cameraPitch) * cameraDistance + 1.0,
      player.position.z + Math.cos(cameraYaw) * cameraDistance,
    );
    camera.position.lerp(desiredCamera, 1 - Math.exp(-5 * dt));
    lookTarget.set(player.position.x, player.position.y + 0.95, player.position.z - 0.15);
    camera.lookAt(lookTarget);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  tick();

  return {
    scene, camera, renderer, player,
    getGameMinutes: () => gameMinutes,
    getGameClock: () => ({ clockMinutes: Math.round(gameMinutes), totalGameMinutes: Math.round(totalGameMinutes), calendarDay: startingCalendarDay + Math.floor((totalGameMinutes - sessionStartTotalMinutes) / 1440) }),
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      prompt.remove(); hud.remove(); clockHud.remove();
      renderer.dispose();
      scene.traverse(obj => { if (obj.isMesh) { obj.geometry.dispose(); if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      container.innerHTML = '';
    },
  };
}
