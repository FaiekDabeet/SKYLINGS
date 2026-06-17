// ============================================================
// STAR BACKGROUND  –  Canvas starfield + shooting stars
// ============================================================

export const StarBG = {
  canvas: null,
  ctx: null,
  stars: [],
  shooters: [],

  init() {
    this.canvas = document.getElementById('star-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.resize();
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * this.canvas.height,
        r:  0.2 + Math.random() * 1.6,
        sp: 0.3 + Math.random() * 0.8,
        ph: Math.random() * Math.PI * 2,
      });
    }
    window.addEventListener('resize', () => this.resize());
    this._loop();
  },

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  _spawnShooter() {
    if (Math.random() < 0.003) {
      this.shooters.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * (this.canvas.height * 0.5),
        vx: 4 + Math.random() * 6,
        vy: 2 + Math.random() * 4,
        life: 1,
      });
    }
  },

  _loop() {
    requestAnimationFrame(() => this._loop());
    const ctx = this.ctx;
    const t   = Date.now() * 0.001;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Static stars
    this.stars.forEach(s => {
      ctx.globalAlpha = Math.max(0, 0.25 + Math.sin(t * s.sp + s.ph) * 0.45);
      ctx.fillStyle   = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Shooting stars
    this._spawnShooter();
    this.shooters = this.shooters.filter(s => {
      s.x    += s.vx;
      s.y    += s.vy;
      s.life -= 0.022;
      if (s.life <= 0) return false;
      ctx.save();
      ctx.globalAlpha  = s.life * 0.7;
      ctx.strokeStyle  = 'rgba(255,255,220,.8)';
      ctx.lineWidth    = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9);
      ctx.stroke();
      ctx.restore();
      return true;
    });

    ctx.globalAlpha = 1;
  },
};
