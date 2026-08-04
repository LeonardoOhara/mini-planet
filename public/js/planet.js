// planet.js
// Responsável por criar o planeta (mundo esférico) e por fornecer
// utilitários relacionados à gravidade radial (direção "para cima" em
// qualquer ponto da superfície = vetor do centro do planeta até o ponto).

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

/**
 * Cria uma placa 3D sobre a superfície do planeta com a mensagem desejada.
 */
export function createSign(scene, position = new THREE.Vector3(0, 0.9, 1.2)) {
  const signGroup = new THREE.Group();

  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.95,
  });
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), poleMaterial);
  pole.position.y = 0.6;
  signGroup.add(pole);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f7e8c7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 22;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
  ctx.fillStyle = '#6d2f1f';
  ctx.font = 'bold 100px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ÉRIKA TE AMO ♥', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const boardMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    roughness: 0.9,
    transparent: true,
  });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.95, 0.12), boardMaterial);
  board.position.y = 1.45;
  board.position.z = 0.06;
  signGroup.add(board);

  const surfaceNormal = getSurfaceNormal(position);
  signGroup.position.copy(projectToSurface(position, 0.25));
  signGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfaceNormal);

  scene.add(signGroup);
  return signGroup;
}
