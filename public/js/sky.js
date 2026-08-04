// sky.js
// Céu simples: uma grande esfera com o lado interno visível, usando um
// shader básico para simular um gradiente do horizonte até o zênite.

import * as THREE from 'three';

const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  void main() {
    float h = normalize(vWorldPosition).y * 0.5 + 0.5;
    gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
  }
`;

export function createSky(scene) {
  const geometry = new THREE.SphereGeometry(500, 32, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      topColor: { value: new THREE.Color(0x4a90d9) },
      bottomColor: { value: new THREE.Color(0xcfe9ff) },
    },
    side: THREE.BackSide,
  });

  const sky = new THREE.Mesh(geometry, material);
  scene.add(sky);

  createClouds(scene);

  return sky;
}

function createClouds(scene) {
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.72,
    roughness: 0.95,
    metalness: 0,
  });

  const cloudGroup = new THREE.Group();
  const cloudRadius = 420;
  const cloudCount = 10;

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Group();
    const puffCount = 4 + Math.floor(Math.random() * 3);
    const baseSize = 18 + Math.random() * 10;
    for (let j = 0; j < puffCount; j++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(baseSize * (0.6 + Math.random() * 0.5), 12, 12),
        cloudMat
      );
      puff.position.set(
        (Math.random() - 0.5) * baseSize * 1.2,
        (Math.random() - 0.2) * baseSize * 0.4,
        (Math.random() - 0.5) * baseSize * 0.6
      );
      puff.castShadow = false;
      puff.receiveShadow = false;
      cloud.add(puff);
    }

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.PI * 0.25 + Math.random() * Math.PI * 0.25;
    cloud.position.set(
      Math.cos(theta) * Math.sin(phi) * cloudRadius,
      Math.cos(phi) * cloudRadius + 20,
      Math.sin(theta) * Math.sin(phi) * cloudRadius
    );
    cloud.rotation.y = Math.random() * Math.PI * 2;
    cloud.scale.setScalar(0.8 + Math.random() * 0.6);
    cloudGroup.add(cloud);
  }

  scene.add(cloudGroup);
}
