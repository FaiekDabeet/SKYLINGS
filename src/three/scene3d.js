// ============================================================
// THREE.JS SCENE  –  Creature rendering + animations
// ============================================================

import * as THREE from 'three';

export const Scene3D = {
  renderer:      null,
  scene:         null,
  camera:        null,
  clock:         null,
  creatureGroup: null,
  bgPts:         null,
  rimLight:      null,

  animState: 'idle',
  animTimer: 0,
  t:         0,
  stage:     1,

  // ── Bootstrap ──────────────────────────────────────────────

  init(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);

    this.scene  = new THREE.Scene();
    this.clock  = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
    this.camera.position.set(0, 1.2, 5);
    this.camera.lookAt(0, 0.3, 0);

    // Lights
    this.scene.add(new THREE.AmbientLight(0x9966ff, 0.55));

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(3, 6, 4);
    sun.castShadow = true;
    this.scene.add(sun);

    const fill = new THREE.PointLight(0x7ec8ff, 0.4, 12);
    fill.position.set(-3, 2, 3);
    this.scene.add(fill);

    this.rimLight = new THREE.PointLight(0xff6eb4, 0.3, 10);
    this.rimLight.position.set(0, 4, -3);
    this.scene.add(this.rimLight);

    // Ground disc
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3.5, 32),
      new THREE.MeshLambertMaterial({ color: 0x1a0a2e, transparent: true, opacity: 0.55 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.3;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Background star cloud
    const pg  = new THREE.BufferGeometry();
    const pos = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 3;
    }
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.bgPts = new THREE.Points(
      pg,
      new THREE.PointsMaterial({ color: 0xf9d71c, size: 0.055, transparent: true, opacity: 0.5 })
    );
    this.scene.add(this.bgPts);

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this._animate();
  },

  resize() {
    if (!this.renderer) return;
    const c = this.renderer.domElement;
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== w || c.height !== h) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  },

  // ── Build creature mesh ────────────────────────────────────

  buildCreature(creatureId, stage) {
    if (this.creatureGroup) {
      this.scene.remove(this.creatureGroup);
      this.creatureGroup = null;
    }
    this.stage = stage;
    this.creatureGroup = new THREE.Group();

    // Shared materials
    const mat   = id => new THREE.MeshLambertMaterial({ color: id });
    const eye   = mat(0xffffff);
    const pupil = mat(0x111111);
    const blush = new THREE.MeshLambertMaterial({ color: 0xff88aa, transparent: true, opacity: 0.55 });

    const builders = {
      peblo:  () => this._peblo(stage, eye, pupil),
      fluffi: () => this._fluffi(stage, eye, pupil, blush),
      voltik: () => this._voltik(stage, eye, pupil),
      moko:   () => this._moko(stage, eye, pupil, blush),
      drako:  () => this._drako(stage, eye, pupil),
    };
    (builders[creatureId] || (() => this._default(eye, pupil)))();

    const sc = 0.5 + (stage - 1) * 0.2;
    this.creatureGroup.scale.setScalar(sc);
    this.scene.add(this.creatureGroup);
  },

  // ── Shared helpers ─────────────────────────────────────────

  _m(color) { return new THREE.MeshLambertMaterial({ color }); },

  _add(mesh) { this.creatureGroup.add(mesh); return mesh; },

  _eyes(eyeM, pupM, lx, ly, lz, rx, ry, rz, r = 0.14, pr = 0.07) {
    const eL = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), eyeM);
    const eR = eL.clone();
    eL.position.set(lx, ly, lz);
    eR.position.set(rx, ry, rz);
    const pL = new THREE.Mesh(new THREE.SphereGeometry(pr, 8, 8), pupM);
    const pR = pL.clone();
    pL.position.set(lx, ly, lz + r * 0.7);
    pR.position.set(rx, ry, rz + r * 0.7);
    [eL, eR, pL, pR].forEach(m => this._add(m));
  },

  // ── Creature builders ──────────────────────────────────────

  _default(eye, pupil) {
    this._add(Object.assign(
      new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), this._m(0x888888)),
      { castShadow: true }
    ));
    this._eyes(eye, pupil, -0.25, 0.2, 0.72, 0.25, 0.2, 0.72);
  },

  _peblo(stage, eye, pupil) {
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 0), this._m(0xa0856a));
    body.castShadow = true;
    this._add(body);

    const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.28, 6);
    [-0.38, 0.38].forEach(x => {
      const leg = new THREE.Mesh(legGeo, this._m(0xa0856a));
      leg.position.set(x, -0.82, 0);
      this._add(leg);
    });

    const rock = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), this._m(0x4caf50));
    rock.position.set(0, 0.94, 0);
    this._add(rock);

    this._eyes(eye, pupil, -0.22, 0.22, 0.65, 0.22, 0.22, 0.65, 0.14, 0.07);

    if (stage >= 3) {
      const cm = new THREE.MeshLambertMaterial({ color: 0x88ffcc, transparent: true, opacity: 0.8 });
      [-0.65, 0.65].forEach(x => {
        const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), cm);
        c.position.set(x, 0.35, 0);
        c.rotation.z = Math.PI / 4;
        this._add(c);
      });
    }
    if (stage >= 5) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.04, 8, 32),
        new THREE.MeshLambertMaterial({ color: 0x4caf50, transparent: true, opacity: 0.6 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.1;
      this._add(ring);
    }
  },

  _fluffi(stage, eye, pupil, blush) {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), this._m(0xffd6ec));
    body.scale.y = 0.88;
    body.castShadow = true;
    this._add(body);

    [[0, 0.88, 0.15], [0.55, 0.5, 0.28], [-0.55, 0.5, 0.28], [0.3, 0.72, -0.38], [-0.3, 0.72, -0.38]]
      .forEach(([x, y, z]) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), this._m(0xffd6ec));
        b.position.set(x, y, z);
        this._add(b);
      });

    if (stage >= 2) {
      const wm = new THREE.MeshLambertMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6 });
      [-1, 1].forEach(s => {
        const w = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 4), wm);
        w.position.set(s * 1.15, 0.18, 0);
        w.scale.set(1, 0.35, 0.55);
        this._add(w);
      });
    }

    this._eyes(eye, pupil, -0.26, 0.26, 0.7, 0.26, 0.26, 0.7, 0.15, 0.075);

    const bL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), blush);
    bL.position.set(-0.42, 0.06, 0.64);
    const bR = bL.clone();
    bR.position.set(0.42, 0.06, 0.64);
    this._add(bL); this._add(bR);

    if (stage >= 4) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.04, 8, 32),
        new THREE.MeshLambertMaterial({ color: 0xffd700, transparent: true, opacity: 0.7 })
      );
      halo.position.y = 1.2;
      this._add(halo);
    }
  },

  _voltik(stage, eye, pupil) {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 12), this._m(0xffe135));
    body.scale.y = 1.1;
    body.castShadow = true;
    this._add(body);

    const sm = this._m(0x4169e1);
    [[0, 1.22, 0, 0], [0.58, 0.8, 0, 0.3], [-0.58, 0.8, 0, -0.3]].forEach(([x, y, z, rz]) => {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.52, 4), sm);
      spike.position.set(x, y, z);
      spike.rotation.z = rz;
      this._add(spike);
    });

    [-0.3, 0.3].forEach(x => {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), sm);
      ant.position.set(x, 1.18, 0);
      ant.rotation.z = x * 0.5;
      this._add(ant);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), sm);
      tip.position.set(x + x * 0.35, 1.56, 0);
      this._add(tip);
    });

    this._eyes(eye, pupil, -0.24, 0.22, 0.65, 0.24, 0.22, 0.65, 0.13, 0.065);

    if (stage >= 3) {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.05, 8, 32),
        new THREE.MeshLambertMaterial({ color: 0x4169e1, transparent: true, opacity: 0.5 })
      );
      torus.rotation.x = Math.PI / 2;
      torus.position.y = 0.1;
      this._add(torus);
    }
    if (stage >= 5) {
      const em = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      for (let i = 0; i < 6; i++) {
        const bolt = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), em);
        const a = (i / 6) * Math.PI * 2;
        bolt.position.set(Math.cos(a) * 1.1, Math.sin(a) * 0.5, 0.2);
        this._add(bolt);
      }
    }
  },

  _moko(stage, eye, pupil, blush) {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 16), this._m(0x98fb98));
    body.scale.y = 0.84;
    body.castShadow = true;
    this._add(body);

    const lm = this._m(0x22cc66);
    [-0.55, 0.55].forEach(x => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lm);
      ear.position.set(x, 0.74, 0);
      ear.scale.set(0.6, 1, 0.4);
      this._add(ear);
    });

    for (let i = 0; i < 5; i++) {
      const a     = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), this._m(0xff69b4));
      petal.position.set(Math.cos(a) * 0.22, 1.05, Math.sin(a) * 0.22);
      this._add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this._m(0xffdd00));
    center.position.y = 1.05;
    this._add(center);

    [-0.55, 0.55].forEach(x => {
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), this._m(0x98fb98));
      paw.position.set(x, -0.7, 0.3);
      paw.scale.set(1, 0.6, 1);
      this._add(paw);
    });

    this._eyes(eye, pupil, -0.24, 0.1, 0.7, 0.24, 0.1, 0.7, 0.16, 0.08);

    const bL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), blush);
    bL.position.set(-0.42, -0.04, 0.66);
    const bR = bL.clone(); bR.position.set(0.42, -0.04, 0.66);
    this._add(bL); this._add(bR);

    if (stage >= 4) {
      const vm = new THREE.MeshLambertMaterial({ color: 0x33aa55, transparent: true, opacity: 0.7 });
      for (let i = 0; i < 6; i++) {
        const v = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), vm);
        const a = (i / 6) * Math.PI * 2;
        v.position.set(Math.cos(a) * 0.9, -0.2, Math.sin(a) * 0.9);
        v.rotation.x = Math.PI * 0.15;
        this._add(v);
      }
    }
  },

  _drako(stage, eye, pupil) {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), this._m(0xff4500));
    body.scale.y = 1.1;
    body.castShadow = true;
    this._add(body);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), this._m(0xff4500));
    snout.position.set(0, -0.1, 0.7);
    snout.scale.set(0.8, 0.65, 0.78);
    this._add(snout);

    const hm = this._m(0xffd700);
    [-0.3, 0.3].forEach(x => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 6), hm);
      horn.position.set(x, 1.02, 0);
      horn.rotation.z = x * 0.85;
      this._add(horn);
    });

    const wm = new THREE.MeshLambertMaterial({ color: 0xffd700, transparent: true, opacity: 0.75 });
    [-1, 1].forEach(s => {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.56, 8, 4), wm);
      wing.position.set(s * 1.2, 0, 0);
      wing.scale.set(1, 0.32, 0.65);
      wing.rotation.z = s * 0.4;
      this._add(wing);
    });

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.17, 0.8, 8), this._m(0xff4500));
    tail.position.set(0, -0.28, -0.72);
    tail.rotation.x = -0.82;
    this._add(tail);

    if (stage >= 2) {
      const fire = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0xff6600, transparent: true, opacity: 0.6 })
      );
      fire.position.set(0, -0.1, 0.95);
      this._add(fire);
    }

    this._eyes(eye, pupil, -0.25, 0.28, 0.65, 0.25, 0.28, 0.65, 0.14, 0.07);

    if (stage >= 4) {
      const crown = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.055, 8, 32),
        this._m(0xffd700)
      );
      crown.position.y = 1.32;
      this._add(crown);
    }
    if (stage >= 5) {
      const am = new THREE.MeshLambertMaterial({ color: 0xff4400, transparent: true, opacity: 0.25 });
      for (let i = 0; i < 8; i++) {
        const a   = (i / 8) * Math.PI * 2;
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), am);
        orb.position.set(Math.cos(a) * 1.2, 0.3, Math.sin(a) * 1.2);
        this._add(orb);
      }
    }
  },

  // ── Animation ──────────────────────────────────────────────

  anim(state) {
    this.animState = state;
    this.animTimer = 0;
  },

  _animate() {
    requestAnimationFrame(() => this._animate());
    if (!this.renderer) return;

    const dt   = this.clock.getDelta();
    this.t     = this.clock.getElapsedTime();
    this.animTimer += dt;

    if (this.bgPts) {
      this.bgPts.rotation.y = this.t * 0.025;
      this.bgPts.rotation.x = Math.sin(this.t * 0.018) * 0.08;
    }
    if (this.rimLight) {
      this.rimLight.intensity = 0.3 + Math.sin(this.t * 2) * 0.12;
    }

    if (this.creatureGroup) {
      const s = 0.5 + (this.stage - 1) * 0.2;
      switch (this.animState) {
        case 'idle':
          this.creatureGroup.position.y = Math.sin(this.t * 1.15) * 0.09;
          this.creatureGroup.rotation.y = Math.sin(this.t * 0.55) * 0.12;
          this.creatureGroup.scale.setScalar(s);
          break;
        case 'happy':
          this.creatureGroup.position.y = Math.abs(Math.sin(this.t * 4.5)) * 0.32;
          this.creatureGroup.rotation.z = Math.sin(this.t * 7) * 0.18;
          if (this.animTimer > 2) this.animState = 'idle';
          break;
        case 'feed':
          this.creatureGroup.scale.setScalar(s * (1 + Math.sin(this.t * 9) * 0.055));
          if (this.animTimer > 1.5) this.animState = 'idle';
          break;
        case 'sleep':
          this.creatureGroup.rotation.z = Math.sin(this.t * 0.45) * 0.22;
          this.creatureGroup.position.y = -0.22;
          break;
        case 'train':
          this.creatureGroup.rotation.y = this.t * 3.5;
          if (this.animTimer > 1.5) this.animState = 'idle';
          break;
        case 'clean':
          this.creatureGroup.position.x = Math.sin(this.t * 8) * 0.15;
          if (this.animTimer > 1.5) { this.creatureGroup.position.x = 0; this.animState = 'idle'; }
          break;
        case 'explore':
          this.creatureGroup.rotation.y = this.t * 2;
          this.creatureGroup.position.y = Math.sin(this.t * 3) * 0.15;
          if (this.animTimer > 2) this.animState = 'idle';
          break;
        case 'evo':
          this.creatureGroup.rotation.y = this.t * 5;
          this.creatureGroup.scale.setScalar(s * (1 + Math.sin(this.t * 10) * 0.12));
          break;
      }
    }

    this.resize();
    this.renderer.render(this.scene, this.camera);
  },
};
