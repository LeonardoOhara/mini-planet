import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createSignTexture(text = 'botani') {
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
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

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
  door.name = 'house-door';
  door.userData.interactionType = 'house-door';
  house.add(door);
  house.userData.door = door;

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

  const entranceTextTexture = new THREE.CanvasTexture(createSignTexture('entrar'));
  entranceTextTexture.colorSpace = THREE.SRGBColorSpace;
  const entranceTextMaterial = new THREE.MeshBasicMaterial({
    map: entranceTextTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const entranceTextMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.34),
    entranceTextMaterial
  );
  entranceTextMesh.position.set(1.42, 1.82, 0.22);
  entranceTextMesh.rotation.x = 0;
  entranceTextMesh.rotation.y = 0;

  const entranceGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.42),
    new THREE.MeshBasicMaterial({
      color: 0xfff0a8,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  entranceGlow.position.set(1.42, 1.82, 0.21);
  entranceGlow.rotation.copy(entranceTextMesh.rotation);
  house.userData.entranceTextMesh = entranceTextMesh;
  house.userData.entranceTextBaseY = entranceTextMesh.position.y;
  house.userData.entranceTextOffset = 0.06;
  house.add(entranceGlow);
  house.add(entranceTextMesh);

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

function createInteriorHouseScene() {
  const group = new THREE.Group();
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x6f4f3b,
    roughness: 0.96,
    metalness: 0.03,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf2e0c9,
    roughness: 0.95,
    metalness: 0.02,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x7c5a3b,
    roughness: 0.9,
    metalness: 0.04,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x2f2f2f,
    roughness: 0.8,
    metalness: 0.08,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf9f8f2,
    roughness: 0.9,
    metalness: 0.05,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 8.5), floorMat);
  floor.position.y = 0;
  floor.receiveShadow = true;
  group.add(floor);

  const wallHeight = 3.6;
  const createWall = (width, depth, x, z, rotY = 0) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, depth), wallMat);
    wall.position.set(x, wallHeight / 2, z);
    wall.rotation.y = rotY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    return wall;
  };

  createWall(10, 0.25, 0, -4.125);
  createWall(10, 0.25, 0, 4.125);
  createWall(0.25, 8.5, -4.875, 0);
  createWall(0.25, 8.5, 4.875, 0);
  createWall(0.25, 3.4, 1.6, 0);

  const roomDivider = createWall(0.25, 3.8, -1.4, 0.8);
  roomDivider.position.x = -1.4;
  roomDivider.position.z = 0.8;

  const bathroomWall = createWall(3.0, 0.25, 1.5, -1.2);
  bathroomWall.position.x = 1.5;
  bathroomWall.position.z = -1.2;

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 8.7), new THREE.MeshStandardMaterial({
    color: 0xe6d8bb,
    roughness: 0.95,
    metalness: 0.02,
  }));
  ceiling.position.set(0, wallHeight, 0);
  ceiling.receiveShadow = true;
  group.add(ceiling);

  const kitchenCounter = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 0.8), accentMat);
  kitchenCounter.position.set(-2.7, 0.275, -2.3);
  kitchenCounter.castShadow = true;
  group.add(kitchenCounter);

  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.7), accentMat);
  sink.position.set(-2.6, 0.275, -2.3);
  sink.castShadow = true;
  group.add(sink);

  const sinkTop = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.82), whiteMat);
  sinkTop.position.set(-2.6, 0.56, -2.3);
  sinkTop.castShadow = true;
  group.add(sinkTop);

  const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.7), darkMat);
  fridge.position.set(-3.0, 0.75, 1.0);
  fridge.castShadow = true;
  group.add(fridge);

  const sofa = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 0.7), new THREE.MeshStandardMaterial({
    color: 0x6d4a2f,
    roughness: 0.95,
    metalness: 0.02,
  }));
  sofa.position.set(-0.4, 0.275, 2.2);
  sofa.castShadow = true;
  group.add(sofa);

  const tvStand = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.35), accentMat);
  tvStand.position.set(2.0, 0.2, 2.9);
  tvStand.castShadow = true;
  group.add(tvStand);

  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 0.1), darkMat);
  tvScreen.position.set(2.0, 0.95, 3.06);
  tvScreen.castShadow = true;
  group.add(tvScreen);

  const tvGlow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.04), new THREE.MeshStandardMaterial({
    color: 0x89b5ff,
    emissive: 0x204f80,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.1,
  }));
  tvGlow.position.set(2.0, 0.95, 3.1);
  group.add(tvGlow);

  const bedBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 2.0), new THREE.MeshStandardMaterial({
    color: 0x8d5c34,
    roughness: 0.9,
    metalness: 0.04,
  }));
  bedBase.position.set(0.8, 0.25, -2.4);
  bedBase.castShadow = true;
  group.add(bedBase);

  const bedMattress = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.8), new THREE.MeshStandardMaterial({
    color: 0xf3ece4,
    roughness: 0.95,
    metalness: 0.02,
  }));
  bedMattress.position.set(0.8, 0.55, -2.4);
  bedMattress.castShadow = true;
  group.add(bedMattress);

  const toilet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.95), whiteMat);
  toilet.position.set(2.8, 0.4, -2.3);
  toilet.castShadow = true;
  group.add(toilet);

  const bath = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 1.2), new THREE.MeshStandardMaterial({
    color: 0xccefff,
    roughness: 0.92,
    metalness: 0.02,
  }));
  bath.position.set(2.8, 0.3, -0.8);
  bath.castShadow = true;
  group.add(bath);

  const exitFrame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.3, 0.18), whiteMat);
  exitFrame.position.set(-3.1, 1.15, -4.12);
  exitFrame.castShadow = true;
  group.add(exitFrame);

  const exitDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.86, 0.08), new THREE.MeshStandardMaterial({
    color: 0x6b3f24,
    roughness: 0.88,
    metalness: 0.04,
  }));
  exitDoorPanel.position.set(-3.1, 0.93, -4.06);
  exitDoorPanel.castShadow = true;
  group.add(exitDoorPanel);

  const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.84, 0.04), new THREE.MeshStandardMaterial({
    color: 0x8a542c,
    roughness: 0.82,
    metalness: 0.03,
  }));
  exitDoor.position.set(-3.1, 0.93, -4.03);
  exitDoor.castShadow = true;
  exitDoor.userData.interactionType = 'house-exit';
  group.add(exitDoor);

  const doorPanel1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.045), new THREE.MeshStandardMaterial({
    color: 0x5b3017,
    roughness: 0.86,
    metalness: 0.02,
  }));
  doorPanel1.position.set(-3.1, 1.0, -4.0);
  group.add(doorPanel1);

  const doorPanel2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.045), new THREE.MeshStandardMaterial({
    color: 0x5b3017,
    roughness: 0.86,
    metalness: 0.02,
  }));
  doorPanel2.position.set(-3.1, 0.85, -4.0);
  group.add(doorPanel2);

  const exitHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.16), darkMat);
  exitHandle.position.set(-2.82, 0.94, -3.97);
  group.add(exitHandle);

  const exitTrim = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.06, 0.12), new THREE.MeshStandardMaterial({
    color: 0xb08a5b,
    roughness: 0.82,
    metalness: 0.03,
  }));
  exitTrim.position.set(-3.1, 1.9, -4.1);
  group.add(exitTrim);

  const light = new THREE.PointLight(0xffe1b3, 2.1, 12, 2);
  light.position.set(0, 2.4, 0);
  group.add(light);

  return {
    group,
    exitDoor,
    spawnPosition: new THREE.Vector3(-2.4, 1.15, -3.2),
    bounds: {
      minX: -4.1,
      maxX: 4.2,
      minZ: -3.8,
      maxZ: 3.8,
    },
  };
}

export function createHouses(scene, count = 1) {
  const houses = new THREE.Group();
  const obstacles = [];
  const doors = [];

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

  if (smallBuilding.userData.door) {
    doors.push(smallBuilding.userData.door);
  }

  scene.add(houses);
  return { obstacles, doors, group: houses };
}

export { createInteriorHouseScene };
