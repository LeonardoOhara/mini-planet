// trees.js
// Cria árvores simples (tronco + copa em cone) e as espalha aleatoriamente
// pela superfície do planeta, alinhadas com a normal local (gravidade radial).

import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createSingleTree() {
  const tree = new THREE.Group();

  const trunkHeight = 1.6 + Math.random() * 0.8;
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, trunkHeight, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ 
    color: 0x5c3d2e, 
    roughness: 0.95,
    metalness: 0.0
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Primeira camada de folhagem (base, maior)
  const foliageHeight1 = 1.4 + Math.random() * 0.8;
  const foliageRadius1 = 1.0 + Math.random() * 0.4;
  const foliageGeo1 = new THREE.ConeGeometry(foliageRadius1, foliageHeight1, 12);
  const foliageMat1 = new THREE.MeshStandardMaterial({ 
    color: 0x228B22, 
    roughness: 0.85,
    metalness: 0.0
  });
  const foliage1 = new THREE.Mesh(foliageGeo1, foliageMat1);
  foliage1.position.y = trunkHeight + foliageHeight1 / 2 - 0.3;
  foliage1.castShadow = true;
  foliage1.receiveShadow = true;
  tree.add(foliage1);

  // Segunda camada de folhagem (topo, menor)
  const foliageHeight2 = 0.8 + Math.random() * 0.5;
  const foliageRadius2 = foliageRadius1 * 0.65;
  const foliageGeo2 = new THREE.ConeGeometry(foliageRadius2, foliageHeight2, 12);
  const foliageMat2 = new THREE.MeshStandardMaterial({ 
    color: 0x32CD32, 
    roughness: 0.80,
    metalness: 0.0
  });
  const foliage2 = new THREE.Mesh(foliageGeo2, foliageMat2);
  foliage2.position.y = foliage1.position.y + foliageHeight1 * 0.4;
  foliage2.castShadow = true;
  foliage2.receiveShadow = true;
  tree.add(foliage2);

  return tree;
}

/**
 * Gera `count` árvores em posições aleatórias (distribuição uniforme numa
 * esfera) e as orienta para que fiquem "em pé" perpendiculares à superfície.
 */
export function createTrees(scene, count = 60) {
  const trees = new THREE.Group();
  const obstacles = [];

  for (let i = 0; i < count; i++) {
    // Distribuição uniforme de pontos numa esfera
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    const tree = createSingleTree();
    const pos = dir.clone().multiplyScalar(PLANET_RADIUS);
    tree.position.copy(pos);

    // Alinha o eixo Y local da árvore com a normal da superfície (dir)
    tree.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Pequena rotação aleatória em torno do próprio eixo, para variar
    tree.rotateY(Math.random() * Math.PI * 2);

    trees.add(tree);
    obstacles.push({
      position: pos.clone(),
      radius: 0.9 + Math.random() * 0.2,
    });
  }

  scene.add(trees);
  return obstacles;
}
