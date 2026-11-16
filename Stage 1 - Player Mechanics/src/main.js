import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const game = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const pauseScreen = document.querySelector("#pause-screen");
const status = document.querySelector("#status");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9eb4bc);
scene.fog = new THREE.FogExp2(0x9eb4bc, 0.009);

const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.1, 260);
camera.position.set(0, 1.7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
game.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 0.78;

scene.add(new THREE.HemisphereLight(0xdcecff, 0x655744, 1.8));
const sun = new THREE.DirectionalLight(0xffe3b5, 2.5);
sun.position.set(-28, 42, 24);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -52;
sun.shadow.camera.right = 52;
sun.shadow.camera.top = 52;
sun.shadow.camera.bottom = -52;
sun.shadow.bias = -0.00025;
scene.add(sun);

const mats = {
  grass: new THREE.MeshStandardMaterial({ color: 0x657c4c, roughness: 1 }),
  grass2: new THREE.MeshStandardMaterial({ color: 0x778653, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x928d7e, roughness: 0.95 }),
  stone2: new THREE.MeshStandardMaterial({ color: 0x777568, roughness: 1 }),
  darkStone: new THREE.MeshStandardMaterial({ color: 0x55564e, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x68472e, roughness: 0.9 }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0x98704a, roughness: 0.9 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x514238, roughness: 1 }),
  path: new THREE.MeshStandardMaterial({ color: 0x9d9077, roughness: 1 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x4d514d, metalness: 0.65, roughness: 0.48 }),
  banner: new THREE.MeshStandardMaterial({ color: 0x8b3029, roughness: 1, side: THREE.DoubleSide })
};

const colliders = [];
function box(parent, x, y, z, sx, sy, sz, material, solid = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (solid) colliders.push({ x, z, hx: sx / 2, hz: sz / 2 });
  return mesh;
}
function cylinder(parent, x, y, z, rt, rb, h, material, sides = 10) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), mats.grass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const path = new THREE.Mesh(new THREE.PlaneGeometry(12, 100), mats.path);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.015, -27);
path.receiveShadow = true;
scene.add(path);

// Uneven paving stones along the main route.
for (let z = 20; z >= -70; z -= 4) {
  for (let x = -4; x <= 4; x += 2) {
    const stone = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 3.5), mats.stone2);
    stone.position.set(x + (Math.random() - 0.5) * 0.18, 0.06, z + (Math.random() - 0.5) * 0.2);
    stone.rotation.y = (Math.random() - 0.5) * 0.05;
    stone.receiveShadow = true;
    scene.add(stone);
  }
}

// Courtyard walls, crenellations, and gate opening.
box(scene, 0, 3, -38, 72, 6, 2, mats.stone, true);
box(scene, -36, 3, -4, 2, 6, 70, mats.stone, true);
box(scene, 36, 3, -4, 2, 6, 70, mats.stone, true);
box(scene, -24, 3, 31, 24, 6, 2, mats.stone, true);
box(scene, 24, 3, 31, 24, 6, 2, mats.stone, true);
for (let x = -34; x <= 34; x += 4) box(scene, x, 6.5, -38, 1.5, 1.1, 2.2, mats.darkStone);
for (let z = -32; z <= 28; z += 4) {
  box(scene, -36, 6.5, z, 2.2, 1.1, 1.5, mats.darkStone);
  box(scene, 36, 6.5, z, 2.2, 1.1, 1.5, mats.darkStone);
}

function tower(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  scene.add(group);
  cylinder(group, 0, 3.5, 0, 2.1, 2.35, 7, mats.stone, 8);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.45, 3.4, 8), mats.roof);
  roof.position.y = 8.7;
  roof.castShadow = true;
  group.add(roof);
  box(group, 0, 6.8, 0, 4.8, 0.55, 4.8, mats.darkStone);
  colliders.push({ x, z, hx: 2.5, hz: 2.5 });
}
[[-34,-36],[34,-36],[-34,28],[34,28]].forEach(([x,z]) => tower(x,z));

// Training hall, timber braces, roof ridge and entrance.
box(scene, 0, 4, -32, 17, 8, 9, mats.wood, true);
for (const x of [-7.8, 7.8]) {
  box(scene, x, 4, -27.4, 0.35, 8, 0.35, mats.woodLight);
  box(scene, x, 4, -36.5, 0.35, 8, 0.35, mats.woodLight);
}
const hallRoof = new THREE.Mesh(new THREE.ConeGeometry(12, 6, 4), mats.roof);
hallRoof.rotation.y = Math.PI / 4;
hallRoof.scale.set(1, 1, 0.7);
hallRoof.position.set(0, 10, -32);
hallRoof.castShadow = true;
scene.add(hallRoof);
box(scene, 0, 1.5, -27.35, 4.2, 3, 0.25, mats.darkStone);

// Practice frames and straw dummies.
for (const x of [-13, 13]) {
  box(scene, x, 1.5, -8, 0.35, 3, 0.35, mats.wood, true);
  box(scene, x, 1.5, -15, 0.35, 3, 0.35, mats.wood, true);
  box(scene, x, 3.05, -11.5, 0.35, 0.35, 7.3, mats.wood);
}
function dummy(x, z) {
  box(scene, x, 1.35, z, 0.22, 2.7, 0.22, mats.wood, true);
  const body = cylinder(scene, x, 1.9, z, 0.48, 0.48, 1.05, mats.woodLight, 8);
  body.rotation.z = Math.PI / 2;
  cylinder(scene, x, 2.85, z, 0.36, 0.36, 0.62, mats.woodLight, 8);
  box(scene, x, 1.85, z, 1.5, 0.16, 0.18, mats.wood, true);
}
dummy(-13, -18);
dummy(13, -18);

function barrel(x, z) {
  cylinder(scene, x, 0.65, z, 0.55, 0.62, 1.3, mats.wood, 10);
  for (const y of [0.28, 1.02]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.055, 6, 12), mats.metal);
    band.rotation.x = Math.PI / 2;
    band.position.set(x, y, z);
    scene.add(band);
  }
  colliders.push({ x, z, hx: 0.7, hz: 0.7 });
}
[[-18, 7], [18, 4], [-19, -20], [19, -22], [-7, 17], [8, 17]].forEach(([x,z]) => barrel(x,z));

// Crates and stacked supplies.
function crate(x, z, size = 1.4) {
  box(scene, x, size / 2, z, size, size, size, mats.wood, true);
  for (const y of [0.18, size - 0.18]) {
    box(scene, x, y, z - size / 2 - 0.012, size * 0.9, 0.09, 0.04, mats.woodLight);
    box(scene, x - size / 2 - 0.012, y, z, 0.04, 0.09, size * 0.9, mats.woodLight);
  }
}
crate(-23, 12, 1.5); crate(-21.5, 12, 1.2); crate(23, 12, 1.6);

// Banners flutter subtly from wall-mounted poles.
function banner(x, z, rotation = 0) {
  const pole = cylinder(scene, x, 5.1, z, 0.07, 0.07, 4.2, mats.metal, 8);
  pole.rotation.z = Math.PI / 2;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.4, 8, 8), mats.banner);
  cloth.position.set(x + 0.95, 4.7, z);
  cloth.rotation.y = rotation;
  cloth.castShadow = true;
  scene.add(cloth);
  const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.35, 6), new THREE.MeshStandardMaterial({ color: 0xd8bd7a, side: THREE.DoubleSide }));
  emblem.position.set(x + 0.96, 4.85, z + 0.015);
  emblem.rotation.y = rotation;
  scene.add(emblem);
}
banner(-34.8, -5, Math.PI / 2);
banner(34.8, -5, -Math.PI / 2);
banner(0, -36, 0);

// Torches with warm point lights.
const torchLights = [];
function torch(x, z) {
  box(scene, x, 1.5, z, 0.16, 3, 0.16, mats.wood);
  const flameMat = new THREE.MeshStandardMaterial({ color: 0xff9c35, emissive: 0xff5a12, emissiveIntensity: 2 });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.62, 7), flameMat);
  flame.position.set(x, 3.2, z);
  scene.add(flame);
  const light = new THREE.PointLight(0xff9b48, 2.2, 11, 2);
  light.position.set(x, 3.3, z);
  scene.add(light);
  torchLights.push({ flame, light, phase: Math.random() * 6 });
}
[[-10,-25],[10,-25],[-29,0],[29,0]].forEach(([x,z]) => torch(x,z));

// Trees and distant hills outside the keep.
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x55402b });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x3e5b3d, roughness: 1 });
function tree(x, z, s = 1) {
  cylinder(scene, x, 1.5*s, z, 0.25*s, 0.4*s, 3*s, trunkMat, 6);
  for (let i = 0; i < 3; i++) {
    const leaves = new THREE.Mesh(new THREE.ConeGeometry((2.1-i*0.25)*s, 3.1*s, 7), leafMat);
    leaves.position.set(x, (3.5+i*1.35)*s, z);
    leaves.castShadow = true;
    scene.add(leaves);
  }
}
for (let i = 0; i < 28; i++) {
  const side = i % 2 === 0 ? -1 : 1;
  const z = -58 + Math.floor(i / 2) * 6.5;
  tree(side * (43 + (i % 3) * 3), z, 0.8 + (i % 4) * 0.12);
}
const hillMat = new THREE.MeshStandardMaterial({ color: 0x71816c, roughness: 1 });
for (let i = 0; i < 9; i++) {
  const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), hillMat);
  hill.scale.set(15 + (i%3)*4, 7 + (i%2)*3, 12);
  hill.position.set(-90 + i*22, -2, -85 - (i%3)*8);
  scene.add(hill);
}

// Player movement, grounded jumping, sprint, and obstacle collision.
const keys = new Set();
const moveDirection = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);
let verticalSpeed = 0;
let canJump = true;
let lastTime = performance.now();
const PLAYER_HEIGHT = 1.7;
const WALK_SPEED = 6.2;
const SPRINT_SPEED = 9.5;
const GRAVITY = 24;
const JUMP_SPEED = 7.8;
const bounds = { minX: -33.2, maxX: 33.2, minZ: -35.2, maxZ: 29.2 };
const playerRadius = 0.38;

function blocked(x, z) {
  return colliders.some(c => x + playerRadius > c.x - c.hx && x - playerRadius < c.x + c.hx &&
    z + playerRadius > c.z - c.hz && z - playerRadius < c.z + c.hz);
}
function updateMovement(delta) {
  if (!controls.isLocked) return;
  moveDirection.set(0, 0, 0);
  if (keys.has("KeyW")) moveDirection.z -= 1;
  if (keys.has("KeyS")) moveDirection.z += 1;
  if (keys.has("KeyA")) moveDirection.x -= 1;
  if (keys.has("KeyD")) moveDirection.x += 1;
  moveDirection.normalize();

  const player = controls.getObject();
  if (moveDirection.lengthSq() > 0) {
    const forward = new THREE.Vector3();
    controls.getDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, worldUp);
    const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const speed = sprinting ? SPRINT_SPEED : WALK_SPEED;
    const displacement = new THREE.Vector3()
      .addScaledVector(forward, -moveDirection.z)
      .addScaledVector(right, moveDirection.x)
      .normalize().multiplyScalar(speed * delta);
    const nextX = THREE.MathUtils.clamp(player.position.x + displacement.x, bounds.minX, bounds.maxX);
    const nextZ = THREE.MathUtils.clamp(player.position.z + displacement.z, bounds.minZ, bounds.maxZ);
    if (!blocked(nextX, player.position.z)) player.position.x = nextX;
    if (!blocked(player.position.x, nextZ)) player.position.z = nextZ;
  }

  verticalSpeed -= GRAVITY * delta;
  player.position.y += verticalSpeed * delta;
  if (player.position.y <= PLAYER_HEIGHT) {
    player.position.y = PLAYER_HEIGHT;
    verticalSpeed = 0;
    canJump = true;
  }
}
window.addEventListener("keydown", event => {
  keys.add(event.code);
  if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
  if (event.code === "Space" && canJump && controls.isLocked) {
    verticalSpeed = JUMP_SPEED;
    canJump = false;
  }
});
window.addEventListener("keyup", event => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());

controls.addEventListener("lock", () => {
  startScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  game.classList.add("playing");
  status.textContent = "Training grounds · Commander ready";
});
controls.addEventListener("unlock", () => {
  keys.clear();
  game.classList.remove("playing");
  if (!startScreen.classList.contains("hidden")) return;
  pauseScreen.classList.remove("hidden");
  status.textContent = "Paused";
});
document.querySelector("#start-button").addEventListener("click", () => controls.lock());
document.querySelector("#resume-button").addEventListener("click", () => controls.lock());

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  updateMovement(delta);
  torchLights.forEach(({ flame, light, phase }) => {
    const flicker = Math.sin(now * 0.009 + phase) * 0.12 + Math.sin(now * 0.017 + phase) * 0.08;
    flame.scale.y = 1 + flicker;
    light.intensity = 2.1 + flicker * 2;
  });
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
