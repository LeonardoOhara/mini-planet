// trees.js
// Cria árvores simples (tronco + copa em cone) e as espalha aleatoriamente
// pela superfície do planeta, alinhadas com a normal local (gravidade radial).

import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

function createSingleTree() {
  const tree = new THREE.Group();

  const trunkHeight = 1.6 + Math.random() * 0.8;
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, trunkHeight, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 1 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  const foliageHeight = 1.8 + Math.random() * 1.0;
  const foliageGeo = new THREE.ConeGeometry(0.9 + Math.random() * 0.3, foliageHeight, 8);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.9 });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = trunkHeight + foliageHeight / 2 - 0.2;
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  tree.add(foliage);

  return tree;
}

/**
 * Gera `count` árvores em posições aleatórias (distribuição uniforme numa
 * esfera) e as orienta para que fiquem "em pé" perpendiculares à superfície.
 */
export function createTrees(scene, count = 60) {
  const trees = new THREE.Group();

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
  }

  scene.add(trees);
  return trees;
}
