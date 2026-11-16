import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const $ = (s) => document.querySelector(s);
const game = $("#game");
const startScreen = $("#start-screen");
const pauseScreen = $("#pause-screen");
const resultScreen = $("#result-screen");
const message = $("#message");
const objectiveText = $("#objective-text");
const timerText = $("#timer");
const healthText = $("#health");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aaeb1);
scene.fog = new THREE.Fog(0x9aaeb1, 42, 125);

const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.1, 220);
camera.position.set(0, 1.7, 24);
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
scene.add(new THREE.HemisphereLight(0xe6eddf, 0x5a5142, 1.8));
const sun = new THREE.DirectionalLight(0xffe2b7, 2.4);
sun.position.set(-25, 38, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -55; sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -55;
scene.add(sun);

const mat = {
  grass:new THREE.MeshStandardMaterial({color:0x647b4e,roughness:1}),
  path:new THREE.MeshStandardMaterial({color:0x9b8d72,roughness:1}),
  stone:new THREE.MeshStandardMaterial({color:0x898477,roughness:1}),
  dark:new THREE.MeshStandardMaterial({color:0x56564e,roughness:1}),
  wood:new THREE.MeshStandardMaterial({color:0x67482f,roughness:1}),
  blue:new THREE.MeshStandardMaterial({color:0x315c9b,roughness:.85}),
  red:new THREE.MeshStandardMaterial({color:0x9b332b,roughness:.85}),
  gold:new THREE.MeshStandardMaterial({color:0xd3b56f,metalness:.45,roughness:.5}),
  metal:new THREE.MeshStandardMaterial({color:0x60645f,metalness:.65,roughness:.4})
};
function addBox(parent,x,y,z,sx,sy,sz,material){
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function addCylinder(parent,x,y,z,rt,rb,h,material,n=10){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),material);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(170,170),mat.grass);
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const road=new THREE.Mesh(new THREE.PlaneGeometry(18,95),mat.path);
road.rotation.x=-Math.PI/2;road.position.set(0,.02,-8);road.receiveShadow=true;scene.add(road);

// Field boundaries and low defensive earthworks.
addBox(scene,0,1.8,-43,82,3,1.5,mat.stone);
addBox(scene,-41,1.8,-4,1.5,3,80,mat.stone);
addBox(scene,41,1.8,-4,1.5,3,80,mat.stone);
addBox(scene,0,1.8,35,82,3,1.5,mat.stone);
for(let x=-39;x<=39;x+=4){addBox(scene,x,3.8,-43,1.5,.8,1.8,mat.dark);}
for(const x of [-34,-24,24,34]){
  addBox(scene,x,1.2,-29,7,2.4,2.2,mat.stone);
  addBox(scene,x,2.7,-29,7,.35,2.4,mat.dark);
}
function tree(x,z,s=1){
  addCylinder(scene,x,1.3*s,z,.24*s,.36*s,2.6*s,mat.wood,6);
  const leaves=new THREE.Mesh(new THREE.ConeGeometry(2.1*s,4.7*s,7),new THREE.MeshStandardMaterial({color:0x3d5a3d,roughness:1}));
  leaves.position.set(x,4*s,z);leaves.castShadow=true;scene.add(leaves);
}
for(let i=0;i<20;i++){const side=i%2?1:-1;tree(side*(48+(i%3)*3),-35+Math.floor(i/2)*8,.8+(i%4)*.1);}

// Banner standards mark the opposing side and the capture objective.
function standard(x,z,color,scale=1){
  addCylinder(scene,x,3*scale,z,.055,.055,6*scale,mat.metal,8);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.8*scale,2.3*scale),color);
  cloth.position.set(x+.85*scale,4.25*scale,z);cloth.castShadow=true;scene.add(cloth);
  const crest=new THREE.Mesh(new THREE.CircleGeometry(.32*scale,6),mat.gold);
  crest.position.set(x+.86*scale,4.25*scale,z+.02);scene.add(crest);
}
standard(-34,-38,mat.blue,.9);standard(34,-38,mat.red,.9);
standard(0,-7,mat.red,1.15);

// A ring of stones defines the capture zone.
const captureRing=new THREE.Mesh(new THREE.TorusGeometry(5.2,.13,8,48),mat.gold);
captureRing.rotation.x=Math.PI/2;captureRing.position.set(0,.14,-7);scene.add(captureRing);
const captureDisc=new THREE.Mesh(new THREE.CircleGeometry(5.05,48),new THREE.MeshBasicMaterial({color:0xd5b56e,transparent:true,opacity:.08,side:THREE.DoubleSide}));
captureDisc.rotation.x=-Math.PI/2;captureDisc.position.set(0,.035,-7);scene.add(captureDisc);

// Low-poly opposing target guards. They are deliberately stationary in Stage 2.
const targets=[];
function makeGuard(x,z,index){
  const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
  addCylinder(group,0,1.02,0,.34,.4,1.25,mat.red,8);
  addCylinder(group,0,1.92,0,.29,.31,.58,mat.stone,8);
  addBox(group,0,1.82,0,.95,.18,.18,mat.red);
  addBox(group,-.57,1.45,0,.22,.8,.22,mat.red);
  addBox(group,.57,1.45,0,.22,.8,.22,mat.red);
  addBox(group,0,.37,0,.22,.75,.22,mat.wood);
  const shield=addBox(group,.48,1.22,.28,.62,.8,.12,mat.blue);
  shield.rotation.z=-.08;
  const barBg=addBox(group,0,2.55,0,1.25,.12,.08,mat.dark);
  const bar=addBox(group,-.0,2.55,.06,1.2,.075,.04,new THREE.MeshBasicMaterial({color:0x75b86b}));
  targets.push({group,hp:3,maxHp:3,bar,barBg,alive:true,index});
}
makeGuard(-8,-16,0);makeGuard(0,-19,1);makeGuard(8,-16,2);

// First-person sword, attached to the camera, with a small swing animation.
const sword=new THREE.Group();
const grip=addCylinder(sword,0,0,0,.075,.09,.42,mat.wood,8);grip.rotation.x=Math.PI/2;
const guard=addBox(sword,0,.23,0,.58,.09,.12,mat.gold);
const blade=new THREE.Mesh(new THREE.BoxGeometry(.13,1.35,.045),new THREE.MeshStandardMaterial({color:0xc8d0d0,metalness:.8,roughness:.25}));
blade.position.y=.93;blade.castShadow=true;sword.add(blade);
const pommel=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),mat.gold);pommel.position.y=-.24;sword.add(pommel);
sword.position.set(.62,-.57,-1.12);sword.rotation.set(-.22,-.3,.18);camera.add(sword);

const keys=new Set();
const worldUp=new THREE.Vector3(0,1,0);
let verticalSpeed=0,canJump=true,lastTime=performance.now();
const player={health:100,time:180,remaining:3,capture:0,won:false,ended:false};
let attackReady=true,attackMotion=0,swordStart=null;
const PLAYER_HEIGHT=1.7,GRAVITY=24,JUMP=7.8;
const bounds={minX:-38,maxX:38,minZ:-39,maxZ:30};
function resetBattle(){
  player.health=100;player.time=180;player.remaining=3;player.capture=0;player.won=false;player.ended=false;
  targets.forEach(t=>{t.hp=3;t.alive=true;t.group.visible=true;t.bar.scale.x=1;t.bar.position.x=0;});
  camera.position.set(0,1.7,24);verticalSpeed=0;canJump=true;attackReady=true;attackMotion=0;
  timerText.textContent="03:00";healthText.textContent="100 HP";
  objectiveText.textContent="Clear the opposing line";message.textContent="The battle has begun";
  resultScreen.classList.add("hidden");startScreen.classList.add("hidden");pauseScreen.classList.add("hidden");
}
function finish(won){
  player.ended=true;player.won=won;controls.unlock();resultScreen.classList.remove("hidden");
  $("#result-eyebrow").textContent=won?"VICTORY":"DEFEAT";
  $("#result-title").textContent=won?"The standard is yours!":"The field is lost.";
  $("#result-description").textContent=won?"Your side has secured the frontier. A commander’s first victory.":"The battle clock ran out before the standard was secured. Regroup and try again.";
  message.textContent=won?"Battle won":"Battle lost";
}
function strike(){
  if(!controls.isLocked||!attackReady||player.ended)return;
  attackReady=false;attackMotion=1;swordStart=performance.now();
  $("#swing-flash").classList.remove("active");void $("#swing-flash").offsetWidth;$("#swing-flash").classList.add("active");
  setTimeout(()=>attackReady=true,560);
  const origin=camera.position.clone();
  const direction=new THREE.Vector3();camera.getWorldDirection(direction);
  let best=null,bestDistance=3.6;
  for(const t of targets){
    if(!t.alive)continue;
    const point=t.group.position.clone().add(new THREE.Vector3(0,1.35,0));
    const to=point.sub(origin);const distance=to.length();const alignment=to.normalize().dot(direction);
    if(alignment>.72&&distance<bestDistance){best=t;bestDistance=distance;}
  }
  if(best){
    best.hp--;const ratio=best.hp/best.maxHp;
    best.bar.scale.x=Math.max(.001,ratio);best.bar.position.x=-(1-ratio)*.6;
    if(best.hp<=0){
      best.alive=false;best.group.visible=false;player.remaining--;
      message.textContent="Opposing guard cleared · "+player.remaining+" remaining";
      if(player.remaining===0){objectiveText.textContent="Capture the central standard";message.textContent="The line is clear. Secure the standard!";}
    }else message.textContent="Strike landed · "+best.hp+" guard strength remaining";
  }else message.textContent="Strike missed · move closer and aim at a guard";
}
window.addEventListener("mousedown",e=>{if(e.button===0)strike();});
window.addEventListener("keydown",e=>{
  keys.add(e.code);
  if(["Space","ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();
  if(e.code==="Space"&&canJump&&controls.isLocked){verticalSpeed=JUMP;canJump=false;}
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());

function update(delta,now){
  if(controls.isLocked&&!player.ended){
    player.time-=delta;
    if(player.time<=0){player.time=0;timerText.textContent="00:00";finish(false);return;}
    const mins=Math.floor(player.time/60),secs=Math.floor(player.time%60);
    timerText.textContent=String(mins).padStart(2,"0")+":"+String(secs).padStart(2,"0");
    const p=controls.getObject();
    let forward=new THREE.Vector3();controls.getDirection(forward);forward.y=0;forward.normalize();
    const right=new THREE.Vector3().crossVectors(forward,worldUp);
    const move=new THREE.Vector3();
    if(keys.has("KeyW"))move.add(forward);
    if(keys.has("KeyS"))move.sub(forward);
    if(keys.has("KeyD"))move.add(right);
    if(keys.has("KeyA"))move.sub(right);
    if(move.lengthSq()>0){
      move.normalize();const speed=keys.has("ShiftLeft")||keys.has("ShiftRight")?9.3:6.2;
      p.addScaledVector(move,speed*delta);
    }
    p.x=THREE.MathUtils.clamp(p.x,bounds.minX,bounds.maxX);
    p.z=THREE.MathUtils.clamp(p.z,bounds.minZ,bounds.maxZ);
    verticalSpeed-=GRAVITY*delta;p.y+=verticalSpeed*delta;
    if(p.y<=PLAYER_HEIGHT){p.y=PLAYER_HEIGHT;verticalSpeed=0;canJump=true;}
    const inCapture=Math.hypot(p.x,p.z+7)<5.1;
    if(player.remaining===0){
      objectiveText.textContent="Capture standard · "+Math.max(0,Math.ceil(8-player.capture))+"s";
      if(inCapture)player.capture+=delta;else player.capture=Math.max(0,player.capture-delta*.7);
      if(player.capture>=8){finish(true);return;}
      captureRing.material=mat.gold;
      captureRing.scale.setScalar(inCapture?1.03:1);
      message.textContent=inCapture?"Holding the ground · "+Math.floor(player.capture/8*100)+"%":"Enter the marked circle to capture";
    }
  }
  if(attackMotion>0){
    attackMotion=Math.max(0,1-(now-swordStart)/300);
    const t=1-attackMotion;
    sword.rotation.x=-.22-Math.sin(t*Math.PI)*1.15;
    sword.rotation.z=.18-Math.sin(t*Math.PI)*.55;
  }else{sword.rotation.x=THREE.MathUtils.damp(sword.rotation.x,-.22,12,delta);sword.rotation.z=THREE.MathUtils.damp(sword.rotation.z,.18,12,delta);}
}
controls.addEventListener("lock",()=>{startScreen.classList.add("hidden");pauseScreen.classList.add("hidden");});
controls.addEventListener("unlock",()=>{
  keys.clear();
  if(player.ended)return;
  if(!startScreen.classList.contains("hidden"))return;
  pauseScreen.classList.remove("hidden");
});
$("#start-button").addEventListener("click",()=>{resetBattle();controls.lock();});
$("#resume-button").addEventListener("click",()=>controls.lock());
$("#restart-button").addEventListener("click",()=>{resetBattle();controls.lock();});
function animate(now){
  requestAnimationFrame(animate);const delta=Math.min((now-lastTime)/1000,.05);lastTime=now;
  update(delta,now);renderer.render(scene,camera);
}
requestAnimationFrame(animate);
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
