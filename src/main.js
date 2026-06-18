// ============================================================
// MAIN ENTRY POINT
// ============================================================

import { StarBG }  from './systems/starbg.js';
import { Fx }      from './systems/notify.js';
import { Notify }  from './systems/notify.js';
import { Audio }   from './systems/audio.js';
import { Minigame } from './systems/minigame.js';
import { Game }    from './game.js';

// ── Loading screen ───────────────────────────────────────────

function runLoader(onDone) {
  const bar  = document.getElementById('load-fill');
  const msg  = document.getElementById('load-msg');
  const msgs = [
    'Awakening the stars…',
    'Loading celestial data…',
    'Summoning creatures…',
    'Preparing your journey…',
    'Almost ready!',
  ];
  let p = 0, mi = 0;

  const tick = setInterval(() => {
    p += Math.random() * 14 + 4;
    bar.style.width = Math.min(100, p) + '%';
    if (p > 25  && mi < 1) { mi = 1; msg.textContent = msgs[1]; }
    if (p > 50  && mi < 2) { mi = 2; msg.textContent = msgs[2]; }
    if (p > 75  && mi < 3) { mi = 3; msg.textContent = msgs[3]; }
    if (p > 90  && mi < 4) { mi = 4; msg.textContent = msgs[4]; }
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        const ls = document.getElementById('load-screen');
        ls.style.opacity = '0';
        setTimeout(() => { ls.style.display = 'none'; onDone(); }, 550);
      }, 400);
    }
  }, 90);
}

// ── Boot ─────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Initialise subsystems
  StarBG.init();
  Fx.init();
  Notify.init();
  Audio.init();
  Minigame.init();
  Game.init();

  // Run loader then show intro
  runLoader(() => Game.showIntro());
});
