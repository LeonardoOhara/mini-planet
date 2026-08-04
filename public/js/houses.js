import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createHouse() {
  const house = new THREE.Group();

  const baseWidth = 1.2;
  const baseHeight = 1.0;
  const baseDepth = 1.0;
  const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xc7a87f, roughness: 1 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.castShadow = true;
  base.receiveShadow = true;
  base.position.y = baseHeight / 2;
  house.add(base);

  const roofGeo = new THREE.ConeGeometry(0.95, 0.75, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b3d2e, roughness: 0.85 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  roof.position.y = baseHeight + 0.35;
  roof.rotation.y = Math.PI / 4;
  house.add(roof);

  return house;
}

export function createHouses(scene, count = 10) {
  const houses = new THREE.Group();
  const obstacles = [];

  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    const house = createHouse();
    const pos = dir.clone().multiplyScalar(PLANET_RADIUS);
    house.position.copy(pos);
    house.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    house.rotateY(Math.random() * Math.PI * 2);
    houses.add(house);

    obstacles.push({
      position: pos.clone(),
      radius: 1.3,
    });
  }

  scene.add(houses);
  return obstacles;
}
