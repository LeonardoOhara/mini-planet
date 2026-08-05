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
const CAMERA_FOLLOW_SPEED = 0.14;

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.distance = DEFAULT_DISTANCE;
    this.height = DEFAULT_HEIGHT;
    this.followSpeed = CAMERA_FOLLOW_SPEED;
    this._desiredPos = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
    this.firstPerson = false;
  }

  setFirstPerson(enabled) {
    this.firstPerson = enabled;
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
    if (player.mode === 'interior') {
      const up = new THREE.Vector3(0, 1, 0);
      const forward = player.forward.clone();
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();

      if (this.firstPerson) {
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, controls.pitch);
        const lookDirection = forward.clone().applyQuaternion(pitchQuat);
        this._desiredPos.copy(player.position).addScaledVector(up, 1.55).addScaledVector(lookDirection, 0.08);
        this._lookTarget.copy(player.position).addScaledVector(up, 1.55).addScaledVector(lookDirection, 6);
        this.camera.position.lerp(this._desiredPos, this.followSpeed * 1.25);
        this.camera.up.copy(up);
        this.camera.lookAt(this._lookTarget);
        return;
      }

      const offset = forward.clone().multiplyScalar(-5.2).addScaledVector(up, 3.4).addScaledVector(right, 0.8);
      this._desiredPos.copy(player.position).add(offset);
      this._desiredPos.y = Math.max(this._desiredPos.y, 1.2);
      this.camera.position.lerp(this._desiredPos, this.followSpeed);

      this._lookTarget.copy(player.position).addScaledVector(up, 1.25);
      this.camera.up.copy(up);
      this.camera.lookAt(this._lookTarget);
      return;
    }

    const up = new THREE.Vector3().copy(player.position).normalize();
    const forward = player.forward.clone();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    let offset = forward.clone().multiplyScalar(-this.distance).addScaledVector(up, this.height);
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, controls.pitch);
    offset.applyQuaternion(pitchQuat);

    this._desiredPos.copy(player.position).add(offset);
    const minCameraRadius = PLANET_RADIUS + CAMERA_SURFACE_MARGIN;
    if (this._desiredPos.length() < minCameraRadius) {
      this._desiredPos.normalize().multiplyScalar(minCameraRadius);
    }

    this.camera.position.lerp(this._desiredPos, this.followSpeed);

    this._lookTarget.copy(player.position).addScaledVector(up, 1.3);
    this.camera.up.copy(up);
    this.camera.lookAt(this._lookTarget);
  }
}
