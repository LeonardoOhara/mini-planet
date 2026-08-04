import * as THREE from 'three';

export const PLANET_RADIUS = 5;

/**
 * Cria o mesh do planeta e o adiciona à cena.
 */
export function createPlanet(scene) {
  const planetGroup = new THREE.Group();

  const planetGeo = new THREE.SphereGeometry(PLANET_RADIUS, 64, 64);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x3f8f4f,
    roughness: 0.95,
    metalness: 0.0,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planet.receiveShadow = true;
  planet.castShadow = false;
  planetGroup.add(planet);

  const cloudGeo = new THREE.SphereGeometry(PLANET_RADIUS * 1.02, 64, 64);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  });
  const cloudLayer = new THREE.Mesh(cloudGeo, cloudMat);
  cloudLayer.receiveShadow = false;
  cloudLayer.castShadow = false;
  planetGroup.add(cloudLayer);

  scene.add(planetGroup);
  return planetGroup;
}

/**
 * Retorna o vetor "para cima" (normal da superfície) num ponto qualquer,
 * relativo ao centro do planeta (assumido na origem).
 */
export function getSurfaceNormal(position, target = new THREE.Vector3()) {
  return target.copy(position).normalize();
}

/**
 * Projeta uma posição para a altura exata da superfície do planeta
 * (útil para "grudar" objetos no chão, como árvores).
 */
export function projectToSurface(position, heightOffset = 0) {
  return position
    .clone()
    .normalize()
    .multiplyScalar(PLANET_RADIUS + heightOffset);
}

function createSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#fff6e4');
  gradient.addColorStop(1, '#f7ddb3');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#8b4b2d';
  ctx.lineWidth = 28;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 8;
  ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

  ctx.fillStyle = '#2f1b0c';
  ctx.font = 'bold 106px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ÉRIKA TE AMO', canvas.width / 2, canvas.height / 2 - 32);

  ctx.fillStyle = '#c73652';
  ctx.font = 'bold 122px "Segoe UI Symbol", "Segoe UI", Arial, sans-serif';
  ctx.fillText('♥', canvas.width / 2, canvas.height / 2 + 116);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Cria uma placa 3D na superfície do planeta com material não iluminado.
 */
export function createSign(scene, position = new THREE.Vector3(0, 0.9, -1.25)) {
  const signGroup = new THREE.Group();

  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0x6f4e37,
    roughness: 0.92,
  });

  const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.08, 12), poleMaterial);
  leftPole.position.set(-0.72, 0.54, 0);
  signGroup.add(leftPole);

  const rightPole = leftPole.clone();
  rightPole.position.x = 0.72;
  signGroup.add(rightPole);

  const boardCore = new THREE.Mesh(
    new THREE.BoxGeometry(2.56, 1.34, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0x9b633b,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  boardCore.position.y = 1.3;
  signGroup.add(boardCore);

  const texture = createSignTexture();
  const boardMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });
  const boardGeometry = new THREE.PlaneGeometry(2.34, 1.12);

  const frontFace = new THREE.Mesh(boardGeometry, boardMaterial);
  frontFace.position.set(0, 1.3, 0.066);
  signGroup.add(frontFace);

  const backFace = new THREE.Mesh(boardGeometry, boardMaterial.clone());
  backFace.position.set(0, 1.3, -0.066);
  backFace.rotation.y = Math.PI;
  signGroup.add(backFace);

  const surfaceNormal = getSurfaceNormal(position);
  signGroup.position.copy(projectToSurface(position, 0.2));
  signGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfaceNormal);
  signGroup.userData.obstacle = {
    position: signGroup.position.clone(),
    radius: 1.25,
  };

  scene.add(signGroup);
  return signGroup;
}

export function createTubeTV(scene, videoId = 'dQw4w9WgXcQ', position = new THREE.Vector3(1.8, 0.9, 0.3)) {
  const tvGroup = new THREE.Group();

  const dresserMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a5a35,
    roughness: 0.85,
    metalness: 0.02,
  });

  const dresserTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.18, 1.0),
    dresserMaterial
  );
  dresserTop.position.y = 0.6;
  tvGroup.add(dresserTop);

  const drawerMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a4b2a,
    roughness: 0.9,
  });

  const drawerCount = 3;
  for (let i = 0; i < drawerCount; i += 1) {
    const drawer = new THREE.Mesh(
      new THREE.BoxGeometry(2.14, 0.18, 0.28),
      drawerMaterial
    );
    drawer.position.set(0, 0.38 - i * 0.18, 0);
    tvGroup.add(drawer);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.04, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x23190f, roughness: 0.8 })
    );
    handle.position.set(0, 0.38 - i * 0.18, 0.16);
    tvGroup.add(handle);
  }

  const tvBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.9, 0.42),
    new THREE.MeshStandardMaterial({
      color: 0x0c0c0c,
      roughness: 0.25,
      metalness: 0.15,
    })
  );
  tvBody.position.set(0, 1.15, 0);
  tvGroup.add(tvBody);

  const tvScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.28, 0.68),
    new THREE.MeshStandardMaterial({
      map: createVideoTexture(),
      emissive: new THREE.Color(0x1a3f72),
      emissiveIntensity: 0.05,
    })
  );
  tvScreen.position.set(0, 1.15, 0.218);
  tvGroup.add(tvScreen);

  const tvCallout = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.26),
    new THREE.MeshBasicMaterial({
      map: createTVCalloutTexture(),
      transparent: true,
      depthWrite: false,
    })
  );
  tvCallout.position.set(0, 1.70, 0.246);
  tvCallout.rotation.x = -0.15;
  tvCallout.renderOrder = 2;
  tvCallout.userData.videoId = videoId;
  tvGroup.add(tvCallout);

  const tvSpeaker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.7 })
  );
  tvSpeaker.rotation.z = Math.PI / 2;
  tvSpeaker.position.set(0, 1.15, 0.25);
  tvGroup.add(tvSpeaker);

  const tvAntennaLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3 })
  );
  tvAntennaLeft.position.set(-0.35, 1.55, 0);
  tvAntennaLeft.rotation.x = -Math.PI / 6;
  tvGroup.add(tvAntennaLeft);

  const tvAntennaRight = tvAntennaLeft.clone();
  tvAntennaRight.position.x = 0.35;
  tvAntennaRight.rotation.x = -Math.PI / 6;
  tvGroup.add(tvAntennaRight);

  const surfaceNormal = getSurfaceNormal(position);
  tvGroup.position.copy(projectToSurface(position, 0.02));
  tvGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfaceNormal);

  tvGroup.userData = {
    videoId,
    obstacle: {
      position: tvGroup.position.clone(),
      radius: 1.5,
    },
    callout: tvCallout,
  };

  scene.add(tvGroup);
  return tvGroup;
}

function createTVCalloutTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#2d4b75');
  gradient.addColorStop(1, '#1a233b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#8cd4ff';
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('aperte E', canvas.width / 2, canvas.height / 2 - 12);

  ctx.fillStyle = '#8cd4ff';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 72, canvas.height / 2 + 30);
  ctx.lineTo(canvas.width / 2 - 72, canvas.height / 2 + 68);
  ctx.lineTo(canvas.width / 2 - 32, canvas.height / 2 + 49);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createVideoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#111';
  ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.strokeStyle = '#444';
  ctx.lineWidth = 16;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLIQUE PARA PLAY', canvas.width / 2, canvas.height / 2 + 80);

  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(canvas.width / 2 - 120, canvas.height / 2 - 20, 64, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 150, canvas.height / 2 - 54);
  ctx.lineTo(canvas.width / 2 - 150, canvas.height / 2 + 50);
  ctx.lineTo(canvas.width / 2 - 70, canvas.height / 2 - 2);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
