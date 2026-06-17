// ============================================================
// AUDIO SYSTEM  –  Web Audio API (no assets needed)
// ============================================================

export const Audio = {
  ctx: null,
  ok: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.ok = false;
    }
  },

  /** Resume context after a user gesture (required by browsers) */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  /** Play a simple oscillator tone */
  tone(freq = 440, dur = 0.1, type = 'sine', vol = 0.08) {
    if (!this.ok || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.frequency.value = freq;
      o.type = type;
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    } catch (e) { /* ignore */ }
  },

  // ── Preset sounds ──────────────────────────────────────────

  tap()     { this.tone(660, 0.07, 'sine', 0.07); },
  error()   { this.tone(200, 0.18, 'sawtooth', 0.05); },
  notif()   { this.tone(880, 0.06, 'sine', 0.05); },

  success() {
    this.tone(784, 0.10, 'sine', 0.08);
    setTimeout(() => this.tone(1046, 0.15, 'sine', 0.07), 100);
  },

  star() {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.13, 'sine', 0.07), i * 70)
    );
  },

  evolve() {
    [261, 329, 392, 523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.25, 'sine', 0.10), i * 120)
    );
  },
};
