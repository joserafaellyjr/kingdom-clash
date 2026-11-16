import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const game = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const pauseScreen = document.querySelector("#pause-screen");
const classScreen = document.querySelector("#class-screen");
const status = document.querySelector("#status");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa7a2);
scene.fog = new THREE.FogExp2(0x8e9992, 0.009);

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
const timber=mat(0x493a2b), timberLight=mat(0x68513a), darkEarth=mat(0x403c33);
for(const side of [-1,1]){
  for(let i=0;i<18;i++){
    const z=-66+i*7.5;
    box(scene,side*9.15,.48,z,.18,1.15,.22,timber);
    box(scene,side*9.15,1.02,z,.26,.12,7.4,timberLight);
    box(scene,side*9.15,.08,z,.2,.16,7.4,darkEarth,false);
  }
  for(let i=0;i<44;i++){
    const z=-67+i*3.1;
    box(scene,side*12.9,.12,z,1.8,.16,2.55,i%3===0?timberLight:timber,false);
  }
}
for(let i=0;i<34;i++){
  const x=(Math.random()-.5)*34,z=(Math.random()-.5)*126;
  const plank=box(scene,x,.12,z,.18+Math.random()*.18,.12,1.2+Math.random()*2,timberLight,false);
  plank.rotation.y=Math.random()*Math.PI;
}
for(let i=0;i<18;i++){
  const x=(Math.random()-.5)*40,z=(Math.random()-.5)*130;
  const mound=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),darkEarth);
  mound.scale.set(1.3+Math.random()*1.5,.25+Math.random()*.25,1.1+Math.random());
  mound.position.set(x,.03,z);mound.receiveShadow=true;scene.add(mound);
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
const frontlineObjectives=[
  {name:"A",label:"FORWARD TRENCH",z:24,x:0,captured:false,progress:0},
  {name:"B",label:"CROSSROADS",z:-5,x:0,captured:false,progress:0},
  {name:"C",label:"REAR BUNKER",z:-34,x:0,captured:false,progress:0}
];
let activeObjective=0;
for(const objective of frontlineObjectives){
  const ring=new THREE.Mesh(new THREE.RingGeometry(5.2,5.65,48),new THREE.MeshBasicMaterial({color:0xc6b58d,transparent:true,opacity:.62,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.set(objective.x,.07,objective.z);scene.add(ring);
  const pole=cylinder(scene,objective.x,2.1,objective.z,.07,.07,4.2,materials.metal,8);
  const banner=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1),mat(0xb69a67));
  banner.position.set(objective.x+.72,3.35,objective.z);scene.add(banner);
  const marker=new THREE.Mesh(new THREE.CircleGeometry(5.15,48),new THREE.MeshBasicMaterial({color:0xc6b58d,transparent:true,opacity:.08,side:THREE.DoubleSide}));
  marker.rotation.x=-Math.PI/2;marker.position.set(objective.x,.045,objective.z);scene.add(marker);
  objective.ring=ring;objective.banner=banner;objective.marker=marker;
}

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
const sleeveMat=mat(0x3c4a42), gloveMat=mat(0x302f2a);
const leftSleeve=box(weapon,-.12,-.48,-.48,.24,.3,.48,sleeveMat); leftSleeve.rotation.z=-.28;
const rightSleeve=box(weapon,.48,-.5,-.48,.24,.3,.48,sleeveMat); rightSleeve.rotation.z=.24;
const leftGlove=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),gloveMat);
leftGlove.position.set(-.1,-.34,-.68);weapon.add(leftGlove);
const rightGlove=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),gloveMat);
rightGlove.position.set(.43,-.34,-.72);weapon.add(rightGlove);
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
  box(group,0,1.2,.27,.42,.55,.2,trim);
  box(group,0,1.3,-.213,.12,.7,.025,materials.sandDark);
  box(group,0,.91,-.01,.76,.1,.44,materials.sandDark);
  box(group,-.34,.91,-.02,.16,.2,.18,trim);
  box(group,.34,.91,-.02,.16,.2,.18,trim);
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
const playerState={health:100,maxHealth:100,ammo:8,maxAmmo:8,reloading:false,shield:false,aiming:false,sprinting:false,lastW:0,capture:0,won:false,classId:"rifleman",reloadMs:1500,speed:5.8};
const classDefinitions={
  rifleman:{name:"Rifleman",description:"Balanced frontline soldier. A reliable all-rounder.",health:100,ammo:8,speed:5.8,reloadMs:1500},
  medic:{name:"Medic",description:"Keeps nearby friendly soldiers in the fight with gradual squad healing.",health:105,ammo:7,speed:5.6,reloadMs:1600},
  engineer:{name:"Engineer",description:"Sturdier frontline defender with extra personal health.",health:125,ammo:7,speed:5.2,reloadMs:1700},
  support:{name:"Support",description:"Carries a larger game-ammo supply before reloading.",health:105,ammo:12,speed:5.1,reloadMs:1900},
  scout:{name:"Scout",description:"Fast-moving role with lighter protection.",health:85,ammo:6,speed:7.1,reloadMs:1400},
  officer:{name:"Officer",description:"Helps nearby friendly troops stay coordinated and fight more effectively.",health:100,ammo:8,speed:5.8,reloadMs:1500}
};
let medicTick=0;
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
  document.querySelector("#kc-class").textContent=classDefinitions[playerState.classId].name.toUpperCase();
}
const hazeCount=260;
const hazePositions=new Float32Array(hazeCount*3), hazeDrift=[];
for(let i=0;i<hazeCount;i++){
  hazePositions[i*3]=(Math.random()-.5)*150;
  hazePositions[i*3+1]=.5+Math.random()*13;
  hazePositions[i*3+2]=(Math.random()-.5)*150;
  hazeDrift.push({x:(Math.random()-.5)*.65,y:.04+Math.random()*.16,z:(Math.random()-.5)*.3});
}
const hazeGeometry=new THREE.BufferGeometry();
hazeGeometry.setAttribute("position",new THREE.BufferAttribute(hazePositions,3));
const haze=new THREE.Points(hazeGeometry,new THREE.PointsMaterial({color:0xc1b8a2,size:.22,transparent:true,opacity:.22,depthWrite:false}));
scene.add(haze);
const dustBursts=[];
function spawnDust(position,tint=0xaaa18e){
  const group=new THREE.Group();group.position.copy(position);scene.add(group);
  const bits=[];
  for(let i=0;i<11;i++){
    const bit=new THREE.Mesh(new THREE.SphereGeometry(.09+Math.random()*.12,6,5),new THREE.MeshBasicMaterial({color:tint,transparent:true,opacity:.52,depthWrite:false}));
    bit.position.set((Math.random()-.5)*.65,Math.random()*.35,(Math.random()-.5)*.65);
    group.add(bit);bits.push({mesh:bit,velocity:new THREE.Vector3((Math.random()-.5)*1.4,.55+Math.random()*1.2,(Math.random()-.5)*1.4)});
  }
  dustBursts.push({group,bits,age:0});
}
function updateAtmosphere(delta){
  const p=hazeGeometry.attributes.position;
  for(let i=0;i<hazeCount;i++){
    const d=hazeDrift[i];
    p.array[i*3]+=d.x*delta;p.array[i*3+1]+=d.y*delta;p.array[i*3+2]+=d.z*delta;
    if(p.array[i*3+1]>14){p.array[i*3+1]=.5;p.array[i*3]=(Math.random()-.5)*150;p.array[i*3+2]=(Math.random()-.5)*150;}
  }
  p.needsUpdate=true;
  for(let i=dustBursts.length-1;i>=0;i--){
    const burst=dustBursts[i];burst.age+=delta;
    for(const bit of burst.bits){
      bit.mesh.position.addScaledVector(bit.velocity,delta);bit.velocity.y-=.18*delta;
      bit.mesh.material.opacity=Math.max(0,.52-burst.age*.48);bit.mesh.scale.multiplyScalar(1+delta*.45);
    }
    if(burst.age>1.1){scene.remove(burst.group);burst.bits.forEach(b=>{b.mesh.geometry.dispose();b.mesh.material.dispose();});dustBursts.splice(i,1);}
  }
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
    if(target){damageSoldier(target,50);spawnDust(hits[0].point,0xb9a98b);statusText("Hit confirmed");}
  }else {spawnDust(camera.position.clone().add(new THREE.Vector3(0,-.4,-5).applyQuaternion(camera.quaternion)),0xa99f8b);statusText("Shot fired");}
  updateHud();
}
function reload(){
  if(!controls.isLocked||playerState.reloading||playerState.ammo===playerState.maxAmmo)return;
  playerState.reloading=true;updateHud();statusText("Reloading...");
  setTimeout(()=>{playerState.ammo=playerState.maxAmmo;playerState.reloading=false;updateHud();statusText("Ready");},playerState.reloadMs);
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
  medicTick+=delta;
  if(playerState.classId==="medic"&&medicTick>=2){
    medicTick=0;
    const nearby=alive("blue").filter(s=>s.group.position.distanceTo(camera.position)<16&&s.hp<s.maxHp);
    nearby.forEach(s=>{s.hp=Math.min(s.maxHp,s.hp+5);const ratio=s.hp/s.maxHp;s.hpFill.scale.x=Math.max(.001,ratio);s.hpFill.position.x=-(1-ratio)*.43;});
  }
  for(const s of soldiers){
    if(!s.alive)continue;
    const target=nearestOpponent(s), objectiveZ=s.team==="blue"?-23:23;
    const frontlineZ=frontlineObjectives[Math.min(activeObjective,frontlineObjectives.length-1)].z;\n    const squadObjectiveZ=s.team==="blue"?frontlineZ:Math.min(61,frontlineZ+13);\n    const toObjective=new THREE.Vector3((s.index%5-2)*1.7,0,squadObjectiveZ-s.group.position.z);
    if(toObjective.lengthSq()>.01)toObjective.normalize();
    const separation=new THREE.Vector3();
    for(const ally of alive(s.team)){
      if(ally===s)continue;
      const offset=new THREE.Vector3().subVectors(s.group.position,ally.group.position),d=offset.length();
      if(d>.01&&d<2.7)separation.addScaledVector(offset.normalize(),(2.7-d)/2.7);
    }
    const targetVector=new THREE.Vector3();let distance=Infinity;
    if(target){targetVector.subVectors(target.group.position,s.group.position);distance=targetVector.length();if(distance>.01)targetVector.normalize();}
    if(target&&distance<=12){
      s.group.rotation.y=Math.atan2(targetVector.x,targetVector.z);
      s.parts.leftLeg.rotation.x=0;s.parts.rightLeg.rotation.x=0;
      s.parts.leftArm.rotation.x=0;s.parts.rightArm.rotation.x=0;s.cooldown-=delta;
      if(s.cooldown<=0){
        const officerBoost=playerState.classId==="officer"&&s.team==="blue"&&s.group.position.distanceTo(camera.position)<18;
        s.cooldown=(officerBoost?1.25:1.6)+Math.random()*.9;
        spawnDust(target.group.position.clone().add(new THREE.Vector3(0,1.1,0)),s.team==="blue"?0xaab9bf:0xbda69a);
        damageSoldier(target,8);if(target.team==="blue"&&target.hp<=0)updateHud();
      }
    }else{
      const move=new THREE.Vector3();
      if(target&&distance>.1)move.addScaledVector(targetVector,.55);
      move.addScaledVector(toObjective,.48).addScaledVector(separation,1.25);
      if(move.lengthSq()>.001){
        move.normalize();s.group.position.addScaledVector(move,(s.team==="blue"?1.55:1.42)*delta);
        s.group.rotation.y=Math.atan2(move.x,move.z);
      }
      s.step+=delta*6.5;
      s.parts.leftLeg.rotation.x=Math.sin(s.step)*.38;s.parts.rightLeg.rotation.x=-Math.sin(s.step)*.38;
      s.parts.leftArm.rotation.x=-Math.sin(s.step)*.2;s.parts.rightArm.rotation.x=Math.sin(s.step)*.2;
    }
    s.group.position.x=THREE.MathUtils.clamp(s.group.position.x,-19,19);
    s.group.position.z=THREE.MathUtils.clamp(s.group.position.z,-65,65);
  }
}
function playerIncomingDamage(delta){
  // Enemy pressure is represented as a simple game-only health drain at close range.
  const threats=alive("red").filter(s=>s.group.position.distanceTo(camera.position)<18);
  if(!threats.length)return;
  const attacker=threats[0];
  const toward=new THREE.Vector3().subVectors(attacker.group.position,camera.position).normalize();
  const facing=new THREE.Vector3();camera.getWorldDirection(facing);
  const shieldBlocks=playerState.shield&&facing.dot(toward)>.12;
  if(!shieldBlocks)playerState.health=Math.max(0,playerState.health-2.2*delta*threats.length);
  updateHud();
  if(playerState.health<=0){playerState.health=100;statusText("You regrouped at base");camera.position.set(0,1.7,7);updateHud();}
}
function captureUpdate(delta){
  if(activeObjective>=frontlineObjectives.length)return;
  const objective=frontlineObjectives[activeObjective];
  const distance=Math.hypot(camera.position.x-objective.x,camera.position.z-objective.z);
  const defenders=alive("red").filter(s=>s.group.position.distanceTo(new THREE.Vector3(objective.x,0,objective.z))<8);
  const allies=alive("blue").filter(s=>s.group.position.distanceTo(new THREE.Vector3(objective.x,0,objective.z))<9);
  const inZone=distance<6.5;
  const contested=defenders.length>0;
  if(inZone&&!contested){
    const supportBonus=Math.min(allies.length,4)*.12;
    objective.progress=Math.min(7,objective.progress+delta*(1+supportBonus));
  }else if(contested){
    objective.progress=Math.max(0,objective.progress-delta*.3);
  }else{
    objective.progress=Math.max(0,objective.progress-delta*.65);
  }
  const percent=Math.floor(objective.progress/7*100);
  objective.ring.material.color.set(contested?0xb65c50:0xd5bd83);
  objective.ring.material.opacity=.55+percent/250;
  objective.banner.material.color.set(contested?0x9a4a40:(inZone?0x6f9b76:0xb69a67));
  document.querySelector("#kc-objective").textContent=contested
    ? "SECTOR "+objective.name+" CONTESTED · "+percent+"%"
    : "SECTOR "+objective.name+" · "+objective.label+" · "+percent+"%";
  if(objective.progress>=7){
    objective.captured=true;
    objective.banner.material.color.set(0x557c9b);
    objective.ring.material.color.set(0x6e9db7);
    objective.ring.material.opacity=.9;
    activeObjective++;
    playerState.capture=0;
    if(activeObjective>=frontlineObjectives.length){
      playerState.won=true;statusText("Victory · All frontline sectors secured");
      document.querySelector("#kc-result").classList.remove("hidden");
      controls.unlock();
    }else{
      statusText("Sector "+objective.name+" secured · Advance to sector "+frontlineObjectives[activeObjective].name);
    }
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
    const speed=(playerState.sprinting?playerState.speed*1.65:playerState.speed)*(playerState.shield?.64:1);
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
  if(!startScreen.classList.contains("hidden")||!classScreen.classList.contains("hidden"))return;
  pauseScreen.classList.remove("hidden");statusText("Paused");
});
document.querySelector("#start-button").addEventListener("click",()=>{startScreen.classList.add("hidden");classScreen.classList.remove("hidden");});
document.querySelectorAll("[data-class]").forEach(button=>button.addEventListener("click",()=>{
  const id=button.dataset.class,chosen=classDefinitions[id];
  playerState.classId=id;playerState.health=chosen.health;playerState.maxHealth=chosen.health;playerState.ammo=chosen.ammo;playerState.maxAmmo=chosen.ammo;playerState.speed=chosen.speed;playerState.reloadMs=chosen.reloadMs;
  document.querySelector("#kc-class").textContent=chosen.name.toUpperCase();
  classScreen.classList.add("hidden");updateHud();controls.lock();
}));
document.querySelector("#resume-button").addEventListener("click",()=>controls.lock());
document.querySelector("#kc-restart").addEventListener("click",()=>location.reload());

function animate(now){
  requestAnimationFrame(animate);
  const delta=Math.min((now-(animate.last||now))/1000,.05);animate.last=now;
  updateMovement(delta);
  if(controls.isLocked&&!playerState.won){
    soldierCombat(delta,now);playerIncomingDamage(delta);captureUpdate(delta);
  }
  updateAtmosphere(delta);
  const moving=keys.has("KeyW")||keys.has("KeyA")||keys.has("KeyS")||keys.has("KeyD");
  if(controls.isLocked){
    const bob=moving?Math.sin(now*.012)*(playerState.sprinting ? .045 : .022):0;
    camera.position.y=1.7+bob;
    weapon.position.y=bob*.75;
  }
  friendlyBase.cloth.rotation.y=Math.sin(now*.0012)*.09;
  enemyBase.cloth.rotation.y=Math.sin(now*.0011+1)*.09;
  updateHud();
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
