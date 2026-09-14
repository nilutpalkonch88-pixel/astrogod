import * as THREE from "three";
/* COSMOS — isolated 3D module: if CDN fails, page logic still works */
try {
const canvas = document.getElementById("cosmos");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 200);
camera.position.z = 16;
scene.add(new THREE.AmbientLight(0xffffff, .55));
const l1 = new THREE.PointLight(0xffd76a, 2.4, 80); l1.position.set(8, 8, 10); scene.add(l1);
const l2 = new THREE.PointLight(0xa855f7, 2.4, 80); l2.position.set(-8, -4, 8); scene.add(l2);
const l3 = new THREE.PointLight(0x22d3ee, 1.6, 80); l3.position.set(0, -8, -4); scene.add(l3);
const wheel = new THREE.Group(); scene.add(wheel);
const R = 9;
const glyphs = ["\u2648","\u2649","\u264A","\u264B","\u264C","\u264D","\u264E","\u264F","\u2650","\u2651","\u2652","\u2653"];
function glyphSprite(ch, color) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"); x.font = "bold 84px serif";
  x.textAlign = "center"; x.textBaseline = "middle";
  x.shadowColor = color; x.shadowBlur = 26; x.fillStyle = color; x.fillText(ch, 64, 68);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  s.scale.setScalar(1.5); return s;
}
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2, col = i % 2 ? "#22d3ee" : "#ffd76a";
  if (i === 0) wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R, .02, 8, 80),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: .5 })));
  const s = glyphSprite(glyphs[i], col);
  s.position.set(Math.cos(a) * R, Math.sin(a) * R, -2); wheel.add(s);
}
const grahas = new THREE.Group(); scene.add(grahas);
const gCols = [0xffd76a,0xe8e8ff,0xff5a5a,0x4ade80,0xfbbf24,0xf9a8d4,0x60a5fa,0x9d7bff,0x5eead4];
const orbs = [];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(.32 + Math.random() * .25, 20, 20),
    new THREE.MeshStandardMaterial({ color: gCols[i], emissive: gCols[i], emissiveIntensity: .55, roughness: .3, metalness: .5 }));
  m.userData = { a: Math.random() * 6.28, r: 2.5 + Math.random() * 3.2, sp: .08 + Math.random() * .15, ph: Math.random() * 6.28 };
  grahas.add(m); orbs.push(m);
}
function starField(n, spread, size, op) {
  const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i += 3) { p[i] = (Math.random() - .5) * spread; p[i+1] = (Math.random() - .5) * spread; p[i+2] = (Math.random() - .5) * 60 - 15; }
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size, transparent: true, opacity: op }));
  scene.add(pts); return pts;
}
const stars1 = starField(700, 70, .07, .7), stars2 = starField(250, 50, .14, .9);
const mouse = { x: 0, y: 0 };
addEventListener("mousemove", e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; });
let sY = 0, tSY = 0; addEventListener("scroll", () => { tSY = scrollY; }, { passive: true });
const docH = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
const clock = new THREE.Clock();
(function anim() {
  const t = clock.getElapsedTime();
  sY += (tSY - sY) * .06;
  const prog = sY / (docH() - innerHeight || 1);
  wheel.rotation.z = t * .04 + prog * 2.2;
  wheel.position.y = -prog * 16; grahas.position.y = -prog * 16; grahas.rotation.y = t * .05;
  orbs.forEach(o => { o.userData.a += o.userData.sp * .01;
    o.position.set(Math.cos(o.userData.a) * o.userData.r, Math.sin(o.userData.a * .8 + o.userData.ph) * 2, Math.sin(o.userData.a) * o.userData.r * .5); });
  stars1.rotation.y = t * .004; stars2.rotation.y = -t * .003;
  camera.position.x += (mouse.x * 1.4 - camera.position.x) * .03;
  camera.position.y += (-prog * 4 + mouse.y * .8 - camera.position.y) * .03;
  camera.lookAt(0, -prog * 14, 0);
  renderer.render(scene, camera); requestAnimationFrame(anim);
})();
window.__cosmos = true;
} catch (e) { console.warn("cosmos off:", e); }
