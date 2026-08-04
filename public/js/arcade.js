import * as THREE from 'three';
import { getSurfaceNormal, projectToSurface } from './planet.js';

export function createArcadeMachine(scene, gameUrl = '', position = new THREE.Vector3(-1.8, 0.9, 0.3)) {
  const arcadeGroup = new THREE.Group();

  const cabinetMaterial = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.96, metalness: 0.08 });
  const sidePanelMaterial = new THREE.MeshStandardMaterial({ color: 0x0d1730, roughness: 0.94, metalness: 0.04 });
  const bezelMaterial = new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.8, metalness: 0.1 });
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a26, roughness: 0.95, metalness: 0.03 });
  const screenMaterial = new THREE.MeshStandardMaterial({
    map: createArcadeScreenTexture(),
    emissive: new THREE.Color(0x226eff),
    emissiveIntensity: 0.32,
    metalness: 0.04,
    roughness: 0.4,
  });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.14, 0.14, 0.8),
    cabinetMaterial
  );
  base.position.y = 0.07;
  arcadeGroup.add(base);

  const cabinetBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 1.26, 0.58),
    cabinetMaterial
  );
  cabinetBody.position.y = 0.72;
  arcadeGroup.add(cabinetBody);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.32, 0.6),
    sidePanelMaterial
  );
  leftWing.position.set(-0.47, 0.75, 0);
  arcadeGroup.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 0.47;
  arcadeGroup.add(rightWing);

  const marquee = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x090c16, roughness: 0.9, metalness: 0.05 })
  );
  marquee.position.set(0, 1.34, 0.28);
  arcadeGroup.add(marquee);

  const marqueeSign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.14),
    new THREE.MeshStandardMaterial({
      map: createArcadeMarqueeTexture(),
      transparent: true,
      depthWrite: false,
    })
  );
  marqueeSign.position.set(0, 1.34, 0.336);
  arcadeGroup.add(marqueeSign);

  const screenBorder = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.5, 0.06),
    bezelMaterial
  );
  screenBorder.position.set(0, 0.95, 0.28);
  arcadeGroup.add(screenBorder);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.44),
    screenMaterial
  );
  screen.position.set(0, 0.95, 0.312);
  arcadeGroup.add(screen);

  const controlPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.06, 0.34),
    panelMaterial
  );
  controlPanel.position.set(0, 0.56, 0.16);
  arcadeGroup.add(controlPanel);

  const joystickStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0x191919, roughness: 0.7, metalness: 0.24 })
  );
  joystickStem.position.set(-0.21, 0.59, 0.28);
  joystickStem.rotation.x = Math.PI / 2;
  arcadeGroup.add(joystickStem);

  const joystickBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.45, metalness: 0.18 })
  );
  joystickBall.position.set(-0.21, 0.63, 0.28);
  arcadeGroup.add(joystickBall);

  const buttonA = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0xff3e66, roughness: 0.25, metalness: 0.4 })
  );
  buttonA.position.set(0.16, 0.58, 0.28);
  buttonA.rotation.x = Math.PI / 2;
  arcadeGroup.add(buttonA);

  const buttonB = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0x34b8ff, roughness: 0.25, metalness: 0.4 })
  );
  buttonB.position.set(0.04, 0.58, 0.28);
  buttonB.rotation.x = Math.PI / 2;
  arcadeGroup.add(buttonB);

  const decoStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.04, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xffd15d, roughness: 0.9, metalness: 0.05 })
  );
  decoStripe.position.set(0, 0.75, 0.28);
  arcadeGroup.add(decoStripe);

  const footLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.1, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x0d1016, roughness: 0.95, metalness: 0.02 })
  );
  footLeft.position.set(-0.32, 0.05, 0.26);
  arcadeGroup.add(footLeft);

  const footRight = footLeft.clone();
  footRight.position.x = 0.32;
  arcadeGroup.add(footRight);

  const surfaceNormal = getSurfaceNormal(position);
  arcadeGroup.position.copy(projectToSurface(position, 0.03));
  arcadeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfaceNormal);

  arcadeGroup.userData = {
    gameUrl,
    obstacle: {
      position: arcadeGroup.position.clone(),
      radius: 1.55,
    },
  };

  scene.add(arcadeGroup);
  return arcadeGroup;
}

function createArcadeScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#08122a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1d4ff6');
  gradient.addColorStop(1, '#0b1842');
  ctx.fillStyle = gradient;
  ctx.fillRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.fillStyle = '#eef4ff';
  ctx.font = 'bold 88px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PRESS', canvas.width / 2, canvas.height / 2 - 60);
  ctx.fillText('PLAY', canvas.width / 2, canvas.height / 2 + 50);

  ctx.strokeStyle = '#7ed0ff';
  ctx.lineWidth = 14;
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createArcadeMarqueeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#ff3e66');
  gradient.addColorStop(1, '#34b8ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ARCADE', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
