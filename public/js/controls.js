// controls.js
// Gerencia input do teclado (WASD, Shift, Espaço) e do mouse via Pointer Lock API.
// Não conhece nada sobre o planeta ou o jogador: apenas expõe o estado do input.

const MOUSE_SENSITIVITY = 0.0022;
const MAX_PITCH = Math.PI / 2 - 0.05;

export class Controls {
  constructor(domElement) {
    this.domElement = domElement;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      jump: false,
    };

    // Ângulos acumulados de câmera (yaw = giro horizontal, pitch = vertical)
    this.yaw = 0;
    this.pitch = 0.35; // leve inclinação inicial olhando para baixo

    this.isLocked = false;

    this._blocker = document.getElementById('blocker');

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onClick = this._onClick.bind(this);

    this._init();
  }

  _init() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    this._blocker.addEventListener('click', this._onClick);
  }

  _onClick() {
    this.domElement.requestPointerLock();
  }

  _onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
    this._blocker.classList.toggle('hidden', this.isLocked);
  }

  _onMouseMove(event) {
    if (!this.isLocked) return;
    this.yaw -= event.movementX * MOUSE_SENSITIVITY;
    this.pitch -= event.movementY * MOUSE_SENSITIVITY;
    this.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.pitch));
  }

  _onKeyDown(event) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.run = true; break;
      case 'Space': this.keys.jump = true; event.preventDefault(); break;
    }
  }

  _onKeyUp(event) {
    switch (event.code) {
      case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
      case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
      case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.run = false; break;
      case 'Space': this.keys.jump = false; break;
    }
  }
}
