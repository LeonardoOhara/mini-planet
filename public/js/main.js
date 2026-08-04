// main.js
// Ponto de entrada do jogo: monta a cena Three.js, instancia os módulos
// (planeta, jogador, controles, câmera, árvores) e roda o loop principal.

import * as THREE from 'three';
import { createPlanet, createSign } from './planet.js';
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

const hemisphereLight = new THREE.HemisphereLight(0xa9d6ff, 0x3a2b24, 0.55);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xfff1c0, 1.2);
const sunLightTarget = new THREE.Object3D();
scene.add(sunLightTarget);
sunLight.target = sunLightTarget;
sunLight.position.set(250, 80, -120);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 300;
sunLight.shadow.camera.left = -80;
sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top = 80;
sunLight.shadow.camera.bottom = -80;
scene.add(sunLight);

const moonLight = new THREE.DirectionalLight(0x8cb8ff, 0.0);
moonLight.position.set(-240, 110, 160);
scene.add(moonLight);

const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(24, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfff1a5, transparent: true, opacity: 0.9 })
);
sunMesh.position.set(280, 100, -160);
scene.add(sunMesh);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(40, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfff1a5, transparent: true, opacity: 0.18 })
);
sunGlow.position.copy(sunMesh.position);
scene.add(sunGlow);

// --- Sistema de Dia e Noite ---
const skyInfo = createSky(scene);
const DAY_DURATION_SECONDS = 150;
const SUN_DISTANCE = 280;
const SUN_VISUAL_DISTANCE = 320;
const MOON_DISTANCE = 360;
const SUN_ORBIT_AXIS = new THREE.Vector3(0.18, 0.96, -0.12).normalize();
const SUN_BASE_DIRECTION = new THREE.Vector3(0.94, 0.18, -0.28).normalize();
let cycleAngle = Math.PI * 0.12;

function getSunDirection() {
  return SUN_BASE_DIRECTION.clone().applyAxisAngle(SUN_ORBIT_AXIS, cycleAngle).normalize();
}

function updateDayNight(playerPosition, delta) {
  cycleAngle = (cycleAngle + delta * ((Math.PI * 2) / DAY_DURATION_SECONDS)) % (Math.PI * 2);

  const sunDirection = getSunDirection();
  const moonDirection = sunDirection.clone().negate();
  const surfaceNormal = playerPosition.clone().normalize();
  const rawFactor = surfaceNormal.dot(sunDirection);
  const localDayFactor = THREE.MathUtils.clamp((rawFactor + 0.25) / 1.25, 0, 1);
  const skyFactor = THREE.MathUtils.smoothstep(localDayFactor, 0, 1);
  const nightFactor = 1 - skyFactor;
  const twilightFactor = Math.pow(1 - THREE.MathUtils.clamp(Math.abs(rawFactor) / 0.7, 0, 1), 1.35);

  const topDay = new THREE.Color(0x59a6f5);
  const bottomDay = new THREE.Color(0xe4f5ff);
  const topSunset = new THREE.Color(0x5064c7);
  const bottomSunset = new THREE.Color(0xffaf73);
  const topNight = new THREE.Color(0x07111f);
  const bottomNight = new THREE.Color(0x040814);
  const horizonColor = new THREE.Color(0xffb36b).lerp(new THREE.Color(0x8e6dff), nightFactor * 0.45);

  const topColor = topNight.clone().lerp(topSunset, twilightFactor).lerp(topDay, skyFactor);
  const bottomColor = bottomNight.clone().lerp(bottomSunset, twilightFactor).lerp(bottomDay, skyFactor);

  if (skyInfo.material.uniforms) {
    skyInfo.material.uniforms.topColor.value.copy(topColor);
    skyInfo.material.uniforms.bottomColor.value.copy(bottomColor);
    skyInfo.material.uniforms.horizonColor.value.copy(horizonColor);
    skyInfo.material.uniforms.horizonStrength.value = 0.12 + twilightFactor * 0.95 + nightFactor * 0.08;
  }

  const sunColor = new THREE.Color(0xff9f69).lerp(new THREE.Color(0xfff1b5), skyFactor);
  const sunIntensity = 0.08 + skyFactor * 1.25 + twilightFactor * 0.28;
  const moonIntensity = 0.04 + nightFactor * 0.36;

  sunLight.position.copy(sunDirection.clone().multiplyScalar(SUN_DISTANCE));
  sunLight.color.copy(sunColor);
  sunLight.intensity = sunIntensity;
  moonLight.position.copy(moonDirection.clone().multiplyScalar(SUN_DISTANCE * 0.95));
  moonLight.intensity = moonIntensity;

  ambientLight.color.copy(new THREE.Color(0x8ba3d9).lerp(new THREE.Color(0xffffff), skyFactor));
  ambientLight.intensity = 0.14 + skyFactor * 0.34 + twilightFactor * 0.08;
  hemisphereLight.color.copy(new THREE.Color(0x6c7fc8).lerp(new THREE.Color(0xbfe3ff), skyFactor));
  hemisphereLight.groundColor.copy(new THREE.Color(0x182033).lerp(new THREE.Color(0x5a4734), skyFactor));
  hemisphereLight.intensity = 0.18 + skyFactor * 0.58;

  sunMesh.position.copy(sunDirection.clone().multiplyScalar(SUN_VISUAL_DISTANCE));
  sunMesh.material.color.copy(sunColor);
  sunMesh.material.opacity = 0.1 + skyFactor * 0.78 + twilightFactor * 0.08;
  sunGlow.position.copy(sunMesh.position);
  sunGlow.material.color.copy(sunColor);
  sunGlow.material.opacity = 0.04 + skyFactor * 0.18 + twilightFactor * 0.06;

  if (skyInfo.moon) {
    skyInfo.moon.visible = true;
    skyInfo.moon.position.copy(moonDirection.clone().multiplyScalar(MOON_DISTANCE));
  }

  if (skyInfo.moonMaterial) {
    skyInfo.moonMaterial.opacity = THREE.MathUtils.clamp(nightFactor * 1.15, 0, 0.95);
    skyInfo.moonMaterial.emissiveIntensity = 0.12 + nightFactor * 0.65;
  }

  if (skyInfo.stars?.material) {
    skyInfo.stars.material.opacity = Math.max(0, nightFactor - twilightFactor * 0.35) * 0.95;
  }

  if (skyInfo.clouds?.group) {
    skyInfo.clouds.group.rotation.y += delta * 0.01;
  }

  if (skyInfo.clouds?.materials) {
    const cloudOpacity = 0.24 + skyFactor * 0.48 + twilightFactor * 0.08;
    for (const material of skyInfo.clouds.materials) {
      material.opacity = cloudOpacity;
      material.color.copy(new THREE.Color(0xd7deef).lerp(new THREE.Color(0xffffff), skyFactor));
    }
  }
}

// --- Mundo ---
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

  updateDayNight(player.position, delta);
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
