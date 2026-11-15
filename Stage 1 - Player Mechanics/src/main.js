import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const game = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const pauseScreen = document.querySelector("#pause-screen");
const status = document.querySelector("#status");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa99b);
scene.fog = new THREE.Fog(0x9aa99b, 38, 115);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 250);
camera.position.set(0, 1.7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
game.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 0.8;
scene.add(new THREE.HemisphereLight(0xe5eddf, 0x5b5948, 2));

const sun = new THREE.DirectionalLight(0xffe5bd, 2.2);
sun.position.set(-22, 35, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -45;
sun.shadow.camera.right = 45;
sun.shadow.camera.top = 45;
sun.shadow.camera.bottom = -45;
scene.add(sun);

const mats = {
  grass: new THREE.MeshStandardMaterial({ color: 0x647b4e, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x888477, roughness: 1 }),
  darkStone: new THREE.MeshStandardMaterial({ color: 0x625f55, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x65472f, roughness: 1 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x55483b, roughness: 1 }),
  path: new THREE.MeshStandardMaterial({ color: 0x9a8b70, roughness: 1 })
};

function box(parent, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), mats.grass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const path = new THREE.Mesh(new THREE.PlaneGeometry(13, 100), mats.path);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0.012, -28);
path.receiveShadow = true;
scene.add(path);

// Courtyard walls and battlements
box(scene, 0, 3, -38, 72, 6, 2, mats.stone);
box(scene, -36, 3, -4, 2, 6, 70, mats.stone);
box(scene, 36, 3, -4, 2, 6, 70, mats.stone);
box(scene, 0, 3, 31, 23, 6, 2, mats.stone);
box(scene, 25.5, 3, 31, 21, 6, 2, mats.stone);

for (let x = -34; x <= 34; x += 4) box(scene, x, 6.5, -38, 1.5, 1.1, 2.2, mats.darkStone);
for (let z = -32; z <= 28; z += 4) {
  box(scene, -36, 6.5, z, 2.2, 1.1, 1.5, mats.darkStone);
  box(scene, 36, 6.5, z, 2.2, 1.1, 1.5, mats.darkStone);
}

function tower(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  scene.add(group);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.35, 7, 8), mats.stone);
  base.position.y = 3.5;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.35, 3.2, 8), mats.roof);
  roof.position.y = 8.6;
  roof.castShadow = true;
  group.add(roof);
  box(group, 0, 6.5, 0, 4.7, 0.55, 4.7, mats.darkStone);
}
[[-34,-36],[34,-36],[-34,28],[34,28]].forEach(([x,z]) => tower(x,z));

// Training hall
box(scene, 0, 4, -33, 17, 8, 9, mats.wood);
const hallRoof = new THREE.Mesh(new THREE.ConeGeometry(12, 6, 4), mats.roof);
hallRoof.rotation.y = Math.PI / 4;
hallRoof.scale.set(1, 1, 0.7);
hallRoof.position.set(0, 10, -33);
hallRoof.castShadow = true;
scene.add(hallRoof);

// Practice frames
for (const x of [-13, 13]) {
  box(scene, x, 1.5, -8, 0.35, 3, 0.35, mats.wood);
  box(scene, x, 1.5, -15, 0.35, 3, 0.35, mats.wood);
  box(scene, x, 3.05, -11.5, 0.35, 0.35, 7.3, mats.wood);
}

function barrel(x,z) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.62,1.3,10), mats.wood);
  mesh.position.set(x,0.65,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  const bandMat = new THREE.MeshStandardMaterial({color:0x45433b,metalness:0.55,roughness:0.65});
  for (const y of [0.28,1.02]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.57,0.055,6,12),bandMat);
    band.rotation.x = Math.PI/2;
    band.position.set(x,y,z);
    scene.add(band);
  }
}
[[-17,7],[17,4],[-19,-20],[19,-22]].forEach(([x,z]) => barrel(x,z));

// Low-poly trees outside the walls
const trunkMat = new THREE.MeshStandardMaterial({color:0x55402b});
const leafMat = new THREE.MeshStandardMaterial({color:0x3e5b3d,roughness:1});
function tree(x,z,s=1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.25*s,.4*s,3*s,6),trunkMat);
  trunk.position.set(x,1.5*s,z);
  trunk.castShadow = true;
  scene.add(trunk);
  const leaves = new THREE.Mesh(new THREE.ConeGeometry(2.1*s,5*s,7),leafMat);
  leaves.position.set(x,4.4*s,z);
  leaves.castShadow = true;
  scene.add(leaves);
}
for (let i=0;i<18;i++) {
  const side = i%2===0 ? -1 : 1;
  const z = -48 + Math.floor(i/2)*7;
  tree(side*(43+(i%3)*3),z,.8+(i%4)*.12);
}

// First-person movement
const keys = new Set();
const moveDirection = new THREE.Vector3();
const worldUp = new THREE.Vector3(0,1,0);
let verticalSpeed = 0;
let canJump = false;
let lastTime = performance.now();

const PLAYER_HEIGHT = 1.7;
const WALK_SPEED = 7;
const SPRINT_SPEED = 11;
const GRAVITY = 24;
const JUMP_SPEED = 8.5;
const bounds = { minX:-32, maxX:32, minZ:-34, maxZ:28 };

function updateMovement(delta) {
  if (!controls.isLocked) return;

  moveDirection.set(0,0,0);
  if (keys.has("KeyW")) moveDirection.z -= 1;
  if (keys.has("KeyS")) moveDirection.z += 1;
  if (keys.has("KeyA")) moveDirection.x -= 1;
  if (keys.has("KeyD")) moveDirection.x += 1;
  moveDirection.normalize();

  if (moveDirection.lengthSq() > 0) {
    const forward = new THREE.Vector3();
    controls.getDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward,worldUp);
    const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? SPRINT_SPEED : WALK_SPEED;
    const displacement = new THREE.Vector3()
      .addScaledVector(forward,-moveDirection.z)
      .addScaledVector(right,moveDirection.x)
      .normalize()
      .multiplyScalar(speed*delta);
    controls.getObject().position.add(displacement);
  }

  verticalSpeed -= GRAVITY*delta;
  controls.getObject().position.y += verticalSpeed*delta;
  if (controls.getObject().position.y <= PLAYER_HEIGHT) {
    controls.getObject().position.y = PLAYER_HEIGHT;
    verticalSpeed = 0;
    canJump = true;
  }

  const p = controls.getObject().position;
  p.x = THREE.MathUtils.clamp(p.x,bounds.minX,bounds.maxX);
  p.z = THREE.MathUtils.clamp(p.z,bounds.minZ,bounds.maxZ);
}

window.addEventListener("keydown", event => {
  keys.add(event.code);
  if (event.code==="Space" && canJump && controls.isLocked) {
    verticalSpeed = JUMP_SPEED;
    canJump = false;
    event.preventDefault();
  }
});
window.addEventListener("keyup", event => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());

controls.addEventListener("lock", () => {
  startScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  game.classList.add("playing");
  status.textContent = "Exploring the training grounds";
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
  const delta = Math.min((now-lastTime)/1000,0.05);
  lastTime = now;
  updateMovement(delta);
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
