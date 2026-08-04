import * as THREE from 'three';

export const PLANET_RADIUS = 16;

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
  ctx.fillText('ERIKA TE AMO', canvas.width / 2, canvas.height / 2 - 32);

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

  scene.add(signGroup);
  return signGroup;
}
