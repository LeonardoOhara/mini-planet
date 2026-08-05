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
  uniform vec3 horizonColor;
  uniform float horizonStrength;
  void main() {
    float h = normalize(vWorldPosition).y * 0.5 + 0.5;
    float gradientMix = pow(clamp(h, 0.0, 1.0), 0.85);
    float horizonMask = pow(1.0 - abs(h * 2.0 - 1.0), 3.0);
    vec3 baseColor = mix(bottomColor, topColor, gradientMix);
    vec3 finalColor = baseColor + horizonColor * horizonMask * horizonStrength;
    gl_FragColor = vec4(finalColor, 1.0);
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
      horizonColor: { value: new THREE.Color(0xffb16c) },
      horizonStrength: { value: 0.18 },
    },
    side: THREE.BackSide,
  });

  const sky = new THREE.Mesh(geometry, material);
  scene.add(sky);

  const moonGeo = new THREE.SphereGeometry(8, 16, 16);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    roughness: 0.8,
    metalness: 0.0,
    emissive: 0x999999,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0,
  });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(300, 250, 0);
  moon.visible = false;
  scene.add(moon);

  const stars = createStars(scene);
  const clouds = createClouds(scene);

  return {
    sky,
    material,
    moon,
    moonMaterial: moonMat,
    stars,
    clouds,
  };
}

function createClouds(scene) {
  const cloudGroup = new THREE.Group();
  const cloudRadius = 420;
  const cloudCount = 16;
  const materials = [];

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Group();
    const puffCount = 6 + Math.floor(Math.random() * 5);
    const baseSize = 22 + Math.random() * 14;
    
    for (let j = 0; j < puffCount; j++) {
      const opacity = 0.65 + Math.random() * 0.25;
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: opacity,
        roughness: 0.95,
        metalness: 0,
      });
      materials.push(cloudMat);
      
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(baseSize * (0.55 + Math.random() * 0.6), 14, 14),
        cloudMat
      );
      puff.position.set(
        (Math.random() - 0.5) * baseSize * 1.4,
        (Math.random() - 0.15) * baseSize * 0.5,
        (Math.random() - 0.5) * baseSize * 0.8
      );
      puff.castShadow = false;
      puff.receiveShadow = false;
      cloud.add(puff);
    }

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.PI * 0.2 + Math.random() * Math.PI * 0.35;
    cloud.position.set(
      Math.cos(theta) * Math.sin(phi) * cloudRadius,
      Math.cos(phi) * cloudRadius + 30,
      Math.sin(theta) * Math.sin(phi) * cloudRadius
    );
    cloud.rotation.y = Math.random() * Math.PI * 2;
    cloud.scale.setScalar(0.9 + Math.random() * 0.7);
    cloudGroup.add(cloud);
  }

  scene.add(cloudGroup);
  return {
    group: cloudGroup,
    materials,
  };
}

function createStars(scene) {
  const starCount = 1200;
  const radius = 470;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    const distance = radius + Math.random() * 20;
    positions[i * 3] = direction.x * distance;
    positions[i * 3 + 1] = direction.y * distance;
    positions[i * 3 + 2] = direction.z * distance;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xf7fbff,
    size: 2.2,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    points,
    material,
  };
}
