// main.js
// Ponto de entrada do jogo: monta a cena Three.js, instancia os módulos
// (planeta, jogador, controles, câmera, árvores) e roda o loop principal.

import * as THREE from 'three';
import { createPlanet, createSign, createTubeTV } from './planet.js';
import { createArcadeMachine } from './arcade.js';
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

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const centerPointer = new THREE.Vector2(0, 0);
const youtubeOverlay = document.getElementById('youtube-overlay');
const youtubeIframe = document.getElementById('youtube-iframe');
const youtubeClose = document.getElementById('youtube-close');
const arcadeOverlay = document.getElementById('arcade-overlay');
const arcadeIframe = document.getElementById('arcade-iframe');
const interactionHint = document.getElementById('interaction-hint');
const VIDEO_HINT_DISTANCE = 3.0;
const INTERACT_KEY = 'KeyE';
const MUSIC_TOGGLE_KEY = 'KeyP';
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
let lastTouchPoint = null;
let pinchDistance = null;
let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;
let doubleTapActive = false;
let doubleTapStartY = 0;
let doubleTapMoved = false;
// Zoom bar vars
const zoomBar = document.getElementById('zoom-bar');
const zoomThumb = zoomBar?.querySelector('.zoom-thumb');
let zoomDragging = false;
let zoomLastY = 0;

youtubeClose.addEventListener('click', () => {
  youtubeOverlay.classList.add('hidden');
  youtubeOverlay.classList.remove('visible');
  youtubeIframe.src = '';
});

youtubeOverlay.querySelector('.overlay-backdrop').addEventListener('click', () => {
  youtubeClose.click();
});

const arcadeClose = document.getElementById('arcade-close');

arcadeClose?.addEventListener('click', () => {
  arcadeOverlay?.classList.add('hidden');
  arcadeOverlay?.classList.remove('visible');
  if (arcadeIframe) arcadeIframe.src = '';
});

arcadeOverlay?.querySelector('.overlay-backdrop')?.addEventListener('click', () => {
  arcadeOverlay?.classList.add('hidden');
  arcadeOverlay?.classList.remove('visible');
  if (arcadeIframe) arcadeIframe.src = '';
});

function openIframeOverlay(overlay, iframe, src) {
  if (!overlay || !iframe || !src) return;
  iframe.src = src;
  overlay.classList.remove('hidden');
  overlay.classList.add('visible');
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }
}

function openYoutubeOverlay(videoId) {
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1&mute=0&playsinline=1`;
  openIframeOverlay(youtubeOverlay, youtubeIframe, youtubeUrl);
}

function openArcadeOverlay(gameUrl) {
  openIframeOverlay(arcadeOverlay, arcadeIframe, gameUrl);
}

function openArcadePopup(gameUrl) {
  if (!gameUrl) return false;
  openArcadeOverlay(gameUrl);
  return true;
}

function openArcade(gameUrl) {
  return openArcadePopup(gameUrl);
}

function getCanvasPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX ?? 0;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY ?? 0;
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  return new THREE.Vector2(x, y);
}

function tryOpenArcadeFromPointer(event) {
  if (arcadeOverlay?.classList.contains('visible')) return false;

  const point = getCanvasPointer(event);
  raycaster.setFromCamera(point, camera);
  const intersects = raycaster.intersectObject(arcadeMachine, true);
  if (intersects.length === 0) {
    return false;
  }

  const hit = intersects[0].object;
  const gameUrl = hit.userData.gameUrl || arcadeMachine.userData.gameUrl;
  if (gameUrl) {
    openArcade(gameUrl);
    return true;
  }

  return false;
}

function tryOpenVideoFromPointer(event) {
  if (youtubeOverlay.classList.contains('visible')) return false;

  const point = getCanvasPointer(event);
  raycaster.setFromCamera(point, camera);
  const intersects = raycaster.intersectObject(tubeTV, true);
  if (intersects.length === 0) {
    return false;
  }

  const hit = intersects[0].object;
  const videoId = hit.userData.videoId || tubeTV.userData.videoId;
  if (videoId) {
    openYoutubeOverlay(videoId);
    return true;
  }

  return false;
}

function tryMovePlayerToPointer(event) {
  const point = getCanvasPointer(event);
  raycaster.setFromCamera(point, camera);
  const intersects = raycaster.intersectObject(planet, true);
  if (intersects.length === 0) {
    return false;
  }

  player.setMoveTarget(intersects[0].point);
  return true;
}

function isLookingAtArcade() {
  raycaster.setFromCamera(centerPointer, camera);
  const intersects = raycaster.intersectObject(arcadeMachine, true);
  return intersects.length > 0;
}

function isLookingAtTubeTV() {
  raycaster.setFromCamera(centerPointer, camera);
  const intersects = raycaster.intersectObject(tubeTV, true);
  return intersects.length > 0;
}

function handleInteractionKey(event) {
  if (event.code === MUSIC_TOGGLE_KEY) {
    event.preventDefault();
    void musicManager.toggle();
    return;
  }
  if (event.key === '+' || event.key === '=') {
    event.preventDefault();
    musicManager.changeVolume(0.1);
    return;
  }
  if (event.key === '-') {
    event.preventDefault();
    musicManager.changeVolume(-0.1);
    return;
  }
  if (event.code !== INTERACT_KEY) return;
  tryInteract();
}

function tryInteract() {
  const distanceArcade = player.position.distanceTo(arcadeMachine.position);
  if (distanceArcade <= VIDEO_HINT_DISTANCE && isLookingAtArcade()) {
    openArcade(arcadeMachine.userData.gameUrl);
    return;
  }

  const distance = player.position.distanceTo(tubeTV.position);
  if (distance > VIDEO_HINT_DISTANCE) return;
  if (!isLookingAtTubeTV()) return;
  openYoutubeOverlay(tubeTV.userData.videoId);
}

// Listen for interaction requests from controls (e.g. short tap on B)
document.addEventListener('game-interact-request', () => tryInteract());

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

function updateTVCalloutAnimation(time) {
  if (!tubeTV?.userData?.callout) return;
  const callout = tubeTV.userData.callout;
  callout.position.y = 1.55 + Math.sin(time * 2.2) * 0.05;
  callout.rotation.z = Math.sin(time * 1.8) * 0.06;
}

// --- Mundo ---
const planet = createPlanet(scene);
const sign = createSign(scene, new THREE.Vector3(0, 0.9, -1.25));
const tubeTV = createTubeTV(scene, 'hIxQU0IlDqw', new THREE.Vector3(1.8, 0.9, 0.3));
const arcadeMachine = createArcadeMachine(
  scene,
  'https://www.retrogames.cc/embed/28355-toe-jam-earl-usa-europe.html',
  new THREE.Vector3(-1.8, 0.9, 0.3)
);
const grass = createGrass(scene, 280);
const treeObstacles = createTrees(scene, 9);
const houseObstacles = createHouses(scene, 12);
const sceneObstacles = [
  ...treeObstacles,
  ...houseObstacles,
  sign.userData.obstacle,
  tubeTV.userData.obstacle,
  arcadeMachine.userData.obstacle,
];

canvas.addEventListener('click', (event) => {
  if (tryOpenArcadeFromPointer(event) || tryOpenVideoFromPointer(event)) return;
  if (!controls?.isLocked) return;
  tryMovePlayerToPointer(event);
});

canvas.addEventListener('touchstart', (event) => {
  if (event.touches.length === 2) {
    pinchDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
    lastTouchPoint = null;
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    lastTouchPoint = { x: touch.clientX, y: touch.clientY };

    // detect double-tap start
    const now = performance.now();
    const dt = now - lastTapTime;
    const dist = Math.hypot(touch.clientX - lastTapX, touch.clientY - lastTapY);
    if (dt < 300 && dist < 30) {
      // begin double-tap zoom interaction
      doubleTapActive = true;
      doubleTapStartY = touch.clientY;
      doubleTapMoved = false;
      // prevent default double-tap-to-zoom browser behavior
      event.preventDefault();
    }
    lastTapTime = now;
    lastTapX = touch.clientX;
    lastTapY = touch.clientY;
  }
}, { passive: true });

canvas.addEventListener('touchmove', (event) => {
  if (event.touches.length === 2 && pinchDistance) {
    event.preventDefault();
    const nextDistance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
    const delta = nextDistance - pinchDistance;
    thirdPersonCamera.adjustZoom(-delta * 0.01);
    pinchDistance = nextDistance;
    if (typeof updateThumbPos === 'function') updateThumbPos();
    return;
  }

  // double-tap + drag to zoom
  if (doubleTapActive && event.touches.length === 1) {
    const t = event.touches[0];
    const dy = t.clientY - doubleTapStartY;
    // apply proportional zoom (moving up zooms in)
    thirdPersonCamera.adjustZoom(dy * 0.6);
    doubleTapMoved = true;
    if (typeof updateThumbPos === 'function') updateThumbPos();
    event.preventDefault();
    return;
  }
}, { passive: false });



canvas.addEventListener('touchend', (event) => {
  if (event.touches.length >= 2) {
    pinchDistance = null;
    return;
  }

  // handle end of double-tap interaction: if it was a quick double-tap without drag, animate zoom in
  if (doubleTapActive) {
    if (!doubleTapMoved) {
      // quick double-tap -> smooth zoom in
      const oldDist = thirdPersonCamera.distance;
      const target = Math.max(3.5, oldDist * 0.7);
      const oldHeight = thirdPersonCamera.height;
      const startTime = performance.now();
      const duration = 220;
      const animate = () => {
        const t = Math.min(1, (performance.now() - startTime) / duration);
        const v = oldDist + (target - oldDist) * t;
        thirdPersonCamera.distance = v;
        thirdPersonCamera.height = oldHeight * (v / oldDist);
        if (t < 1) requestAnimationFrame(animate);
        else if (typeof updateThumbPos === 'function') updateThumbPos();
      };
      requestAnimationFrame(animate);
    }
    doubleTapActive = false;
    doubleTapMoved = false;
  }

  if (!lastTouchPoint) return;
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  const dx = touch.clientX - lastTouchPoint.x;
  const dy = touch.clientY - lastTouchPoint.y;
  if (Math.hypot(dx, dy) > 12) {
    lastTouchPoint = null;
    return;
  }
  if (tryOpenArcadeFromPointer(event) || tryOpenVideoFromPointer(event)) {
    lastTouchPoint = null;
    return;
  }
  tryMovePlayerToPointer(event);
  lastTouchPoint = null;
}, { passive: false });

// --- Jogador, controles e câmera ---
const player = new Player(scene, sceneObstacles);
const controls = new Controls(canvas);
const thirdPersonCamera = new ThirdPersonCamera(camera);

// Zoom bar touch / pointer handling (needs thirdPersonCamera available)
if (zoomBar && zoomThumb) {
  const updateThumbPos = () => {
    const min = 3.5;
    const max = 12.0;
    const dist = thirdPersonCamera.distance;
    const ratio = (dist - min) / (max - min);
    const barRect = zoomBar.getBoundingClientRect();
    const y = barRect.top + (1 - Math.max(0, Math.min(1, ratio))) * barRect.height;
    zoomThumb.style.top = `${y - barRect.top}px`;
  };

  const onStart = (y) => {
    zoomDragging = true;
    zoomLastY = y;
  };

  const onMove = (y) => {
    if (!zoomDragging) return;
    const delta = zoomLastY - y; // positive when moving up
    const speed = 0.04;
    thirdPersonCamera.adjustZoom(-delta * speed);
    zoomLastY = y;
    updateThumbPos();
  };

  const onEnd = () => {
    zoomDragging = false;
  };

  // Touch
  zoomBar.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    console.debug('zoomBar touchstart', t?.clientY);
    onStart(t.clientY);
  }, { passive: false });
  zoomBar.addEventListener('touchmove', (e) => {
    e.preventDefault();
    // If user uses two fingers to scroll vertically on the bar, use the average Y
    if (e.touches && e.touches.length === 2) {
      const y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      onMove(y);
      return;
    }
    const t = e.touches[0];
    onMove(t.clientY);
  }, { passive: false });
  zoomBar.addEventListener('touchend', (e) => { e.preventDefault(); onEnd(); }, { passive: false });

  // Some browsers prefer pointer events; ensure fallback logs for debugging
  zoomBar.addEventListener('pointerdown', (e) => {
    console.debug('zoomBar pointerdown', e.clientY, e.pointerId);
    e.preventDefault(); onStart(e.clientY); zoomBar.setPointerCapture(e.pointerId);
  }, { passive: false });
  zoomBar.addEventListener('pointermove', (e) => { if (zoomDragging) onMove(e.clientY); }, { passive: false });
  zoomBar.addEventListener('pointerup', (e) => { onEnd(); }, { passive: false });

  // Pointer (mouse) support
  zoomBar.addEventListener('pointerdown', (e) => { e.preventDefault(); onStart(e.clientY); zoomBar.setPointerCapture(e.pointerId); }, { passive: false });
  zoomBar.addEventListener('pointermove', (e) => { e.preventDefault(); onMove(e.clientY); }, { passive: false });
  zoomBar.addEventListener('pointerup', (e) => { onEnd(); }, { passive: false });

  // Wheel support: allow mouse wheel or emulated wheel to change zoom
  zoomBar.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.wheelDelta || 0;
    // feed to adjustZoom; positive delta -> zoom out
    thirdPersonCamera.adjustZoom(delta);
    updateThumbPos();
  }, { passive: false });

  // update on load
  updateThumbPos();
}

// GB orb: drag horizontally to rotate camera (yaw)
const gbOrb = document.getElementById('gb-orb');
if (gbOrb) {
  let orbDragging = false;
  let orbLastX = 0;
  const orbSensitivity = 0.008; // tuned sensitivity

  const onOrbStart = (x) => { orbDragging = true; orbLastX = x; };
  const onOrbMove = (x) => {
    if (!orbDragging) return;
    const dx = x - orbLastX;
    // negative dx -> yaw increases left? player.update uses controls.yaw applied as rotation around up
    controls.yaw -= dx * orbSensitivity;
    orbLastX = x;
  };
  const onOrbEnd = () => { orbDragging = false; };

  gbOrb.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; onOrbStart(t.clientX); }, { passive: false });
  gbOrb.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.touches[0]; onOrbMove(t.clientX); }, { passive: false });
  gbOrb.addEventListener('touchend', (e) => { e.preventDefault(); onOrbEnd(); }, { passive: false });

  gbOrb.addEventListener('pointerdown', (e) => { e.preventDefault(); onOrbStart(e.clientX); gbOrb.setPointerCapture(e.pointerId); }, { passive: false });
  gbOrb.addEventListener('pointermove', (e) => { e.preventDefault(); onOrbMove(e.clientX); }, { passive: false });
  gbOrb.addEventListener('pointerup', (e) => { onOrbEnd(); }, { passive: false });
}

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  thirdPersonCamera.adjustZoom(event.deltaY);
}, { passive: false });

document.addEventListener('keydown', handleInteractionKey);

// --- HUD simples de FPS ---
const fpsEl = document.getElementById('fps');
const musicToggle = document.getElementById('music-toggle');
const volumeUp = document.getElementById('volume-up');
const volumeDown = document.getElementById('volume-down');
let frameCount = 0;
let fpsTimer = 0;

const musicManager = {
  audioCtx: null,
  audioElement: null,
  masterGain: null,
  regulators: [],
  isPlaying: false,
  usingAudioElement: false,
  volume: 0.5,
  musicUrl: '/assets/music/background.mp3',
  init() {
    this.audioElement = new Audio(this.musicUrl);
    this.audioElement.loop = true;
    this.audioElement.preload = 'auto';
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.volume = this.volume;
    this.audioElement.addEventListener('error', () => {
      if (!this.audioCtx) this._initFallback();
    });

    this.audioElement.play().then(() => {
      this.isPlaying = true;
      this.usingAudioElement = true;
      this.updateButton();
    }).catch(() => {
      this._initFallback();
    });
  },
  _initFallback() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.audioCtx = new AudioContext();
    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = this.volume * 0.14;
    masterGain.connect(this.audioCtx.destination);
    this.masterGain = masterGain;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.8;
    masterGain.disconnect();
    masterGain.connect(filter);
    filter.connect(this.audioCtx.destination);

    const makeVoice = (frequency, type, gainValue) => {
      const osc = this.audioCtx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      const voiceGain = this.audioCtx.createGain();
      voiceGain.gain.value = gainValue;
      osc.connect(voiceGain);
      voiceGain.connect(masterGain);
      osc.start();
      return { osc, gain: voiceGain };
    };

    this.regulators.push(makeVoice(110, 'sine', 0.18));
    this.regulators.push(makeVoice(220, 'triangle', 0.12));
    this.regulators.push(makeVoice(330, 'triangle', 0.08));

    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.18;
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    const ambientOsc = this.audioCtx.createOscillator();
    ambientOsc.type = 'sawtooth';
    ambientOsc.frequency.value = 55;
    const ambientGain = this.audioCtx.createGain();
    ambientGain.gain.value = 0.025;
    ambientOsc.connect(ambientGain);
    ambientGain.connect(masterGain);
    ambientOsc.start();
    this.regulators.push({ osc: ambientOsc, gain: ambientGain });

    this.isPlaying = true;
    this.updateButton();
  },
  async toggle() {
    if (!this.audioElement && !this.audioCtx) {
      this.init();
      return;
    }

    if (this.usingAudioElement && this.audioElement) {
      if (this.isPlaying) {
        this.audioElement.pause();
        this.isPlaying = false;
      } else {
        await this.audioElement.play().catch(() => {});
        this.isPlaying = true;
      }
      this.updateButton();
      return;
    }

    if (!this.audioCtx) {
      this._initFallback();
      return;
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
      this.isPlaying = true;
      this.updateButton();
      return;
    }
    if (this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
      this.isPlaying = false;
    } else {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.14, this.audioCtx.currentTime, 0.05);
      this.isPlaying = true;
    }
    this.updateButton();
  },
  changeVolume(delta) {
    this.volume = Math.max(0, Math.min(1, this.volume + delta));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.14, this.audioCtx.currentTime, 0.05);
    }
    this.updateButton();
  },
  updateButton() {
    if (!musicToggle) return;
    if (!this.audioElement && !this.audioCtx) {
      musicToggle.textContent = 'Música: Iniciar (50%)';
      return;
    }
    const percent = Math.round(this.volume * 100);
    musicToggle.textContent = `${this.isPlaying ? 'Música: Pausar' : 'Música: Retomar'} (${percent}%)`;
  },
};

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    void musicManager.toggle();
  });
}

volumeUp?.addEventListener('click', () => {
  musicManager.changeVolume(0.1);
});

volumeDown?.addEventListener('click', () => {
  musicManager.changeVolume(-0.1);
});

// --- Loop principal ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1); // evita saltos grandes em abas inativas

  updateDayNight(player.position, delta);
  if (planet) planet.rotation.y += delta * 0.08;
  player.update(delta, controls);
  thirdPersonCamera.update(player, controls);
  updateInteractionHint(player.position, tubeTV.position);
  updateTVCalloutAnimation(clock.elapsedTime);

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

function updateInteractionHint(playerPos, billboardPos) {
  const distance = playerPos.distanceTo(billboardPos);
  const visible = distance <= VIDEO_HINT_DISTANCE;
  if (visible) {
    if (isTouchDevice) {
      interactionHint.textContent = isLookingAtTubeTV()
        ? 'Toque na TV para assistir'
        : 'Aponte para a TV e toque para assistir';
    } else {
      interactionHint.textContent = isLookingAtTubeTV()
        ? 'Pressione E ou clique para assistir'
        : 'Aponte para a TV e pressione E';
    }
  } else {
    interactionHint.textContent = 'Aproxime-se da TV para assistir';
  }
  interactionHint.classList.toggle('visible', visible);
}

animate();

// --- Responsividade ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
