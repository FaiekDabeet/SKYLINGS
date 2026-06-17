// ============================================================
// MINIGAME ENGINE  –  Catch / Memory / Dash
// ============================================================

import { Audio } from '../systems/audio.js';
import { Fx }    from '../systems/notify.js';

export const Minigame = {
  canvas: null,
  ctx:    null,
  score:  0,
  active: false,
  type:   null,

  init() {
    this.canvas = document.getElementById('mg-canvas');
    this.ctx    = this.canvas.getContext('2d');
  },

  resize() {
    const wrap = this.canvas.parentElement;
    this.canvas.width  = wrap.clientWidth;
    this.canvas.height = wrap.clientHeight;
  },

  start(type) {
    this.resize();
    this.score  = 0;
    this.active = true;
    this.type   = type;
    document.getElementById('mg-score').textContent = '0';
    document.getElementById('mg-result').classList.remove('show');
    if (type === 'catch')  this._catch();
    if (type === 'memory') this._memory();
    if (type === 'dash')   this._dash();
  },

  _addScore(n) {
    this.score += n;
    document.getElementById('mg-score').textContent = this.score;
    Audio.star();
    Fx.burst(this.canvas.width / 2, this.canvas.height * 0.3, '#f9d71c', 5);
  },

  /** Call this to finish a game and display results. Returns reward amount. */
  end() {
    this.active = false;
    const rew = Math.min(35, Math.floor(this.score * 2.2));
    document.getElementById('mgr-title').textContent =
      this.score >= 12 ? '⭐ Incredible!' :
      this.score >=  8 ? '✨ Amazing!'    :
      this.score >=  4 ? '👍 Nice!'       : 'Keep trying!';
    document.getElementById('mgr-score').textContent  = `Stars: ${this.score}`;
    document.getElementById('mgr-reward').textContent = `+${rew} Star Energy!`;
    document.getElementById('mg-result').classList.add('show');
    Fx.evoBurst();
    return rew;
  },

  // ── Catch The Stars ────────────────────────────────────────

  _catch() {
    const c = this.canvas, ctx = this.ctx;
    const basket = { x: c.width / 2, y: c.height - 56, w: 90, h: 18 };
    let stars = [], lastSpawn = 0, aid;
    const DUR = 30_000, t0 = Date.now();
    const COLORS = ['#f9d71c', '#ff6eb4', '#7ec8ff', '#7aff9e', '#c084fc'];

    const mv = e => {
      const r  = c.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      basket.x = Math.max(basket.w / 2, Math.min(c.width - basket.w / 2, cx));
    };
    c.addEventListener('mousemove', mv);
    c.addEventListener('touchmove', mv, { passive: true });

    const loop = () => {
      if (!this.active) { cancelAnimationFrame(aid); return; }
      const elapsed = Date.now() - t0;
      const rem     = Math.max(0, DUR - elapsed);
      if (rem <= 0) {
        cancelAnimationFrame(aid);
        c.removeEventListener('mousemove', mv);
        c.removeEventListener('touchmove', mv);
        this.end();
        return;
      }

      // Spawn
      const spawnInterval = Math.max(380, 1100 - this.score * 25);
      if (Date.now() - lastSpawn > spawnInterval) {
        stars.push({
          x:     30 + Math.random() * (c.width - 60),
          y:     -14,
          vy:    2 + Math.random() * 3 + this.score * 0.12,
          r:     13 + Math.random() * 9,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rot:   0,
          rs:    (Math.random() - 0.5) * 0.12,
        });
        lastSpawn = Date.now();
      }

      ctx.clearRect(0, 0, c.width, c.height);

      // Timer arc
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(255,255,255,.08)';
      ctx.beginPath(); ctx.arc(c.width / 2, 38, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = rem > 8000 ? '#f9d71c' : '#ff6eb4';
      ctx.beginPath(); ctx.arc(c.width / 2, 38, 26, -Math.PI / 2, -Math.PI / 2 + (1 - rem / DUR) * Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Nunito'; ctx.textAlign = 'center';
      ctx.fillText(Math.ceil(rem / 1000) + 's', c.width / 2, 44);
      ctx.restore();

      // Stars
      stars = stars.filter(s => {
        s.y += s.vy; s.rot += s.rs;
        if (
          s.y + s.r > basket.y && s.y - s.r < basket.y + basket.h &&
          s.x > basket.x - basket.w / 2 && s.x < basket.x + basket.w / 2
        ) { this._addScore(1); return false; }
        if (s.y > c.height + 20) return false;
        ctx.save();
        ctx.translate(s.x, s.y); ctx.rotate(s.rot);
        ctx.fillStyle = s.color; ctx.shadowColor = s.color; ctx.shadowBlur = 10;
        ctx.font = `${s.r * 1.9}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 0);
        ctx.restore();
        return true;
      });

      // Basket
      ctx.save();
      const g = ctx.createLinearGradient(basket.x - basket.w / 2, basket.y, basket.x + basket.w / 2, basket.y + basket.h);
      g.addColorStop(0, '#7ec8ff'); g.addColorStop(1, '#c084fc');
      ctx.fillStyle = g; ctx.shadowColor = '#7ec8ff'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(basket.x - basket.w / 2, basket.y, basket.w, basket.h, 9); ctx.fill();
      ctx.restore();

      aid = requestAnimationFrame(loop);
    };
    aid = requestAnimationFrame(loop);
  },

  // ── Memory Match ───────────────────────────────────────────

  _memory() {
    const c = this.canvas, ctx = this.ctx;
    const SYMS = ['⭐', '🌙', '☄️', '🌌', '💫', '🔮'];
    const pool = [...SYMS, ...SYMS];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const COLS = 3, ROWS = 4;
    const cardW = Math.floor((c.width  - 32) / COLS);
    const cardH = Math.floor((c.height - 100) / ROWS);
    const SX = 16, SY = 76;

    const cards = pool.map((sym, i) => ({
      sym,
      x: SX + (i % COLS) * cardW + 4,
      y: SY + Math.floor(i / COLS) * cardH + 4,
      w: cardW - 8,
      h: cardH - 8,
      revealed: false,
      matched:  false,
    }));

    let flipped = [], canClick = true, aid;

    const hit = (px, py) =>
      cards.find(cd => !cd.matched && px >= cd.x && px <= cd.x + cd.w && py >= cd.y && py <= cd.y + cd.h);

    const onClick = e => {
      if (!canClick || !this.active) return;
      const r   = c.getBoundingClientRect();
      const px  = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const py  = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      const card = hit(px, py);
      if (!card || card.revealed || flipped.includes(card)) return;
      card.revealed = true;
      flipped.push(card);
      Audio.tap();
      if (flipped.length === 2) {
        canClick = false;
        setTimeout(() => {
          if (flipped[0].sym === flipped[1].sym) {
            flipped.forEach(cd => cd.matched = true);
            this._addScore(2);
            if (cards.every(cd => cd.matched)) {
              cancelAnimationFrame(aid);
              c.removeEventListener('click', onClick);
              c.removeEventListener('touchend', onClick);
              setTimeout(() => this.end(), 500);
            }
          } else {
            flipped.forEach(cd => cd.revealed = false);
          }
          flipped = []; canClick = true;
        }, 900);
      }
    };
    c.addEventListener('click', onClick);
    c.addEventListener('touchend', onClick, { passive: true });

    const loop = () => {
      if (!this.active) { cancelAnimationFrame(aid); return; }
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = 'rgba(240,234,255,.9)'; ctx.font = 'bold 17px Nunito'; ctx.textAlign = 'center';
      ctx.fillText('Match Cosmic Symbols!', c.width / 2, 46);
      ctx.font = '13px Nunito'; ctx.fillStyle = 'rgba(155,143,192,.8)';
      ctx.fillText(`Pairs: ${this.score / 2} / ${SYMS.length}`, c.width / 2, 66);

      cards.forEach(cd => {
        ctx.save();
        ctx.fillStyle   = cd.matched ? 'rgba(122,255,158,.25)' : cd.revealed ? 'rgba(126,200,255,.18)' : 'rgba(45,26,84,.92)';
        ctx.strokeStyle = cd.matched ? '#7aff9e' : cd.revealed ? '#7ec8ff' : 'rgba(255,255,255,.08)';
        ctx.lineWidth   = 1.8;
        ctx.beginPath(); ctx.roundRect(cd.x, cd.y, cd.w, cd.h, 10); ctx.fill(); ctx.stroke();
        if (cd.revealed || cd.matched) {
          ctx.font = `${Math.min(cd.w, cd.h) * 0.42}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(cd.sym, cd.x + cd.w / 2, cd.y + cd.h / 2);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.font = '18px serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('✦', cd.x + cd.w / 2, cd.y + cd.h / 2);
        }
        ctx.restore();
      });
      aid = requestAnimationFrame(loop);
    };
    aid = requestAnimationFrame(loop);
  },

  // ── Meteor Dash ────────────────────────────────────────────

  _dash() {
    const c = this.canvas, ctx = this.ctx;
    const pl = { x: c.width / 2, y: c.height - 80, r: 24 };
    let meteors = [], collectStars = [], t0 = Date.now(), lastM = 0, lastS = 0, speed = 3, aid;

    const mv = e => {
      const r  = c.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      pl.x = Math.max(30, Math.min(c.width - 30, cx));
    };
    c.addEventListener('mousemove', mv);
    c.addEventListener('touchmove', mv, { passive: true });

    const loop = () => {
      if (!this.active) { cancelAnimationFrame(aid); return; }
      const elapsed = Date.now() - t0;
      speed = 3 + Math.floor(elapsed / 7000) * 0.9;

      if (Date.now() - lastM > Math.max(550, 1800 - elapsed * 0.05)) {
        meteors.push({ x: Math.random() * c.width, y: -20, r: 18 + Math.random() * 12, vy: speed + Math.random() * 2, vx: (Math.random() - 0.5) * 1.8 });
        lastM = Date.now();
      }
      if (Date.now() - lastS > 2200) {
        collectStars.push({ x: 30 + Math.random() * (c.width - 60), y: -14, vy: 1.8 });
        lastS = Date.now();
      }

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = 'rgba(240,234,255,.85)'; ctx.font = 'bold 15px Nunito'; ctx.textAlign = 'center';
      ctx.fillText(`⏱ ${Math.floor(elapsed / 1000)}s  ⭐ ${this.score}`, c.width / 2, 36);

      // Player
      ctx.save(); ctx.shadowColor = '#7ec8ff'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#7ec8ff'; ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${pl.r * 1.25}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🌟', pl.x, pl.y); ctx.restore();

      // Collect stars
      collectStars = collectStars.filter(s => {
        s.y += s.vy;
        if (Math.hypot(s.x - pl.x, s.y - pl.y) < pl.r + 14) { this._addScore(1); return false; }
        if (s.y > c.height + 20) return false;
        ctx.save(); ctx.fillStyle = '#f9d71c'; ctx.shadowColor = '#f9d71c'; ctx.shadowBlur = 8;
        ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('⭐', s.x, s.y); ctx.restore();
        return true;
      });

      // Meteors
      let hit = false;
      meteors = meteors.filter(m => {
        m.x += m.vx; m.y += m.vy;
        if (!hit && Math.hypot(m.x - pl.x, m.y - pl.y) < pl.r + m.r - 12) { hit = true; return false; }
        if (m.y > c.height + 30) return false;
        ctx.save(); ctx.font = `${m.r * 1.6}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('☄️', m.x, m.y); ctx.restore();
        return true;
      });

      if (hit) {
        Fx.burst(pl.x, pl.y, '#ff6eb4', 14);
        cancelAnimationFrame(aid);
        c.removeEventListener('mousemove', mv);
        c.removeEventListener('touchmove', mv);
        this.end();
        return;
      }
      if (elapsed > 48_000) {
        cancelAnimationFrame(aid);
        c.removeEventListener('mousemove', mv);
        c.removeEventListener('touchmove', mv);
        this.end();
        return;
      }
      aid = requestAnimationFrame(loop);
    };
    aid = requestAnimationFrame(loop);
  },
};
