// ============================================================
// NOTIFY  –  Toast notifications
// ============================================================

import { Audio } from './audio.js';

export const Notify = {
  el: null,

  init() {
    this.el = document.getElementById('notifs');
  },

  show(msg, type = '', dur = 2400) {
    const n = document.createElement('div');
    n.className = `notif ${type}`;
    n.textContent = msg;
    this.el.appendChild(n);
    Audio.notif();
    setTimeout(() => {
      n.classList.add('out');
      setTimeout(() => n.remove(), 400);
    }, dur);
  },

  ok(m)   { this.show(m, 'ok'); },
  star(m) { this.show(m, 'star'); },
  evo(m)  { this.show(m, 'evo', 3500); },
  bad(m)  { this.show(m, 'bad'); },
};

// ============================================================
// PARTICLES  –  CSS-animated burst effects
// ============================================================

export const Fx = {
  wrap: null,

  init() {
    this.wrap = document.getElementById('ptcs');
  },

  burst(x, y, color = '#f9d71c', n = 8) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'ptc';
      const angle = (i / n) * Math.PI * 2;
      const dist  = 40 + Math.random() * 70;
      const dx    = Math.cos(angle) * dist;
      const dy    = Math.sin(angle) * dist;
      p.style.cssText = [
        `left:${x}px`, `top:${y}px`,
        `width:${4 + Math.random() * 6}px`,
        `height:${4 + Math.random() * 6}px`,
        `background:${color}`,
        `--pe:translate(${dx}px,${dy}px)`,
        `animation-duration:${0.8 + Math.random() * 0.6}s`,
        `animation-delay:${Math.random() * 0.08}s`,
      ].join(';');
      this.wrap.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  },

  starBurst(x, y) {
    this.burst(x, y, '#f9d71c', 14);
    this.burst(x, y, '#ff6eb4', 8);
  },

  evoBurst() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.35;
    this.burst(cx, cy, '#c084fc', 24);
    this.burst(cx, cy, '#f9d71c', 18);
    this.burst(cx, cy, '#7aff9e', 14);
  },
};
