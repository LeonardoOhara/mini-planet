// thirdPersonCamera.js
// Câmera em terceira pessoa: posiciona-se atrás e acima do jogador,
// respeitando o "up" local (normal da esfera) e o pitch controlado pelo mouse.

import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

const DEFAULT_DISTANCE = 6.5;
const DEFAULT_HEIGHT = 2.2;
const MIN_DISTANCE = 3.5;
const MAX_DISTANCE = 12.0;
const CAMERA_SURFACE_MARGIN = 0.45;

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.distance = DEFAULT_DISTANCE;
    this.height = DEFAULT_HEIGHT;
    this._desiredPos = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
  }

  adjustZoom(deltaY) {
    const zoomSpeed = 0.008;
    this.distance = THREE.MathUtils.clamp(
      this.distance + deltaY * zoomSpeed,
      MIN_DISTANCE,
      MAX_DISTANCE
    );
    this.height = DEFAULT_HEIGHT * (this.distance / DEFAULT_DISTANCE);
  }

  update(player, controls) {
    const up = new THREE.Vector3().copy(player.position).normalize();
    const forward = player.forward.clone();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // Offset base: atrás e acima do jogador
    let offset = forward.clone().multiplyScalar(-this.distance).addScaledVector(up, this.height);

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
