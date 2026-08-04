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
    this._touchControls = document.getElementById('touch-controls');
    this._touchButtons = {
      up: document.getElementById('btn-up'),
      down: document.getElementById('btn-down'),
      left: document.getElementById('btn-left'),
      right: document.getElementById('btn-right'),
      run: document.getElementById('btn-run'),
      jump: document.getElementById('btn-jump'),
    };

    this._touchLookActive = false;
    this._touchLookLast = { x: 0, y: 0 };
    this._touchLastTap = 0;
    this._touchRunHold = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onTouchButtonStart = this._onTouchButtonStart.bind(this);
    this._onTouchButtonEnd = this._onTouchButtonEnd.bind(this);
    this._onTouchBlockerStart = this._onTouchBlockerStart.bind(this);

    this._init();
  }

  _init() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    this._blocker.addEventListener('click', this._onClick);

    if (this._isTouchDevice()) {
      this._touchControls?.classList.add('visible');
      this.domElement.addEventListener('touchstart', this._onTouchStart, { passive: false });
      this.domElement.addEventListener('touchmove', this._onTouchMove, { passive: false });
      this.domElement.addEventListener('touchend', this._onTouchEnd);
      this.domElement.addEventListener('touchcancel', this._onTouchEnd);
      this._blocker.addEventListener('touchstart', this._onTouchBlockerStart, { passive: false });
      Object.values(this._touchButtons).forEach((button) => {
        button?.addEventListener('touchstart', this._onTouchButtonStart, { passive: false });
        button?.addEventListener('touchend', this._onTouchButtonEnd);
        button?.addEventListener('touchcancel', this._onTouchButtonEnd);
      });
    }
  }

  _isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  _onTouchStart(event) {
    if (event.target.closest('.touch-button')) return;
    event.preventDefault();

    const now = performance.now();
    if (now - this._touchLastTap < 350) {
      this.keys.run = true;
      this._touchRunHold = true;
    }
    this._touchLastTap = now;

    const touch = event.touches[0];
    this._touchLookActive = true;
    this._touchLookLast = { x: touch.clientX, y: touch.clientY };
    this.keys.forward = true;
  }

  _onTouchMove(event) {
    if (!this._touchLookActive) return;
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) return;
    const dx = touch.clientX - this._touchLookLast.x;
    const dy = touch.clientY - this._touchLookLast.y;
    this._touchLookLast = { x: touch.clientX, y: touch.clientY };
    this.yaw -= dx * MOUSE_SENSITIVITY * 1.4;
    this.pitch -= dy * MOUSE_SENSITIVITY * 1.4;
    this.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.pitch));
  }

  _onTouchEnd(event) {
    if (event.target.closest('.touch-button')) return;
    if (event.touches.length === 0) {
      this._touchLookActive = false;
      this.keys.forward = false;
      if (this._touchRunHold) {
        this.keys.run = false;
        this._touchRunHold = false;
      }
    }
  }

  _onTouchBlockerStart(event) {
    event.preventDefault();
    this._blocker.classList.add('hidden');
    this.isLocked = true;
    this.keys.forward = true;
  }

  _onTouchButtonStart(event) {
    event.preventDefault();
    const button = event.currentTarget?.id;
    switch (button) {
      case 'btn-up': this.keys.forward = true; break;
      case 'btn-down': this.keys.backward = true; break;
      case 'btn-left': this.keys.left = true; break;
      case 'btn-right': this.keys.right = true; break;
      case 'btn-run': this.keys.run = true; break;
      case 'btn-jump': this.keys.jump = true; break;
    }
  }

  _onTouchButtonEnd(event) {
    event.preventDefault();
    const button = event.currentTarget?.id;
    switch (button) {
      case 'btn-up': this.keys.forward = false; break;
      case 'btn-down': this.keys.backward = false; break;
      case 'btn-left': this.keys.left = false; break;
      case 'btn-right': this.keys.right = false; break;
      case 'btn-run': this.keys.run = false; break;
      case 'btn-jump': this.keys.jump = false; break;
    }
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
