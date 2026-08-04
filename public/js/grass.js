import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createBlade(height = 0.48) {
  const blade = new THREE.PlaneGeometry(0.1, height, 1, 4);
  blade.translate(0, height * 0.5, 0);
  return blade;
}

export function createGrass(scene, count = 280) {
  const grassGroup = new THREE.Group();
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x4c8a2d,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
  });
  const bladeGeometry = createBlade();

  for (let i = 0; i < count; i += 1) {
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    const bladeHeight = 0.24 + Math.random() * 0.24;
    const blade = new THREE.Mesh(createBlade(bladeHeight), grassMaterial);
    const pos = dir.clone().multiplyScalar(PLANET_RADIUS + 0.02 + bladeHeight * 0.05);
    blade.position.copy(pos);
    blade.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    blade.rotateX((Math.random() - 0.5) * 0.25);
    blade.rotateY(Math.random() * Math.PI * 2);
    blade.castShadow = false;
    blade.receiveShadow = false;

    grassGroup.add(blade);
  }

  scene.add(grassGroup);
  return grassGroup;
}
