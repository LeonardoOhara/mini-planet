import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createSmallBuilding() {
  const house = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(1.6, 2.4, 1.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xb5b5b5,
    roughness: 0.82,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  body.position.y = 1.2;
  house.add(body);

  const roofGeo = new THREE.BoxGeometry(1.7, 0.15, 1.3);
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x6b6b6b,
    roughness: 0.7,
    metalness: 0.1,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  roof.position.y = 2.475;
  house.add(roof);

  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0x2b2b2b,
    roughness: 0.9,
    metalness: 0.05,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x87c1ff,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0x2f6fb3,
    emissiveIntensity: 0.08,
    opacity: 0.88,
    transparent: true,
  });

  const windowWidth = 0.3;
  const windowHeight = 0.4;
  const windowDepth = 0.06;
  const frameThickness = 0.05;

  const createWindow = (x, y, z, ry = 0) => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + frameThickness, windowHeight + frameThickness, windowDepth),
      windowFrameMat
    );
    frame.position.set(x, y, z);
    frame.rotation.y = ry;
    frame.castShadow = false;
    house.add(frame);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth / 2),
      glassMat
    );
    glass.position.set(x, y, z + 0.01);
    glass.rotation.y = ry;
    glass.castShadow = false;
    house.add(glass);
  };

  createWindow(0, 1.6, 0.61);
  createWindow(0, 0.9, 0.61);
  createWindow(0.6, 1.6, 0.27, Math.PI / 2);
  createWindow(-0.6, 1.6, 0.27, Math.PI / 2);

  const doorGeo = new THREE.BoxGeometry(0.45, 0.95, 0.07);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x4a2f1b,
    roughness: 0.92,
    metalness: 0.02,
  });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.475, 0.61);
  door.castShadow = true;
  door.receiveShadow = true;
  house.add(door);

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd973,
      roughness: 0.3,
      metalness: 0.8,
    })
  );
  knob.position.set(0.18, 0.45, 0.68);
  house.add(knob);

  const balconyGeo = new THREE.BoxGeometry(0.9, 0.08, 0.2);
  const balconyMat = new THREE.MeshStandardMaterial({
    color: 0x4d4d4d,
    roughness: 0.85,
    metalness: 0.1,
  });
  const balcony = new THREE.Mesh(balconyGeo, balconyMat);
  balcony.position.set(0, 1.05, 0.66);
  balcony.castShadow = false;
  house.add(balcony);

  return house;
}

export function createHouses(scene, count = 1) {
  const houses = new THREE.Group();
  const obstacles = [];

  const dir = new THREE.Vector3(0, 1, 0.5).normalize();
  const smallBuilding = createSmallBuilding();
  const pos = dir.clone().multiplyScalar(PLANET_RADIUS);
  smallBuilding.position.copy(pos);
  smallBuilding.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  smallBuilding.rotateY(0);
  houses.add(smallBuilding);

  obstacles.push({
    position: pos.clone(),
    radius: 1.5,
  });

  scene.add(houses);
  return obstacles;
}
