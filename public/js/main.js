// main.js
// Ponto de entrada do jogo: monta a cena Three.js, instancia os módulos
// (planeta, jogador, controles, câmera, árvores) e roda o loop principal.

import * as THREE from 'three';
import { createPlanet, createSign, PLANET_RADIUS } from './planet.js';
import { createTrees } from './trees.js';
import { createHouses } from './houses.js';
import { createGrass } from './grass.js';
import { createSky } from './sky.js';
import { Player } from './player.js';
import { Controls } from './controls.js';
import { ThirdPersonCamera } from './thirdPersonCamera.js';

const canvas = document.getElementById('game-canvas');

// --- Cena, câmera e renderer ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- Iluminação ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff1c0, 1.5);
sunLight.position.set(120, 140, 60);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 300;
sunLight.shadow.camera.left = -80;
sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top = 80;
sunLight.shadow.camera.bottom = -80;
scene.add(sunLight);

const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(4, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff1a5, transparent: true, opacity: 0.9 })
);
sunMesh.position.copy(sunLight.position.clone().normalize().multiplyScalar(420));
scene.add(sunMesh);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(8.2, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff1a5, transparent: true, opacity: 0.18 })
);
sunGlow.position.copy(sunMesh.position);
scene.add(sunGlow);

// --- Mundo ---
createSky(scene);
const planet = createPlanet(scene);
createSign(scene, new THREE.Vector3(0, 0.9, -1.25));
const grass = createGrass(scene, 280);
const treeObstacles = createTrees(scene, 70);
const houseObstacles = createHouses(scene, 12);
const sceneObstacles = [...treeObstacles, ...houseObstacles];

// --- Jogador, controles e câmera ---
const player = new Player(scene, sceneObstacles);
const controls = new Controls(canvas);
const thirdPersonCamera = new ThirdPersonCamera(camera);

// --- HUD simples de FPS ---
const fpsEl = document.getElementById('fps');
let frameCount = 0;
let fpsTimer = 0;

// --- Loop principal ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1); // evita saltos grandes em abas inativas

  if (planet) planet.rotation.y += delta * 0.08;
  player.update(delta, controls);
  thirdPersonCamera.update(player, controls);

  renderer.render(scene, camera);

  // Atualiza contador de FPS a cada ~0.5s
  frameCount++;
  fpsTimer += delta;
  if (fpsTimer >= 0.5) {
    fpsEl.textContent = `${Math.round(frameCount / fpsTimer)} fps`;
    frameCount = 0;
    fpsTimer = 0;
  }
}

animate();

// --- Responsividade ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
