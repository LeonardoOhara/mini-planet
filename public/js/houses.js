import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createKameHouse() {
  const house = new THREE.Group();

  // Base cilíndrica (corpo principal da casa)
  const bodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.3, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd84c2e,
    roughness: 0.85,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  body.position.y = 0.65;
  house.add(body);

  // Telhado principal (cone vermelho - estilo pagode)
  const roofMainGeo = new THREE.ConeGeometry(1.35, 0.95, 16);
  const roofRedMat = new THREE.MeshStandardMaterial({
    color: 0xc41e3a,
    roughness: 0.8,
    metalness: 0.1,
  });
  const roofMain = new THREE.Mesh(roofMainGeo, roofRedMat);
  roofMain.castShadow = true;
  roofMain.receiveShadow = true;
  roofMain.position.y = 1.95;
  house.add(roofMain);

  // Telhado intermediário (disco branco - detalhe pagode)
  const roofDiscGeo = new THREE.CylinderGeometry(1.42, 1.35, 0.15, 16);
  const roofWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.75,
    metalness: 0.0,
  });
  const roofDisc = new THREE.Mesh(roofDiscGeo, roofWhiteMat);
  roofDisc.position.y = 2.0;
  roofDisc.castShadow = true;
  roofDisc.receiveShadow = true;
  house.add(roofDisc);

  // Telhado superior (cone branco menor - cúpula pagode)
  const roofTopGeo = new THREE.ConeGeometry(0.8, 0.6, 16);
  const roofTopMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    roughness: 0.8,
    metalness: 0.05,
  });
  const roofTop = new THREE.Mesh(roofTopGeo, roofTopMat);
  roofTop.castShadow = true;
  roofTop.receiveShadow = true;
  roofTop.position.y = 2.7;
  house.add(roofTop);

  // Base/anel do telhado (detalhe branco)
  const roofRimGeo = new THREE.CylinderGeometry(1.5, 1.42, 0.1, 16);
  const roofRim = new THREE.Mesh(roofRimGeo, roofWhiteMat);
  roofRim.position.y = 1.98;
  roofRim.castShadow = true;
  house.add(roofRim);

  // Janela frontal grande (circular)
  const windowGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    roughness: 0.5,
    metalness: 0.4,
    emissive: 0x4da6ff,
    emissiveIntensity: 0.15,
  });
  const window1 = new THREE.Mesh(windowGeo, windowMat);
  window1.position.set(0, 1.0, 1.22);
  window1.rotation.y = Math.PI / 2;
  window1.castShadow = false;
  house.add(window1);

  // Janela lateral 1
  const window2 = new THREE.Mesh(windowGeo, windowMat);
  window2.position.set(0.9, 1.0, 0.75);
  window2.rotation.y = Math.PI / 6;
  window2.castShadow = false;
  house.add(window2);

  // Janela lateral 2
  const window3 = new THREE.Mesh(windowGeo, windowMat);
  window3.position.set(-0.9, 1.0, 0.75);
  window3.rotation.y = -Math.PI / 6;
  window3.castShadow = false;
  house.add(window3);

  // Porta frontal
  const doorGeo = new THREE.BoxGeometry(0.5, 0.8, 0.08);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.9,
    metalness: 0.0,
  });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.3, 1.22);
  door.castShadow = true;
  house.add(door);

  // Maçaneta da porta
  const knobGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const knobMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.3,
    metalness: 0.8,
  });
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.position.set(0.2, 0.3, 1.3);
  house.add(knob);

  return house;
}

export function createHouses(scene, count = 1) {
  const houses = new THREE.Group();
  const obstacles = [];

  // Criar apenas uma Kame House em posição destacada
  const dir = new THREE.Vector3(0, 1, 0.5).normalize();
  const kameHouse = createKameHouse();
  const pos = dir.clone().multiplyScalar(PLANET_RADIUS);
  kameHouse.position.copy(pos);
  kameHouse.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  kameHouse.rotateY(0); // Sem rotação aleatória para manter orientação
  houses.add(kameHouse);

  obstacles.push({
    position: pos.clone(),
    radius: 1.5,
  });

  scene.add(houses);
  return obstacles;
}
