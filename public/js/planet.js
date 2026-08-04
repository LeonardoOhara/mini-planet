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
