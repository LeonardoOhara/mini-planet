// thirdPersonCamera.js
// Câmera em terceira pessoa: posiciona-se atrás e acima do jogador,
// respeitando o "up" local (normal da esfera) e o pitch controlado pelo mouse.

import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

const DISTANCE = 6.5;
const HEIGHT = 2.2;
const CAMERA_SURFACE_MARGIN = 0.45;

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this._desiredPos = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
  }

  update(player, controls) {
    const up = new THREE.Vector3().copy(player.position).normalize();
    const forward = player.forward.clone();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // Offset base: atrás e acima do jogador
    let offset = forward.clone().multiplyScalar(-DISTANCE).addScaledVector(up, HEIGHT);

    // Aplica o pitch (olhar para cima/baixo) rotacionando o offset em torno do eixo "right"
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, controls.pitch);
    offset.applyQuaternion(pitchQuat);

    this._desiredPos.copy(player.position).add(offset);
    const minCameraRadius = PLANET_RADIUS + CAMERA_SURFACE_MARGIN;
    if (this._desiredPos.length() < minCameraRadius) {
      this._desiredPos.normalize().multiplyScalar(minCameraRadius);
    }
    this.camera.position.lerp(this._desiredPos, 1); // segue diretamente (sem atraso) para o MVP

    this._lookTarget.copy(player.position).addScaledVector(up, 1.3);
    this.camera.up.copy(up);
    this.camera.lookAt(this._lookTarget);
  }
}
