// ============================================================
// GAME CONTROLLER  –  Master state machine + all screens
// ============================================================

import { CREATURES, STAGES, CINEMATIC_SCENES } from '../data/creatures.js';
import { ACHIEVEMENTS }  from '../data/achievements.js';
import { ITEMS }         from '../data/items.js';
import { Save }          from '../systems/save.js';
import { Audio }         from '../systems/audio.js';
import { Notify, Fx }    from '../systems/notify.js';
import { Minigame }      from '../systems/minigame.js';
import { Scene3D }       from '../three/scene3d.js';
import { Modal, AchPanel, ItemsUI, Tabs, HUD } from '../ui/ui.js';

export const Game = {
  save:            null,
  selectedId:      null,
  screen:          'intro',
  decayTimer:      null,
  dlgTimer:        null,
  dlgHide:         null,
  activeMinigame:  null,
  _orbInterval:    null,

  // ── Boot ──────────────────────────────────────────────────

  init() {
    Modal.init();
    Tabs.init();
    this._bindAll();
  },

  // ── Screen router ─────────────────────────────────────────

  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`)?.classList.add('active');
    this.screen = id;
  },

  // ── INTRO ─────────────────────────────────────────────────

  showIntro() {
    const existing = Save.read();
    if (existing?.creatureId) {
      const hint = document.getElementById('btn-continue');
      hint.classList.remove('hidden');
      document.getElementById('continue-name').textContent =
        `${existing.creatureName} (Stage ${existing.stage})`;
      hint.addEventListener('click', () => {
        Audio.resume();
        this.save = existing;
        this.startGame();
      }, { once: true });
    }

    // Cycle intro orb emoji
    const orb   = document.getElementById('intro-orb');
    const emojis = ['✦', '🌌', '☄️', '✨', '⭐'];
    let oi = 0;
    this._orbInterval = setInterval(() => {
      orb.textContent = emojis[++oi % emojis.length];
    }, 2000);

    this.show('intro');
  },

  // ── CINEMATIC ─────────────────────────────────────────────

  showCinematic() {
    clearInterval(this._orbInterval);
    let idx = 0;

    const render = i => {
      const s     = CINEMATIC_SCENES[i];
      const title = document.getElementById('cin-title');
      const body  = document.getElementById('cin-body');
      document.getElementById('cin-emoji').textContent = s.emoji;
      title.classList.remove('show'); body.classList.remove('show');
      title.textContent = s.title;   body.textContent  = s.body;
      setTimeout(() => title.classList.add('show'), 80);
      setTimeout(() =>  body.classList.add('show'), 260);

      const dots = document.getElementById('cin-dots');
      dots.innerHTML = CINEMATIC_SCENES
        .map((_, j) => `<div class="cin-dot${j === i ? ' on' : ''}"></div>`)
        .join('');
    };

    render(0);
    this.show('cinematic');

    document.getElementById('cin-next').onclick = () => {
      idx++;
      if (idx >= CINEMATIC_SCENES.length) { this.showChoose(); return; }
      render(idx);
    };
    document.getElementById('cin-skip').onclick = () => this.showChoose();
  },

  // ── CHOOSE ────────────────────────────────────────────────

  showChoose() {
    const cont = document.getElementById('creature-cards');
    cont.innerHTML = '';

    Object.values(CREATURES).forEach(c => {
      const el = document.createElement('div');
      el.className  = 'creature-card';
      el.dataset.id = c.id;
      el.innerHTML  = `
        <span class="cc-e">${c.stageEmoji[0]}</span>
        <div class="cc-n" style="color:${c.colorHex}">${c.name}</div>
        <div class="cc-c">${c.core}</div>
        <div class="cc-traits">
          ${c.personality.map(p => `<span class="trait-tag">${p}</span>`).join('')}
        </div>
        <div class="cc-theme">${c.theme}</div>
      `;
      el.addEventListener('click', () => this._selectCreature(c.id));
      cont.appendChild(el);
    });

    this.show('choose');
  },

  _selectCreature(id) {
    this.selectedId = id;
    document.querySelectorAll('.creature-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-id="${id}"]`)?.classList.add('selected');

    const d = CREATURES[id];
    document.getElementById('creature-detail').innerHTML = `
      <div>
        <div class="cd-label">Destiny</div>
        <div class="cd-val">${d.endingTitle}</div>
      </div>
      <div style="font-size:.8rem;color:var(--txt-m)">${d.stageEmoji[0]} Stage 1</div>
    `;

    const btn = document.getElementById('btn-choose');
    btn.style.opacity       = '1';
    btn.style.pointerEvents = 'all';

    Audio.tap();
    Fx.burst(window.innerWidth / 2, window.innerHeight * 0.6, d.colorHex, 10);
  },

  // ── NAME ──────────────────────────────────────────────────

  showName() {
    const d = CREATURES[this.selectedId];
    document.getElementById('name-emo').textContent  = d.stageEmoji[0];
    document.getElementById('name-sub').textContent  = `What will you call your ${d.name}?`;
    document.getElementById('name-sugs').innerHTML   =
      d.nameSugs.map(n => `<span class="name-sug">${n}</span>`).join('');
    document.getElementById('name-inp').value = '';

    // Suggestion click
    document.getElementById('name-sugs').querySelectorAll('.name-sug').forEach(el => {
      el.addEventListener('click', () => {
        document.getElementById('name-inp').value = el.textContent;
      });
    });

    this.show('name');
  },

  // ── START GAME ────────────────────────────────────────────

  startGame() {
    if (!this.save?.creatureId) {
      const nameVal = document.getElementById('name-inp')?.value?.trim();
      const fallback = CREATURES[this.selectedId].name;
      this.save = {
        ...Save.default(),
        creatureId:   this.selectedId,
        creatureName: nameVal || fallback,
      };
      this.unlock('first_hatch');
    }

    // Render items tab
    ItemsUI.render(this.save.items, id => this._useItem(id));

    // Boot Three.js after DOM is ready
    setTimeout(() => {
      Scene3D.init('game-three-canvas');
      Scene3D.buildCreature(this.save.creatureId, this.save.stage);
    }, 120);

    HUD.update(this.save, CREATURES, STAGES);
    this._startDecay();
    this._startDialogue();
    this.show('game');
    Save.write(this.save);

    const d = CREATURES[this.save.creatureId];
    setTimeout(() => Notify.ok(`Welcome, Guardian! ${d.name} is counting on you. ✦`), 900);
  },

  // ── STAT DECAY ────────────────────────────────────────────

  _startDecay() {
    if (this.decayTimer) clearInterval(this.decayTimer);
    this.decayTimer = setInterval(() => {
      if (!this.save || this.screen !== 'game') return;
      const s    = this.save.stats;
      const mult = this.save.awakenChoice ? 0.8 : 1;

      s.hunger = Math.max(0, s.hunger - 0.9 * mult);
      s.energy = Math.max(0, s.energy - 0.55 * mult);
      s.happy  = Math.max(0, s.happy  - 0.65 * mult);
      s.clean  = Math.max(0, s.clean  - 0.4  * mult);

      const avg = (s.hunger + s.energy + s.happy + s.clean) / 4;
      if (avg > 65) {
        s.starEnergy = Math.min(100, s.starEnergy + 0.06);
        this.save.xp = Math.min(750, (this.save.xp || 0) + 0.025);
      }
      if (avg < 80) this.save.sessionPerfect = false;

      // Low-stat warnings (random so they don't spam)
      if (s.hunger < 20 && Math.random() < 0.08)
        Notify.bad(`${this.save.creatureName} is hungry! 🍎`);
      if (s.energy < 20 && Math.random() < 0.08)
        Notify.bad(`${this.save.creatureName} is exhausted! 💤`);

      this.save.playTime = (this.save.playTime || 0) + 3;

      // Check evolution
      const nxt = STAGES[this.save.stage];
      if (nxt && this.save.xp >= nxt.xpReq) this._triggerEvolution();

      // Check star awakening
      if (this.save.stage === 3 && !this.save.awakenChoice)
        setTimeout(() => this._triggerAwakening(), 2000);

      HUD.update(this.save, CREATURES, STAGES);
      Save.write(this.save);
    }, 3000);
  },

  // ── DIALOGUE ──────────────────────────────────────────────

  _startDialogue() {
    if (this.dlgTimer) clearInterval(this.dlgTimer);
    const say = () => {
      if (!this.save || this.screen !== 'game') return;
      const lines = CREATURES[this.save.creatureId].dialogue[this.save.stage] || ['...'];
      this._showDlg(lines[Math.floor(Math.random() * lines.length)]);
    };
    this.dlgTimer = setInterval(say, 14_000);
    setTimeout(say, 2200);
  },

  _showDlg(text) {
    const dlg = document.getElementById('dlg');
    dlg.textContent = text;
    dlg.classList.remove('off');
    clearTimeout(this.dlgHide);
    this.dlgHide = setTimeout(() => dlg.classList.add('off'), 4500);
  },

  // ── PLAYER ACTIONS ────────────────────────────────────────

  doAction(type) {
    if (!this.save) return;
    Audio.resume();
    Audio.tap();

    const s  = this.save.stats;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight * 0.38;

    Scene3D.anim(
      type === 'sleep'   ? 'sleep'   :
      type === 'train'   ? 'train'   :
      type === 'clean'   ? 'clean'   :
      type === 'explore' ? 'explore' : 'happy'
    );

    switch (type) {
      case 'feed':
        s.hunger     = Math.min(100, s.hunger + 32);
        s.happy      = Math.min(100, s.happy  + 5);
        s.starEnergy = Math.min(100, s.starEnergy + 2);
        this._addXP(6);
        Notify.ok('🍎 +32 Hunger!');
        Fx.burst(cx, cy, '#ff9d00', 9);
        break;

      case 'sleep':
        this._triggerSleep();
        return;

      case 'play':
        s.happy      = Math.min(100, s.happy  + 28);
        s.energy     = Math.max(0,   s.energy - 8);
        s.starEnergy = Math.min(100, s.starEnergy + 5);
        this._addXP(9);
        Notify.ok('💖 +28 Happiness!');
        Fx.burst(cx, cy, '#ff6eb4', 10);
        break;

      case 'clean':
        s.clean = Math.min(100, s.clean + 42);
        s.happy = Math.min(100, s.happy + 7);
        this._addXP(5);
        this.save.cleanCount = (this.save.cleanCount || 0) + 1;
        Notify.ok('✨ +42 Cleanliness!');
        Fx.burst(cx, cy, '#7aff9e', 9);
        if (this.save.cleanCount >= 5) this.unlock('squeaky');
        break;

      case 'train':
        if (s.energy < 15) { Notify.bad('Too tired to train! 💤'); Audio.error(); return; }
        s.energy     = Math.max(0,   s.energy - 18);
        s.starEnergy = Math.min(100, s.starEnergy + 14);
        this._addXP(16);
        this.save.trainCount = (this.save.trainCount || 0) + 1;
        Notify.star('⚡ +14 Star Energy!');
        Fx.starBurst(cx, cy);
        if (this.save.trainCount >= 10) this.unlock('trainer');
        break;

      case 'explore':
        if (s.energy < 12) { Notify.bad('Too tired to explore! 💤'); Audio.error(); return; }
        s.energy     = Math.max(0,   s.energy - 14);
        s.starEnergy = Math.min(100, s.starEnergy + 9);
        this._addXP(14);
        this.save.exploreCount = (this.save.exploreCount || 0) + 1;
        const finds = [
          'a shimmering crystal 💎', 'ancient star fragments ✨',
          'a cosmic flower 🌸',      'forgotten memories 💭',
          'a glowing void shard 🌑', 'nebula dust 🌌',
        ];
        Notify.star(`Found ${finds[Math.floor(Math.random() * finds.length)]}!`);
        Fx.starBurst(cx, cy);
        this._grantRandomItem();
        if (this.save.exploreCount >= 5) this.unlock('explorer5');
        break;
    }

    HUD.update(this.save, CREATURES, STAGES);
    Save.write(this.save);
  },

  _addXP(n) {
    const mult = this.save.awakenChoice ? 1.25 : 1;
    const gain = Math.round(n * mult);
    this.save.xp      = Math.min(750, (this.save.xp      || 0) + gain);
    this.save.totalXp = (this.save.totalXp || 0) + gain;
    this.save.stats.starEnergy = Math.min(100, this.save.stats.starEnergy + gain * 0.08);
  },

  // ── ITEMS ─────────────────────────────────────────────────

  _useItem(id) {
    const def   = ITEMS.find(i => i.id === id);
    if (!def) return;
    const saved = this.save.items.find(x => x.id === id);
    if (!saved || saved.qty <= 0) { Notify.bad('None left!'); return; }

    saved.qty--;
    const s = this.save.stats;
    Object.entries(def.effect).forEach(([k, v]) => {
      if (k === 'starEnergy') s.starEnergy = Math.min(100, s.starEnergy + v);
      else if (k in s)        s[k]         = Math.min(100, s[k] + v);
    });

    Audio.star();
    Fx.starBurst(window.innerWidth / 2, window.innerHeight * 0.5);
    Notify.star(`Used ${def.name}! ${def.emoji}`);

    HUD.update(this.save, CREATURES, STAGES);
    ItemsUI.render(this.save.items, id2 => this._useItem(id2));
    Save.write(this.save);
  },

  _grantRandomItem() {
    const pool  = ITEMS.filter(i => i.qty > 0);
    if (!pool.length) return;
    const def   = pool[Math.floor(Math.random() * pool.length)];
    const saved = this.save.items.find(x => x.id === def.id);
    if (saved) saved.qty++;
    ItemsUI.render(this.save.items, id => this._useItem(id));
  },

  // ── SLEEP ─────────────────────────────────────────────────

  _triggerSleep() {
    const ov  = document.getElementById('sleep-ov');
    const d   = CREATURES[this.save.creatureId];
    document.getElementById('sleep-emo').textContent = d.stageEmoji[this.save.stage - 1];
    ov.classList.add('show');
    Scene3D.anim('sleep');

    this.save.sleepCount = (this.save.sleepCount || 0) + 1;
    let prog = 0;
    document.getElementById('sleep-fill').style.width = '0%';

    const tick = setInterval(() => {
      prog += 8;
      document.getElementById('sleep-fill').style.width = Math.min(100, prog) + '%';
      this.save.stats.energy = Math.min(100, this.save.stats.energy + 9);
      this.save.stats.happy  = Math.min(100, this.save.stats.happy  + 2);
      document.getElementById('sleep-sub').textContent =
        `Energy: ${Math.round(this.save.stats.energy)}%`;

      if (prog >= 100) {
        clearInterval(tick);
        ov.classList.remove('show');
        Scene3D.anim('idle');
        Notify.ok(`${this.save.creatureName} woke up refreshed! ⚡`);
        this._addXP(4);
        HUD.update(this.save, CREATURES, STAGES);
        Save.write(this.save);
      }
    }, 400);

    if (this.save.sleepCount >= 3) this.unlock('sleepy');
  },

  // ── EVOLUTION ─────────────────────────────────────────────

  _triggerEvolution() {
    // Guard: only evolve once per stage
    const nxt = STAGES[this.save.stage];
    if (!nxt || this.save.xp < nxt.xpReq) return;
    if (this.save.stage >= 5) return;
    if (this._evolving) return;        // prevent double-trigger
    this._evolving = true;

    this.save.stage++;
    const ns = this.save.stage;
    const d  = CREATURES[this.save.creatureId];

    // Show evolution cinematic overlay
    const evoScreen = document.getElementById('evo-screen');
    document.getElementById('evo-ring').textContent = d.stageEmoji[ns - 1] || '⭐';
    document.getElementById('evo-title').textContent = `Stage ${ns}: ${d.stageNames[ns - 1]}!`;
    document.getElementById('evo-sub').textContent   = `${this.save.creatureName} has evolved!`;
    evoScreen.classList.add('show');

    Scene3D.anim('evo');
    Audio.evolve();
    Fx.evoBurst();
    setTimeout(() => Fx.evoBurst(), 600);
    setTimeout(() => Fx.evoBurst(), 1200);

    setTimeout(() => {
      evoScreen.classList.remove('show');
      Scene3D.buildCreature(this.save.creatureId, ns);
      Scene3D.anim('happy');
      Notify.evo(`✨ EVOLVED! Stage ${ns}: ${d.stageNames[ns - 1]}`);
      this._evolving = false;

      if (ns === 5) {
        setTimeout(() => this._triggerEnding(), 2500);
        return;
      }
      HUD.update(this.save, CREATURES, STAGES);
      Save.write(this.save);
    }, 3200);

    const achMap = { 2: 'first_evo', 3: 'cosmic_friend', 4: 'guardian_bond', 5: 'celestial' };
    if (achMap[ns]) this.unlock(achMap[ns]);

    Save.write(this.save);
  },

  // ── STAR AWAKENING ────────────────────────────────────────

  _triggerAwakening() {
    if (this.save.awakenChoice) return;
    const d = CREATURES[this.save.creatureId];

    const cards = d.awakenPowers.map(p => `
      <div class="awaken-card" data-power="${p.id}" data-name="${p.name}">
        <div class="aw-n">✦ ${p.name}</div>
        <div class="aw-d">${p.desc}</div>
      </div>
    `).join('');

    Modal.show({
      title: '★ Star Awakening',
      sub:   `${this.save.creatureName} remembers fragments of its past life… Choose one power to unlock!`,
      emo:   '🌟',
      body:  `<div class="awaken-cards">${cards}</div>`,
    });

    // Attach click handlers AFTER modal renders
    document.querySelectorAll('.awaken-card').forEach(el => {
      el.addEventListener('click', () => {
        this._chooseAwakening(el.dataset.power, el.dataset.name);
      });
    });

    Audio.star();
    Fx.evoBurst();
  },

  _chooseAwakening(id, name) {
    this.save.awakenChoice = id;
    Modal.close();
    this.unlock('star_awakening');
    Notify.star(`${name} awakened! ✦`);
    Audio.evolve();
    Fx.starBurst(window.innerWidth / 2, window.innerHeight * 0.4);
    HUD.update(this.save, CREATURES, STAGES);
    Save.write(this.save);
  },

  // ── ENDING ────────────────────────────────────────────────

  _triggerEnding() {
    const d = CREATURES[this.save.creatureId];
    this.unlock('homecoming');

    if (!this.save.completedCreatures.includes(this.save.creatureId))
      this.save.completedCreatures.push(this.save.creatureId);
    if (this.save.completedCreatures.length >= 5)
      this.unlock('master_guardian');

    const nonSecret = ACHIEVEMENTS.filter(a => !a.secret);
    if (nonSecret.every(a => this.save.achievements.includes(a.id)))
      this.unlock('guardian_legend');

    if (this.save.sessionPerfect) this.unlock('perfect_care');

    const mins = Math.round((this.save.playTime || 0) / 60);
    document.getElementById('end-emo').textContent   = d.stageEmoji[4] || '🌟';
    document.getElementById('end-title').textContent = d.endingTitle;
    document.getElementById('end-sub').textContent   = `${this.save.creatureName}'s Story Complete`;
    document.getElementById('end-txt').textContent   = d.endingText;
    document.getElementById('end-stats').innerHTML   = `
      <div class="end-row"><span class="er-l">Creature</span>           <span class="er-v">${this.save.creatureName} (${d.name})</span></div>
      <div class="end-row"><span class="er-l">Stage Reached</span>      <span class="er-v">5 · Celestial Form</span></div>
      <div class="end-row"><span class="er-l">Power Awakened</span>     <span class="er-v">${this.save.awakenChoice || '—'}</span></div>
      <div class="end-row"><span class="er-l">Time Played</span>        <span class="er-v">${mins} min</span></div>
      <div class="end-row"><span class="er-l">Achievements</span>       <span class="er-v">${this.save.achievements.length} / ${ACHIEVEMENTS.length}</span></div>
      <div class="end-row"><span class="er-l">Creatures Complete</span> <span class="er-v">${this.save.completedCreatures.length} / 5</span></div>
    `;

    Save.write(this.save);
    Audio.evolve();
    setTimeout(() => Fx.evoBurst(), 300);
    setTimeout(() => Fx.evoBurst(), 900);
    this.show('ending');
  },

  // ── ACHIEVEMENTS ──────────────────────────────────────────

  unlock(id) {
    if (!this.save || this.save.achievements.includes(id)) return;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    this.save.achievements.push(id);
    Save.write(this.save);
    setTimeout(() => { Notify.star(`🏆 ${a.name}!`); Audio.star(); }, 400);
  },

  // ── MINIGAMES ─────────────────────────────────────────────

  showMinigameSelect() {
    Modal.show({
      title: '🎮 Minigames',
      sub:   'Play to earn Star Energy for your creature!',
      body:  `
        <div class="mg-select-list">
          <div class="mgl-item" data-game="catch">
            <span class="mgl-icon">⭐</span>
            <div class="mgl-info">
              <div class="mgl-name">Catch The Stars</div>
              <div class="mgl-desc">Catch falling stars before they hit the ground!</div>
            </div>
          </div>
          <div class="mgl-item" data-game="memory">
            <span class="mgl-icon">🔮</span>
            <div class="mgl-info">
              <div class="mgl-name">Memory Match</div>
              <div class="mgl-desc">Match pairs of cosmic symbols!</div>
            </div>
          </div>
          <div class="mgl-item" data-game="dash">
            <span class="mgl-icon">☄️</span>
            <div class="mgl-info">
              <div class="mgl-name">Meteor Dash</div>
              <div class="mgl-desc">Dodge meteors and collect stars!</div>
            </div>
          </div>
        </div>
      `,
    });

    document.querySelectorAll('.mgl-item').forEach(el => {
      el.addEventListener('click', () => this.launchMinigame(el.dataset.game));
    });
  },

  launchMinigame(type) {
    Modal.close();
    const labels = { catch: '⭐ Catch The Stars', memory: '🔮 Memory Match', dash: '☄️ Meteor Dash' };
    document.getElementById('mg-title').textContent = labels[type] || 'Minigame';
    this.activeMinigame = type;
    this.show('minigame');
    setTimeout(() => Minigame.start(type), 80);
  },

  _collectMinigameReward(reward) {
    if (!this.save) return;
    this.save.stats.starEnergy = Math.min(100, this.save.stats.starEnergy + reward);
    this.save.stats.happy      = Math.min(100, this.save.stats.happy + 10);
    this._addXP(Math.round(reward * 0.9));
    if (Math.random() < 0.4) this._grantRandomItem();
    if (this.save.score >= 10) this.unlock('minigame_10');
    HUD.update(this.save, CREATURES, STAGES);
    Save.write(this.save);
  },

  // ── BOND JOURNAL ──────────────────────────────────────────

  showBond() {
    if (!this.save) return;
    const d    = CREATURES[this.save.creatureId];
    const st   = this.save.stage;
    const line = d.dialogue[st][Math.floor(Math.random() * d.dialogue[st].length)];

    Modal.show({
      title: '💫 Your Bond',
      sub:   `${this.save.creatureName} · ${d.stageNames[st - 1]}`,
      emo:   d.stageEmoji[st - 1],
      body:  `
        <div style="background:var(--bg-card);border-radius:var(--r-sm);padding:12px;text-align:left;margin-bottom:10px">
          <div style="font-size:.7rem;color:var(--txt-m);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">DESTINY</div>
          <div style="font-weight:800;color:var(--acc-pink)">${d.endingTitle}</div>
        </div>
        <div style="background:var(--bg-card);border-radius:var(--r-sm);padding:12px;text-align:left;margin-bottom:10px">
          <div style="font-size:.7rem;color:var(--txt-m);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">STAR POWER</div>
          <div style="font-weight:800;color:var(--acc-star)">${this.save.awakenChoice ? `✦ ${this.save.awakenChoice}` : 'Not yet awakened'}</div>
        </div>
        <div style="background:var(--bg-card);border-radius:var(--r-sm);padding:12px;text-align:center;margin-bottom:14px;font-style:italic;font-size:.9rem;line-height:1.5;color:var(--txt)">"${line}"</div>
        <button class="m-btn" id="bond-close-btn">Close 💫</button>
      `,
    });

    document.getElementById('bond-close-btn').addEventListener('click', () => Modal.close());
  },

  // ── MENU ──────────────────────────────────────────────────

  showMenu() {
    Modal.show({
      title: '⚙️ Menu',
      body:  `
        <button class="m-btn"        id="menu-continue">Continue Playing</button>
        <button class="m-btn-sec"    id="menu-bond">💫 Bond Journal</button>
        <button class="m-btn-sec"    id="menu-ach">🏆 Achievements</button>
        <button class="m-btn-danger" id="menu-reset">⚠️ New Game</button>
      `,
    });

    document.getElementById('menu-continue').addEventListener('click', () => Modal.close());
    document.getElementById('menu-bond').addEventListener('click', () => { Modal.close(); this.showBond(); });
    document.getElementById('menu-ach').addEventListener('click', () => {
      Modal.close();
      AchPanel.render(this.save?.achievements || []);
      this.show('achievements');
    });
    document.getElementById('menu-reset').addEventListener('click', () => {
      if (confirm('Reset ALL progress? This cannot be undone.')) {
        Save.clear();
        location.reload();
      }
    });
  },

  // ── NAV HELPER ────────────────────────────────────────────

  setNav(active) {
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
    document.getElementById(`nav-${active}`)?.classList.add('on');
  },

  // ── BIND ALL EVENTS ───────────────────────────────────────

  _bindAll() {
    // Intro
    document.getElementById('btn-start').addEventListener('click', () => {
      Audio.resume(); Audio.tap(); this.showCinematic();
    });

    // Choose
    document.getElementById('btn-choose').addEventListener('click', () => {
      if (this.selectedId) this.showName();
    });

    // Name confirm
    document.getElementById('btn-name').addEventListener('click', () => {
      const v = document.getElementById('name-inp').value.trim();
      if (!v) { Notify.bad('Please enter a name!'); Audio.error(); return; }
      this.selectedId = this.selectedId || Object.keys(CREATURES)[0];
      this.startGame();
    });
    document.getElementById('name-inp').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-name').click();
    });

    // Action buttons
    document.getElementById('act-feed').addEventListener('click',    () => this.doAction('feed'));
    document.getElementById('act-sleep').addEventListener('click',   () => this.doAction('sleep'));
    document.getElementById('act-play').addEventListener('click',    () => this.doAction('play'));
    document.getElementById('act-clean').addEventListener('click',   () => this.doAction('clean'));
    document.getElementById('act-train').addEventListener('click',   () => this.doAction('train'));
    document.getElementById('act-explore').addEventListener('click', () => this.doAction('explore'));

    // HUD buttons
    document.getElementById('btn-ach').addEventListener('click', () => {
      AchPanel.render(this.save?.achievements || []);
      this.show('achievements');
    });
    document.getElementById('btn-menu').addEventListener('click', () => this.showMenu());

    // Bottom nav
    document.getElementById('nav-home').addEventListener('click', () => {
      this.show('game'); this.setNav('home');
    });
    document.getElementById('nav-play').addEventListener('click', () => {
      this.showMinigameSelect(); this.setNav('play');
    });
    document.getElementById('nav-bond').addEventListener('click', () => {
      this.showBond(); this.setNav('bond');
    });
    document.getElementById('nav-ach').addEventListener('click', () => {
      AchPanel.render(this.save?.achievements || []);
      this.show('achievements');
      this.setNav('ach');
    });

    // Achievements back
    document.getElementById('ach-back').addEventListener('click', () => this.show('game'));

    // Minigame buttons
    document.getElementById('mg-back').addEventListener('click', () => {
      Minigame.active = false;
      this.show('game');
      this.setNav('home');
    });
    document.getElementById('mg-done').addEventListener('click', () => {
      const r = Minigame.end();
      this._collectMinigameReward(r);
      Minigame.active = false;
      this.show('game');
      this.setNav('home');
    });
    document.getElementById('mg-again').addEventListener('click', () => {
      if (this.activeMinigame) Minigame.start(this.activeMinigame);
    });

    // Ending replay
    document.getElementById('btn-replay').addEventListener('click', () => {
      Save.clear();
      location.reload();
    });

    // Tap creature canvas
    document.getElementById('game-three-canvas')?.addEventListener('click', () => {
      if (!this.save) return;
      Scene3D.anim('happy');
      Audio.star();
      const d     = CREATURES[this.save.creatureId];
      const lines = d.dialogue[this.save.stage] || ['...'];
      this._showDlg(lines[Math.floor(Math.random() * lines.length)]);
      Fx.burst(window.innerWidth / 2, window.innerHeight * 0.35, d.colorHex, 8);
    });
  },
};
