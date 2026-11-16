import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const game = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const pauseScreen = document.querySelector("#pause-screen");
const status = document.querySelector("#status");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa7a2);
scene.fog = new THREE.FogExp2(0x9aa7a2, 0.0065);

const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.1, 260);
camera.position.set(0, 1.7, 7);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
game.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 0.75;
scene.add(new THREE.HemisphereLight(0xd9e4e5, 0x51463c, 1.65));
const sun = new THREE.DirectionalLight(0xffe2bf, 2.2);
sun.position.set(-25, 42, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -85; sun.shadow.camera.right = 85;
sun.shadow.camera.top = 85; sun.shadow.camera.bottom = -85;
scene.add(sun);

const mat = (color, roughness=0.95, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const materials = {
  mud:mat(0x514b3f), mud2:mat(0x62594a), grass:mat(0x626b50),
  sand:mat(0x98866a), sandDark:mat(0x76664f), wood:mat(0x594330),
  metal:mat(0x454b4b,.55,.55), blue:mat(0x344e68), blue2:mat(0x263b50),
  red:mat(0x77433c), red2:mat(0x59302e), skin:mat(0xb58b6a),
  helmet:mat(0x59645c,.45,.55), boot:mat(0x302d29), cloth:mat(0xb4aa8e)
};
function box(parent,x,y,z,sx,sy,sz,material,cast=true) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
  m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m;
}
function cylinder(parent,x,y,z,rt,rb,h,material,segments=10) {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function groundPatch(x,z,sx,sz,material) {
  const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),material);
  m.rotation.x=-Math.PI/2; m.position.set(x,.012,z); m.receiveShadow=true; scene.add(m); return m;
}

// Open muddy front line: a road between two opposing flag bases.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(220,220),materials.grass);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
groundPatch(0,0,15,150,materials.mud);
for(let i=0;i<65;i++){
  const x=(Math.random()-.5)*13, z=65-Math.random()*130;
  const patch=new THREE.Mesh(new THREE.CircleGeometry(.25+Math.random()*.8,9),materials.mud2);
  patch.rotation.x=-Math.PI/2; patch.position.set(x,.025,z); patch.scale.y=.45; scene.add(patch);
}
// Low trench lines and sandbag cover flank the road.
function sandbag(x,y,z,rot=0){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; scene.add(g);
  const bag= new THREE.Mesh(new THREE.SphereGeometry(.48,10,8),materials.sand);
  bag.scale.set(1,.58,.68); bag.castShadow=true; bag.receiveShadow=true; g.add(bag);
  return g;
}
for(const side of [-1,1]){
  for(let row=0;row<3;row++){
    for(let i=0;i<13;i++){
      const z=-49+i*8+(row%2)*1.5;
      sandbag(side*(10.5+row*.72),.42,z,side*.08);
    }
  }
  // Long shallow trench bank.
  box(scene,side*14,-.15,0,2,.7,116,materials.mud2,false);
}
function crater(x,z,r){
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.28,7,20),materials.mud2);
  rim.rotation.x=Math.PI/2; rim.position.set(x,.08,z); rim.scale.y=.72; scene.add(rim);
  const center=new THREE.Mesh(new THREE.CircleGeometry(r*.82,20),materials.mud);
  center.rotation.x=-Math.PI/2; center.position.set(x,.025,z); center.scale.y=.72; scene.add(center);
}
[[-7,-27],[7,-12],[-5,19],[6,39],[-18,-38],[18,30]].forEach(([x,z])=>crater(x,z,1.5+Math.random()));
function crate(x,z){
  box(scene,x,.65,z,1.3,1.3,1.3,materials.wood);
  for(let y=.18;y<1.2;y+=.82) box(scene,x,y,z-.67,1.15,.08,.06,materials.sandDark);
}
[[-8,9],[8,25],[-17,-4],[17,-30]].forEach(([x,z])=>crate(x,z));
function flagBase(x,z,color,label){
  const pole=cylinder(scene,x,3,z,.09,.09,6,materials.metal,8);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.5),mat(color));
  cloth.position.set(x+1.05,4.7,z); cloth.castShadow=true; scene.add(cloth);
  box(scene,x,0.15,z,5,.3,5,materials.sandDark);
  const marker= new THREE.Mesh(new THREE.CircleGeometry(3.4,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.13,side:THREE.DoubleSide}));
  marker.rotation.x=-Math.PI/2; marker.position.set(x,.035,z); scene.add(marker);
  return {pole,cloth,marker,label};
}
const friendlyBase=flagBase(0,61,0x426b91,"BLUE BASE");
const enemyBase=flagBase(0,-61,0x9a4a40,"RED BASE");
// Distant low hills and sparse broken tree silhouettes.
for(let i=0;i<16;i++){
  const x=-95+i*12, z=-88-(i%3)*9;
  const hill=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat(0x747c6a));
  hill.scale.set(10,4+(i%3),8); hill.position.set(x,-2,z); scene.add(hill);
}
for(let i=0;i<22;i++){
  const x=(i%2?1:-1)*(25+Math.random()*25),z=-65+Math.random()*130;
  cylinder(scene,x,1.5,z,.16,.28,3,materials.wood,6);
  const branch=box(scene,x,3,z,.22,2,.22,materials.wood); branch.rotation.z=.3;
}

// First-person prop: stylized, non-functional visual model for the game.
const weapon=new THREE.Group(); camera.add(weapon);
box(weapon,.34,-.34,-.72,.16,.17,.7,materials.wood);
box(weapon,.34,-.25,-.98,.12,.12,.65,materials.metal);
box(weapon,.34,-.43,-.66,.12,.3,.15,materials.wood);
box(weapon,.34,-.16,-.62,.08,.1,.22,materials.metal);
weapon.position.set(0,0,0);
const shield=new THREE.Group(); camera.add(shield);
const shieldPlate=box(shield,-.53,-.28,-.82,.86,1.15,.12,materials.metal);
shieldPlate.material=mat(0x59605b,.42,.7);
box(shield,-.53,-.28,-.89,.72,1.01,.035,materials.sandDark);
shield.visible=false;

// Soldier models use clear team colors, helmets, limbs and visible equipment.
const soldiers=[];
function makeSoldier(team,x,z,index){
  const friendly=team==="blue", group=new THREE.Group(); group.position.set(x,0,z); scene.add(group);
  const uniform=friendly?materials.blue:materials.red;
  const trim=friendly?materials.blue2:materials.red2;
  const torso=box(group,0,1.12,0,.72,.88,.4,uniform);
  const head=cylinder(group,0,1.78,0,.22,.23,.38,materials.skin,10);
  const helmet=cylinder(group,0,1.99,0,.29,.3,.2,materials.helmet,10);
  const brim=cylinder(group,0,1.91,0,.34,.34,.06,materials.helmet,12);
  const leftArm=box(group,-.48,1.18,0,.2,.72,.22,uniform); leftArm.rotation.z=-.12;
  const rightArm=box(group,.48,1.18,0,.2,.72,.22,uniform); rightArm.rotation.z=.12;
  const leftLeg=box(group,-.2,.42,0,.24,.72,.27,trim);
  const rightLeg=box(group,.2,.42,0,.24,.72,.27,trim);
  box(group,-.2,.08,-.02,.28,.16,.42,materials.boot);
  box(group,.2,.08,-.02,.28,.16,.42,materials.boot);
  const rifle=box(group,.16,1.13,-.42,.13,.13,.92,materials.wood);
  box(group,.16,1.13,-.87,.07,.07,.22,materials.metal);
  const hpBack=box(group,0,2.28,0,.9,.09,.06,materials.red2,false);
  const hpFill=box(group,0,2.28,.04,.86,.055,.025,mat(0x78a66c),false);
  const soldier={team,group,hp:100,maxHp:100,alive:true,cooldown:1+Math.random()*1.4,
    hpFill,index,step:Math.random()*6,parts:{leftLeg,rightLeg,leftArm,rightArm},target:null};
  soldiers.push(soldier); return soldier;
}
for(let i=0;i<10;i++){
  const x=((i%5)-2)*2.3, z=8+Math.floor(i/5)*3.2;
  makeSoldier("blue",x,z,i);
}
for(let i=0;i<10;i++){
  const x=((i%5)-2)*2.5, z=-39-Math.floor(i/5)*3.4;
  makeSoldier("red",x,z,i);
}
const playerState={health:100,ammo:8,maxAmmo:8,reloading:false,shield:false,aiming:false,sprinting:false,lastW:0,capture:0,won:false};
const keys=new Set();
const raycaster=new THREE.Raycaster();
const center=new THREE.Vector2(0,0);
const statusText=t=>{status.textContent=t;};
function alive(team){return soldiers.filter(s=>s.team===team&&s.alive);}
function updateHud(){
  document.querySelector("#kc-health").textContent=Math.max(0,Math.ceil(playerState.health));
  document.querySelector("#kc-ammo").textContent=playerState.reloading?"RELOADING":playerState.ammo+" / "+playerState.maxAmmo;
  document.querySelector("#kc-allies").textContent=alive("blue").length;
  document.querySelector("#kc-enemies").textContent=alive("red").length;
  document.querySelector("#kc-shield").textContent=playerState.shield?"DEPLOYED":"STOWED";
}
function makeTracer(from,to,color=0xffd28a){
  const geometry=new THREE.BufferGeometry().setFromPoints([from,to]);
  const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.9}));
  scene.add(line); setTimeout(()=>{scene.remove(line);geometry.dispose();line.material.dispose();},110);
}
function damageSoldier(s,amount){
  if(!s.alive)return;
  s.hp=Math.max(0,s.hp-amount);
  const ratio=s.hp/s.maxHp;
  s.hpFill.scale.x=Math.max(.001,ratio); s.hpFill.position.x=-(1-ratio)*.43;
  if(s.hp<=0){s.alive=false;s.group.visible=false;}
}
function fire(){
  if(!controls.isLocked||playerState.reloading||playerState.won)return;
  if(playerState.ammo<=0){statusText("Out of ammo · Press R to reload");return;}
  playerState.ammo--; updateHud();
  raycaster.setFromCamera(center,camera);
  const targets=alive("red").map(s=>s.group);
  const hits=raycaster.intersectObjects(targets,true);
  if(hits.length){
    let obj=hits[0].object;
    while(obj.parent&&!soldiers.some(s=>s.group===obj))obj=obj.parent;
    const target=soldiers.find(s=>s.group===obj);
    if(target){damageSoldier(target,50);statusText("Hit confirmed");}
  }else statusText("Shot fired");
  updateHud();
}
function reload(){
  if(!controls.isLocked||playerState.reloading||playerState.ammo===playerState.maxAmmo)return;
  playerState.reloading=true;updateHud();statusText("Reloading...");
  setTimeout(()=>{playerState.ammo=playerState.maxAmmo;playerState.reloading=false;updateHud();statusText("Ready");},1500);
}
function toggleShield(){
  playerState.shield=!playerState.shield;shield.visible=playerState.shield;
  updateHud();statusText(playerState.shield?"Armor shield deployed":"Armor shield retracted");
}
function nearestOpponent(s){
  const foes=alive(s.team==="blue"?"red":"blue");
  let best=null,dist=Infinity;
  for(const f of foes){const d=s.group.position.distanceTo(f.group.position);if(d<dist){dist=d;best=f;}}
  return best;
}
function soldierCombat(delta,now){
  for(const s of soldiers){
    if(!s.alive)continue;
    const target=nearestOpponent(s); if(!target)continue;
    const dx=target.group.position.x-s.group.position.x,dz=target.group.position.z-s.group.position.z;
    const distance=Math.hypot(dx,dz);
    s.group.rotation.y=Math.atan2(dx,dz);
    if(distance>12){
      const speed=s.team==="blue"?1.65:1.35;
      s.group.position.x+=dx/distance*speed*delta;
      s.group.position.z+=dz/distance*speed*delta;
      s.step+=delta*7;
      s.parts.leftLeg.rotation.x=Math.sin(s.step)*.45;
      s.parts.rightLeg.rotation.x=-Math.sin(s.step)*.45;
    }else{
      s.parts.leftLeg.rotation.x=0;s.parts.rightLeg.rotation.x=0;
      s.cooldown-=delta;
      if(s.cooldown<=0){
        s.cooldown=1.6+Math.random()*1.1;
        const from=s.group.position.clone().add(new THREE.Vector3(0,1.35,0));
        const to=target.group.position.clone().add(new THREE.Vector3(0,1.25,0));
        makeTracer(from,to,s.team==="blue"?0x9ecbff:0xffb19a);
        damageSoldier(target,8);
        if(target.team==="blue"&&target.hp<=0)updateHud();
      }
    }
  }
}
function playerIncomingDamage(delta){
  // Enemy pressure is represented as a simple game-only health drain at close range.
  const threats=alive("red").filter(s=>s.group.position.distanceTo(camera.position)<18);
  if(!threats.length)return;
  const attacker=threats[0];
  const toward=new THREE.Vector3().subVectors(attacker.group.position,camera.position).normalize();
  const facing=new THREE.Vector3();camera.getWorldDirection(facing);
  const shieldBlocks=playerState.shield&&facing.dot(toward)<-.12;
  if(!shieldBlocks)playerState.health=Math.max(0,playerState.health-2.2*delta*threats.length);
  updateHud();
  if(playerState.health<=0){playerState.health=100;statusText("You regrouped at base");camera.position.set(0,1.7,7);updateHud();}
}
function captureUpdate(delta){
  if(alive("red").length>0){playerState.capture=0;return;}
  const distance=Math.hypot(camera.position.x-enemyBase.pole.position.x,camera.position.z+61);
  if(distance<5){
    playerState.capture+=delta;
    document.querySelector("#kc-objective").textContent="CAPTURING ENEMY FLAG · "+Math.min(100,Math.floor(playerState.capture/8*100))+"%";
    if(playerState.capture>=8){
      playerState.won=true;statusText("Victory · Enemy flag captured");
      document.querySelector("#kc-result").classList.remove("hidden");
      controls.unlock();
    }
  }else{
    playerState.capture=Math.max(0,playerState.capture-delta*.5);
    document.querySelector("#kc-objective").textContent="Enemy line cleared · Capture the red flag";
  }
}
function updateMovement(delta){
  if(!controls.isLocked)return;
  const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();
  const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();
  const direction=new THREE.Vector3();
  if(keys.has("KeyW"))direction.add(forward);
  if(keys.has("KeyS"))direction.sub(forward);
  if(keys.has("KeyD"))direction.add(right);
  if(keys.has("KeyA"))direction.sub(right);
  if(direction.lengthSq()>0){
    direction.normalize();
    const speed=playerState.sprinting?10:playerState.shield?3.7:5.8;
    camera.position.addScaledVector(direction,speed*delta);
    camera.position.x=THREE.MathUtils.clamp(camera.position.x,-22,22);
    camera.position.z=THREE.MathUtils.clamp(camera.position.z,-72,72);
  }
}
window.addEventListener("keydown",e=>{
  if(e.code==="ShiftLeft"||e.code==="ShiftRight"){if(!e.repeat)toggleShield();e.preventDefault();return;}
  if(e.code==="KeyW"){
    const now=performance.now();
    if(now-playerState.lastW<330)playerState.sprinting=true;
    playerState.lastW=now;
  }
  keys.add(e.code);
  if(e.code==="KeyR")reload();
  if(e.code==="Space")e.preventDefault();
});
window.addEventListener("keyup",e=>{
  keys.delete(e.code);
  if(e.code==="KeyW")playerState.sprinting=false;
});
window.addEventListener("blur",()=>{keys.clear();playerState.sprinting=false;});
window.addEventListener("mousedown",e=>{
  if(e.button===0)fire();
  if(e.button===2){playerState.aiming=true;camera.fov=52;camera.updateProjectionMatrix();weapon.position.set(-.08,-.01,-.03);}
});
window.addEventListener("mouseup",e=>{
  if(e.button===2){playerState.aiming=false;camera.fov=74;camera.updateProjectionMatrix();weapon.position.set(0,0,0);}
});
window.addEventListener("contextmenu",e=>e.preventDefault());
controls.addEventListener("lock",()=>{
  startScreen.classList.add("hidden");pauseScreen.classList.add("hidden");game.classList.add("playing");
  statusText("Hold the line · Advance toward the red flag");
});
controls.addEventListener("unlock",()=>{
  keys.clear();playerState.sprinting=false;game.classList.remove("playing");
  if(!startScreen.classList.contains("hidden"))return;
  pauseScreen.classList.remove("hidden");statusText("Paused");
});
document.querySelector("#start-button").addEventListener("click",()=>controls.lock());
document.querySelector("#resume-button").addEventListener("click",()=>controls.lock());
document.querySelector("#kc-restart").addEventListener("click",()=>location.reload());

function animate(now){
  requestAnimationFrame(animate);
  const delta=Math.min((now-(animate.last||now))/1000,.05);animate.last=now;
  updateMovement(delta);
  if(controls.isLocked&&!playerState.won){
    soldierCombat(delta,now);playerIncomingDamage(delta);captureUpdate(delta);
  }
  updateHud();
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
