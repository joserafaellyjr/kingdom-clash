import * as THREE from "three";

// Stage 2 extends the existing Stage 1 scene, camera, and commander.
export function createBattleSystem({ scene, camera, controls, status }) {
  const gold = new THREE.MeshStandardMaterial({ color: 0xd3b56f, metalness: 0.35, roughness: 0.5 });
  const red = new THREE.MeshStandardMaterial({ color: 0x8b3029, roughness: 0.9 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x928d7e, roughness: 1 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x55564e, roughness: 1 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x68472e, roughness: 0.9 });
  const ui = document.createElement("div");
  ui.innerHTML = `
    <div id="kc-battle-hud" class="kc-hidden">
      <div><small>OBJECTIVE</small><strong id="kc-objective">Clear the opposing line</strong></div>
      <div><small>TIME</small><strong id="kc-timer">03:00</strong></div>
      <div><small>OPPOSING</small><strong id="kc-count">3 LEFT</strong></div>
    </div>
    <div id="kc-muster" class="kc-hidden">PRESS <b>E</b> TO MUSTER FOR BATTLE</div>
    <div id="kc-message">Explore the courtyard. The red standard marks the battle muster point.</div>
    <div id="kc-result" class="kc-hidden"><section><small>BATTLE COMPLETE</small><h2 id="kc-result-title">Victory!</h2><p id="kc-result-copy"></p><button id="kc-retry">FIGHT AGAIN</button><button id="kc-return">RETURN TO COURTYARD</button></section></div>`;
  document.body.appendChild(ui);
  const style = document.createElement("style");
  style.textContent = `
    .kc-hidden{display:none!important}
    #kc-battle-hud{position:fixed;z-index:20;top:105px;left:50%;transform:translateX(-50%);display:flex;gap:28px;padding:12px 20px;border:1px solid #d9bd7b88;border-radius:7px;background:#0a100de8;color:#f3f0e5;font:13px system-ui;pointer-events:none}
    #kc-battle-hud div{display:flex;flex-direction:column;gap:5px;text-align:center}#kc-battle-hud small{color:#d2b878;font-size:9px;font-weight:900;letter-spacing:.16em}
    #kc-muster{position:fixed;z-index:21;left:50%;bottom:76px;transform:translateX(-50%);padding:12px 18px;border:1px solid #d9bd7b;border-radius:6px;background:#101810ed;color:#f3e7c7;font:800 12px system-ui;white-space:nowrap;pointer-events:none}
    #kc-message{position:fixed;z-index:20;left:50%;bottom:18px;transform:translateX(-50%);max-width:90%;padding:8px 12px;border:1px solid #ffffff35;border-radius:5px;background:#0a0f0bd9;color:#eee9dd;font:11px system-ui;text-align:center;pointer-events:none}
    #kc-result{position:fixed;z-index:40;inset:0;display:grid;place-items:center;background:#080d0bd9;backdrop-filter:blur(7px);font-family:system-ui;color:#f3f0e5}
    #kc-result section{width:min(90vw,410px);padding:36px;border:1px solid #d9bd7b88;border-radius:12px;background:#202b22;text-align:center}
    #kc-result small{color:#d7bd7b;font-size:10px;font-weight:900;letter-spacing:.2em}
    #kc-result h2{font:38px Georgia,serif;margin:12px 0}#kc-result p{color:#c8cec2;font-size:13px;line-height:1.6}
    #kc-result button{display:block;width:100%;margin-top:10px;padding:13px;border:0;border-radius:5px;background:#c8a665;color:#17170f;font-weight:900;cursor:pointer}
    #kc-result button+button{background:#ffffff12;color:#f3f0e5;border:1px solid #d9bd7b66}
    @media(max-width:700px){#kc-battle-hud{top:150px;gap:12px;padding:9px 12px;font-size:11px}}
  `;
  document.head.appendChild(style);
  const $ = id => document.getElementById(id);
  const muster = new THREE.Vector2(0, -4);
  const capture = new THREE.Vector2(0, -4);
  const state = { active:false, finished:false, remaining:3, time:180, hold:0, ready:true, swingStart:0, swing:0 };
  const guards = [];

  function addBox(parent, x,y,z,sx,sy,sz,material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
    mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  function addCylinder(parent,x,y,z,rt,rb,h,material,n=8) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),material);
    mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }

  // Standard at the far end of the existing courtyard.
  addCylinder(scene,0,3.1,-4,.07,.07,6.2,dark);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.6),red);
  flag.position.set(1.05,4.55,-4); flag.castShadow=true; scene.add(flag);
  const crest = new THREE.Mesh(new THREE.CircleGeometry(.4,6),gold);
  crest.position.set(1.06,4.55,-3.98); scene.add(crest);

  // Capture point and opposing training guards are added to the SAME world.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.8,.13,8,48),gold);
  ring.rotation.x=Math.PI/2; ring.position.set(capture.x,.14,capture.y); scene.add(ring); ring.visible=false;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(4.65,48),new THREE.MeshBasicMaterial({color:0xd5b56e,transparent:true,opacity:.09,side:THREE.DoubleSide}));
  disc.rotation.x=-Math.PI/2; disc.position.set(capture.x,.035,capture.y); scene.add(disc); disc.visible=false;

  function makeGuard(x,z) {
    const group=new THREE.Group(); group.position.set(x,0,z); scene.add(group);
    addCylinder(group,0,1.02,0,.34,.4,1.25,red);
    addCylinder(group,0,1.92,0,.29,.31,.58,stone);
    addBox(group,0,1.82,0,.95,.18,.18,red);
    addBox(group,-.57,1.45,0,.22,.8,.22,red);
    addBox(group,.57,1.45,0,.22,.8,.22,red);
    addBox(group,0,.37,0,.22,.75,.22,wood);
    addBox(group,.48,1.22,.28,.62,.8,.12,dark);
    addBox(group,0,2.55,0,1.25,.12,.08,dark);
    const bar=addBox(group,0,2.55,.06,1.2,.075,.04,new THREE.MeshBasicMaterial({color:0x75b86b}));
    group.visible=false; guards.push({group,bar,hp:3,alive:true});
  }
  makeGuard(-8,-15); makeGuard(0,-18); makeGuard(8,-15);

  const sword=new THREE.Group();
  addCylinder(sword,0,0,0,.075,.09,.42,wood).rotation.x=Math.PI/2;
  addBox(sword,0,.23,0,.58,.09,.12,gold);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.13,1.35,.045),new THREE.MeshStandardMaterial({color:0xc8d0d0,metalness:.8,roughness:.25}));
  blade.position.y=.93; sword.add(blade);
  sword.position.set(.62,-.57,-1.12); sword.rotation.set(-.22,-.3,.18); camera.add(sword); sword.visible=false;

  function counter(){ $("kc-count").textContent=state.remaining+" LEFT"; }
  function start(){
    if(state.active||state.finished)return;
    state.active=true;state.remaining=3;state.time=180;state.hold=0;
    guards.forEach(g=>{g.hp=3;g.alive=true;g.group.visible=true;g.bar.scale.x=1;g.bar.position.x=0;});
    sword.visible=true;ring.visible=true;disc.visible=true;
    $("kc-battle-hud").classList.remove("kc-hidden");$("kc-muster").classList.add("kc-hidden");
    $("kc-objective").textContent="Clear the opposing line";$("kc-timer").textContent="03:00";counter();
    $("kc-message").textContent="The battle has begun. Defeat all three guards.";
    if(status)status.textContent="Battle active · Clear the opposing line";
  }
  function strike(){
    if(!state.active||!controls.isLocked||!state.ready)return;
    state.ready=false;state.swing=1;state.swingStart=performance.now();setTimeout(()=>state.ready=true,560);
    const direction=new THREE.Vector3();camera.getWorldDirection(direction);
    let target=null,closest=3.8;
    for(const g of guards){
      if(!g.alive)continue;
      const to=g.group.position.clone().add(new THREE.Vector3(0,1.35,0)).sub(camera.position);
      const distance=to.length();
      if(to.normalize().dot(direction)>.72&&distance<closest){target=g;closest=distance;}
    }
    if(!target){$("kc-message").textContent="Missed. Move closer and aim at a guard.";return;}
    target.hp--;const ratio=target.hp/3;target.bar.scale.x=Math.max(.001,ratio);target.bar.position.x=-(1-ratio)*.6;
    if(target.hp<=0){
      target.alive=false;target.group.visible=false;state.remaining--;counter();
      $("kc-message").textContent="Guard defeated · "+state.remaining+" remaining";
      if(state.remaining===0)$("kc-objective").textContent="Capture the central standard";
    }else $("kc-message").textContent="Strike landed · "+target.hp+" hits remain";
  }
  function end(won){
    state.active=false;state.finished=won;controls.unlock();
    $("kc-result").classList.remove("kc-hidden");
    $("kc-result-title").textContent=won?"Victory!":"Defeat";
    $("kc-result-copy").textContent=won?"You secured the standard. Your first battle is won.":"The timer expired. Regroup and try again.";
  }
  function reset(){
    state.active=false;state.finished=false;state.remaining=3;state.time=180;state.hold=0;state.ready=true;state.swing=0;
    guards.forEach(g=>{g.hp=3;g.alive=true;g.group.visible=false;g.bar.scale.x=1;g.bar.position.x=0;});
    sword.visible=false;ring.visible=false;disc.visible=false;
    $("kc-battle-hud").classList.add("kc-hidden");$("kc-result").classList.add("kc-hidden");
    camera.position.set(0,1.7,12);counter();
  }
  window.addEventListener("keydown",e=>{
    if(e.code==="KeyE"&&controls.isLocked&&!state.active&&!state.finished&&Math.hypot(camera.position.x-muster.x,camera.position.z-muster.y)<5.2)start();
  });
  window.addEventListener("mousedown",e=>{if(e.button===0)strike();});
  $("kc-retry").addEventListener("click",()=>{reset();controls.lock();});
  $("kc-return").addEventListener("click",()=>{reset();controls.lock();});

  function update(delta,now){
    if(!state.active&&!state.finished&&controls.isLocked&&Math.hypot(camera.position.x-muster.x,camera.position.z-muster.y)<5.2)$("kc-muster").classList.remove("kc-hidden");
    else $("kc-muster").classList.add("kc-hidden");
    if(state.active){
      state.time-=delta;
      if(state.time<=0){end(false);return;}
      const m=Math.floor(state.time/60),s=Math.floor(state.time%60);
      $("kc-timer").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
      if(state.remaining===0){
        const inside=Math.hypot(camera.position.x-capture.x,camera.position.z-capture.y)<4.8;
        state.hold=inside?state.hold+delta:Math.max(0,state.hold-delta*.7);
        $("kc-objective").textContent="Hold the standard · "+Math.max(0,Math.ceil(8-state.hold))+"s";
        $("kc-message").textContent=inside?"Securing standard · "+Math.floor(state.hold/8*100)+"%":"Enter the golden circle to capture the standard.";
        ring.scale.setScalar(inside?1.04:1);
        if(state.hold>=8)end(true);
      }
    }
    if(state.swing>0){
      state.swing=Math.max(0,1-(now-state.swingStart)/300);
      const amount=Math.sin((1-state.swing)*Math.PI);
      sword.rotation.x=-.22-amount*1.15;sword.rotation.z=.18-amount*.55;
    }else{
      sword.rotation.x=THREE.MathUtils.damp(sword.rotation.x,-.22,12,delta);
      sword.rotation.z=THREE.MathUtils.damp(sword.rotation.z,.18,12,delta);
    }
  }
  return { update };
}
