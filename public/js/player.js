// player.js
// Controla o personagem com sprite billboard sobre a superfície do planeta.

import * as THREE from 'three';
import { PLANET_RADIUS } from './planet.js';

const WALK_SPEED = 8;
const RUN_SPEED = 15;
const JUMP_SPEED = 9;
const GRAVITY = 22;
const SPRITE_FRAME_DURATION = 0.15;
const SPRITE_PATH_BASE = '/assets/player';
const SPRITE_ANIMATIONS = {
  idle: 3,
  walk: 4,
  run: 4,
};

export class Player {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    this.position = new THREE.Vector3(0, PLANET_RADIUS, 0);
    this.forward = new THREE.Vector3(0, 0, -1);
    this.groundOffset = 0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.walkCycle = 0;
    this.up = new THREE.Vector3(0, 1, 0);

    this.currentAction = 'idle';
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.animations = {};

    this.sprite = this._createSprite();
    this.group.add(this.sprite);
    this._loadSpriteAnimations();
  }

  _createSprite() {
    const material = new THREE.SpriteMaterial({
      map: this._createPlaceholderTexture(),
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0);
    sprite.scale.set(1.4, 2.2, 1);
    return sprite;
  }

  _createPlaceholderTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', size / 2, size / 2);
    return new THREE.CanvasTexture(canvas);
  }

  _loadSpriteAnimations() {
    const loader = new THREE.TextureLoader();

    Object.entries(SPRITE_ANIMATIONS).forEach(([action, frames]) => {
      this.animations[action] = [];
      for (let i = 1; i <= frames; i += 1) {
        const texture = this._createPlaceholderTexture();
        this.animations[action].push(texture);
        loader.load(
          `${SPRITE_PATH_BASE}/${action}/${i}.png`,
          (tex) => {
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.LinearFilter;
            this.animations[action][i - 1] = tex;
            if (action === this.currentAction && this.currentFrame === i - 1) {
              this.sprite.material.map = tex;
              this.sprite.material.needsUpdate = true;
            }
          },
          undefined,
          () => {
            // Se não carregar, mantém placeholder.
          }
        );
      }
    });
  }

  _setAction(action) {
    if (this.currentAction === action) return;
    this.currentAction = action;
    this.currentFrame = 0;
    this.frameTimer = 0;
    const nextTexture = this.animations[action]?.[0];
    if (nextTexture) {
      this.sprite.material.map = nextTexture;
      this.sprite.material.needsUpdate = true;
    }
  }

  update(delta, controls) {
    const up = this.up.copy(this.position).normalize();
    this.forward.sub(up.clone().multiplyScalar(this.forward.dot(up))).normalize();

    if (controls.yaw !== 0) {
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(up, controls.yaw);
      this.forward.applyQuaternion(yawQuat);
      controls.yaw = 0;
    }

    const right = new THREE.Vector3().crossVectors(this.forward, up).normalize();

    const input = new THREE.Vector3();
    if (controls.keys.forward) input.add(this.forward);
    if (controls.keys.backward) input.sub(this.forward);
    if (controls.keys.right) input.add(right);
    if (controls.keys.left) input.sub(right);

    const isMoving = input.lengthSq() > 0;
    if (isMoving) {
      input.normalize();
      const speed = controls.keys.run ? RUN_SPEED : WALK_SPEED;
      this.position.addScaledVector(input, speed * delta);
    }

    if (controls.keys.jump && this.isGrounded) {
      this.verticalVelocity = JUMP_SPEED;
      this.isGrounded = false;
    }

    this.verticalVelocity -= GRAVITY * delta;
    this.groundOffset += this.verticalVelocity * delta;

    if (this.groundOffset <= 0) {
      this.groundOffset = 0;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    const distanceFromCenter = PLANET_RADIUS + this.groundOffset;
    this.position.normalize().multiplyScalar(distanceFromCenter);
    this.group.position.copy(this.position);

    const action = controls.keys.run ? 'run' : isMoving ? 'walk' : 'idle';
    this._setAction(action);

    this.frameTimer += delta;
    const frames = this.animations[this.currentAction];
    if (frames && frames.length > 1 && this.frameTimer >= SPRITE_FRAME_DURATION) {
      this.frameTimer -= SPRITE_FRAME_DURATION;
      this.currentFrame = (this.currentFrame + 1) % frames.length;
      this.sprite.material.map = frames[this.currentFrame];
      this.sprite.material.needsUpdate = true;
    }
  }
}
