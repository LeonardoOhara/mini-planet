import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;

  const context = canvas.getContext('2d');
  context.fillStyle = '#f3e2b5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#8f6b3d';
  context.lineWidth = 10;
  context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  context.fillStyle = '#3f2d1f';
  context.font = 'bold 62px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('botani', canvas.width / 2, canvas.height / 2 + 4);

  return canvas;
}

function createSmallBuilding() {
  const house = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x7d6750,
    roughness: 0.92,
    metalness: 0.05,
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 1.5), baseMat);
  base.position.y = 0.1;
  base.castShadow = true;
  base.receiveShadow = true;
  house.add(base);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xb5b5b5,
    roughness: 0.82,
    metalness: 0.05,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x6a6a6a,
    roughness: 0.72,
    metalness: 0.12,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x6b6b6b,
    roughness: 0.7,
    metalness: 0.1,
  });

  const floorHeight = 1.05;
  const floors = 3;

  for (let i = 0; i < floors; i += 1) {
    const floor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 1.2), bodyMat);
    floor.position.set(0, 0.55 + i * floorHeight, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;
    house.add(floor);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.08, 1.32), trimMat);
    trim.position.set(0, 0.55 + i * floorHeight + 0.54, 0);
    trim.castShadow = true;
    house.add(trim);
  }

  const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 1.4), trimMat);
  cornice.position.y = 0.55 + (floors - 1) * floorHeight + 0.56;
  cornice.castShadow = true;
  house.add(cornice);

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
  const windowHeight = 0.34;
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

  for (let i = 0; i < floors; i += 1) {
    const y = 0.55 + i * floorHeight + 0.1;
    createWindow(0, y, 0.61);
    createWindow(0, y - 0.4, 0.61);
    createWindow(0.6, y, 0.27, Math.PI / 2);
    createWindow(-0.6, y, 0.27, Math.PI / 2);
  }

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

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.07, 0.32),
    trimMat
  );
  canopy.position.set(0, 0.95, 0.68);
  canopy.castShadow = true;
  house.add(canopy);

  const signTexture = new THREE.CanvasTexture(createSignTexture());
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.38, 0.06),
    new THREE.MeshStandardMaterial({
      map: signTexture,
      roughness: 0.7,
      metalness: 0.08,
    })
  );
  signBoard.position.set(0, 1.95, 0.62);
  signBoard.castShadow = true;
  house.add(signBoard);

  const woodStripMat = new THREE.MeshStandardMaterial({
    color: 0x6a3d20,
    roughness: 0.9,
    metalness: 0.06,
  });
  const createWoodStrip = (x, y, z, height = 1.7) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, 0.07), woodStripMat);
    strip.position.set(x, y, z);
    strip.castShadow = true;
    house.add(strip);
  };

  const sidePositions = [-0.82, 0.82];
  sidePositions.forEach((x) => {
    createWoodStrip(x, 1.6, 0.3);
    createWoodStrip(x, 1.6, -0.1);
    createWoodStrip(x, 1.6, -0.5);
  });

  [-0.4, 0, 0.4].forEach((x) => {
    createWoodStrip(x, 1.6, -0.65);
  });

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.3), roofMat);
  roof.position.y = 3.2;
  roof.castShadow = true;
  roof.receiveShadow = true;
  house.add(roof);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.2), roofMat);
  chimney.position.set(0.4, 3.55, 0.12);
  chimney.castShadow = true;
  house.add(chimney);

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
