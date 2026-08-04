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
    this._radialLeft = document.getElementById('radial-left');
    this._radialRight = document.getElementById('radial-right');
    this._radialActive = { left: false, right: false };
    this._radialPointerId = null;
    this._radialKnobs = {
      left: this._radialLeft?.querySelector('.radial-knob'),
      right: this._radialRight?.querySelector('.radial-knob'),
    };
    this._gbOverlay = document.getElementById('gb-overlay');
    this._gbButtons = Array.from(document.querySelectorAll('.gb-button'));
    this._gbLeftStick = document.getElementById('gb-left-stick');
    this._gbRightStick = document.getElementById('gb-right-stick');
    this._gbLeftKnob = this._gbLeftStick?.querySelector('.gb-stick-knob');
    this._gbRightKnob = this._gbRightStick?.querySelector('.gb-stick-knob');
    this._leftAxis = { x: 0, y: 0 };
    this._rightAxis = { x: 0, y: 0 };

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
    this._onRadialStart = this._onRadialStart.bind(this);
    this._onRadialMove = this._onRadialMove.bind(this);
    this._onRadialEnd = this._onRadialEnd.bind(this);
    this._onGBStickStart = this._onGBStickStart.bind(this);
    this._onGBStickMove = this._onGBStickMove.bind(this);
    this._onGBStickEnd = this._onGBStickEnd.bind(this);

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
      this._setRadialVisibility();
      this._gbOverlay?.classList.add('visible');
      window.addEventListener('resize', () => this._setRadialVisibility());
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

      this._radialLeft?.addEventListener('touchstart', this._onRadialStart, { passive: false });
      this._radialRight?.addEventListener('touchstart', this._onRadialStart, { passive: false });
      this._radialLeft?.addEventListener('touchmove', this._onRadialMove, { passive: false });
      this._radialRight?.addEventListener('touchmove', this._onRadialMove, { passive: false });
      this._radialLeft?.addEventListener('touchend', this._onRadialEnd);
      this._radialRight?.addEventListener('touchend', this._onRadialEnd);
      this._radialLeft?.addEventListener('touchcancel', this._onRadialEnd);
      this._radialRight?.addEventListener('touchcancel', this._onRadialEnd);
      // Hook GameBoy buttons
      this._gbButtons.forEach((btn) => {
        btn.addEventListener('touchstart', this._onTouchButtonStart, { passive: false });
        btn.addEventListener('touchend', this._onTouchButtonEnd);
        btn.addEventListener('touchcancel', this._onTouchButtonEnd);
      });
      // Hook GB analog sticks
      this._gbLeftStick?.addEventListener('touchstart', this._onGBStickStart, { passive: false });
      this._gbLeftStick?.addEventListener('touchmove', this._onGBStickMove, { passive: false });
      this._gbLeftStick?.addEventListener('touchend', this._onGBStickEnd);
      this._gbLeftStick?.addEventListener('touchcancel', this._onGBStickEnd);
      this._gbRightStick?.addEventListener('touchstart', this._onGBStickStart, { passive: false });
      this._gbRightStick?.addEventListener('touchmove', this._onGBStickMove, { passive: false });
      this._gbRightStick?.addEventListener('touchend', this._onGBStickEnd);
      this._gbRightStick?.addEventListener('touchcancel', this._onGBStickEnd);
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
    if (touch) {
      this._touchLookActive = true;
      this._touchLookLast = { x: touch.clientX, y: touch.clientY };
    }
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
  }

  _setRadialVisibility() {
    const isLandscape = window.innerHeight < window.innerWidth;
    const shouldShow = isLandscape && this._isTouchDevice();
    this._radialLeft?.classList.toggle('visible', shouldShow);
    this._radialRight?.classList.toggle('visible', shouldShow);
  }

  _onRadialStart(event) {
    const target = event.currentTarget;
    const isLeft = target === this._radialLeft;
    this._radialActive.left = isLeft;
    this._radialActive.right = !isLeft;
    this._radialPointerId = event.pointerId ?? event.touches?.[0]?.identifier ?? null;
    this._setRadialVisibility();
    this._radialLeft?.classList.add('visible');
    this._radialRight?.classList.add('visible');
    if (event.touches?.[0]) {
      this._updateRadialKnob(target, event.touches[0].clientX, event.touches[0].clientY);
    }
    event.preventDefault();
  }

  _onRadialMove(event) {
    const target = event.currentTarget;
    if (!target) return;
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (!touch) return;
    this._updateRadialKnob(target, touch.clientX, touch.clientY);
    const isLeft = target === this._radialLeft;
    if (isLeft) {
      this.keys.left = touch.clientX < window.innerWidth / 2;
      this.keys.right = false;
    } else {
      this.keys.right = touch.clientX > window.innerWidth / 2;
      this.keys.left = false;
    }
    event.preventDefault();
  }

  _onRadialEnd(event) {
    this.keys.left = false;
    this.keys.right = false;
    this._resetRadialKnobs();
    this._setRadialVisibility();
    event.preventDefault();
  }

  _onGBStickStart(event) {
    const target = event.currentTarget;
    if (!target) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    // show overlay/sticks if hidden
    this._gbOverlay?.classList.add('visible');
    this._updateGBKnob(target, touch.clientX, touch.clientY);
    event.preventDefault();
  }

  _onGBStickMove(event) {
    const target = event.currentTarget;
    if (!target) return;
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (!touch) return;
    this._updateGBKnob(target, touch.clientX, touch.clientY);

    // map to axes and controls
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.42;
    const dx = (touch.clientX - centerX) / maxRadius;
    const dy = (touch.clientY - centerY) / maxRadius;
    const clampedX = Math.max(-1, Math.min(1, dx));
    const clampedY = Math.max(-1, Math.min(1, dy));

    if (target === this._gbLeftStick) {
      this._leftAxis.x = clampedX;
      this._leftAxis.y = clampedY;
      // map to directional keys using deadzone
      const dead = 0.4;
      this.keys.forward = this._leftAxis.y < -dead;
      this.keys.backward = this._leftAxis.y > dead;
      this.keys.left = this._leftAxis.x < -dead;
      this.keys.right = this._leftAxis.x > dead;
    } else if (target === this._gbRightStick) {
      this._rightAxis.x = clampedX;
      this._rightAxis.y = clampedY;
      // map to camera yaw/pitch deltas
      const lookSpeed = 0.035;
      this.yaw -= this._rightAxis.x * lookSpeed;
      this.pitch -= this._rightAxis.y * lookSpeed;
      this.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.pitch));
    }

    event.preventDefault();
  }

  _onGBStickEnd(event) {
    const target = event.currentTarget;
    if (!target) return;
    // reset knob and axes
    const knob = target.querySelector('.gb-stick-knob');
    if (knob) knob.style.transform = 'translate(0px, 0px)';
    if (target === this._gbLeftStick) {
      this._leftAxis.x = 0; this._leftAxis.y = 0;
      this.keys.forward = false; this.keys.backward = false; this.keys.left = false; this.keys.right = false;
    } else {
      this._rightAxis.x = 0; this._rightAxis.y = 0;
    }
    event.preventDefault();
  }

  _updateGBKnob(target, clientX, clientY) {
    const knob = target.querySelector('.gb-stick-knob');
    if (!knob) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const maxOffset = rect.width * 0.42;
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));
    knob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  }

  _updateRadialKnob(target, clientX, clientY) {
    const knob = target === this._radialLeft ? this._radialKnobs.left : this._radialKnobs.right;
    if (!knob) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const maxOffset = rect.width * 0.22;
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));
    knob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  }

  _resetRadialKnobs() {
    Object.values(this._radialKnobs).forEach((knob) => {
      if (knob) knob.style.transform = 'translate(0px, 0px)';
    });
  }

  _onTouchButtonStart(event) {
    event.preventDefault();
    const button = event.currentTarget?.id;
    switch (button) {
      case 'btn-up': case 'gb-up': this.keys.forward = true; break;
      case 'btn-down': case 'gb-down': this.keys.backward = true; break;
      case 'btn-left': case 'gb-left': this.keys.left = true; break;
      case 'btn-right': case 'gb-right': this.keys.right = true; break;
      case 'btn-run': case 'gb-b': this.keys.run = true; break;
      case 'btn-jump': case 'gb-a': this.keys.jump = true; break;
    }
  }

  _onTouchButtonEnd(event) {
    event.preventDefault();
    const button = event.currentTarget?.id;
    switch (button) {
      case 'btn-up': case 'gb-up': this.keys.forward = false; break;
      case 'btn-down': case 'gb-down': this.keys.backward = false; break;
      case 'btn-left': case 'gb-left': this.keys.left = false; break;
      case 'btn-right': case 'gb-right': this.keys.right = false; break;
      case 'btn-run': case 'gb-b': this.keys.run = false; break;
      case 'btn-jump': case 'gb-a': this.keys.jump = false; break;
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
