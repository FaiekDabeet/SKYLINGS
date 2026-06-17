// ============================================================
// UI SYSTEM  –  Modal, Achievements, Items, Tabs
// ============================================================

import { ACHIEVEMENTS } from '../data/achievements.js';
import { ITEMS }        from '../data/items.js';
import { Audio }        from '../systems/audio.js';

// ── Modal ─────────────────────────────────────────────────────

export const Modal = {
  show({ title = '', sub = '', emo = '', body = '' }) {
    document.getElementById('modal-body').innerHTML = `
      ${emo ? `<span class="m-emo">${emo}</span>` : ''}
      ${title ? `<div class="m-title">${title}</div>` : ''}
      ${sub   ? `<div class="m-sub">${sub}</div>`   : ''}
      ${body}
    `;
    document.getElementById('modal-ov').classList.add('show');
  },

  close() {
    document.getElementById('modal-ov').classList.remove('show');
  },

  init() {
    document.getElementById('modal-ov').addEventListener('click', e => {
      if (e.target.id === 'modal-ov') this.close();
    });
  },
};

// ── Achievements Panel ────────────────────────────────────────

export const AchPanel = {
  render(unlockedIds = []) {
    const list = document.getElementById('ach-list');
    list.innerHTML = '';
    document.getElementById('ach-count').textContent =
      `${unlockedIds.length} / ${ACHIEVEMENTS.length}`;

    ACHIEVEMENTS.forEach(a => {
      const yes = unlockedIds.includes(a.id);
      const el  = document.createElement('div');
      el.className = `ach-item${yes ? ' yes' : ''}`;
      el.innerHTML = `
        <div class="ach-ic">${yes ? a.icon : '🔒'}</div>
        <div class="ach-inf">
          <div class="ach-nm">${a.secret && !yes ? '???' : a.name}</div>
          <div class="ach-ds">${a.secret && !yes ? 'Keep playing to reveal this secret…' : a.desc}</div>
        </div>
        ${yes ? '<div class="ach-badge">✓</div>' : ''}
      `;
      list.appendChild(el);
    });
  },
};

// ── Items Grid ────────────────────────────────────────────────

export const ItemsUI = {
  /** Render the items grid. onUse(id) is called when player taps a slot. */
  render(savedItems = [], onUse) {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = '';

    ITEMS.forEach(def => {
      const saved = savedItems.find(x => x.id === def.id) || { qty: 0 };
      const slot  = document.createElement('div');
      slot.className = `item-slot${saved.qty <= 0 ? ' empty' : ''}`;
      slot.innerHTML = `
        <span class="is-e">${def.emoji}</span>
        <span class="is-n">${def.name}</span>
        ${saved.qty > 0 ? `<span class="is-q">x${saved.qty}</span>` : ''}
      `;
      if (saved.qty > 0) slot.addEventListener('click', () => onUse(def.id));
      grid.appendChild(slot);
    });
  },
};

// ── Panel Tabs ────────────────────────────────────────────────

export const Tabs = {
  init() {
    document.querySelectorAll('.ptab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.ptab').forEach(t => t.classList.remove('on'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('on'));
        tab.classList.add('on');
        document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('on');
        Audio.tap();
      });
    });
  },
};

// ── HUD updater ───────────────────────────────────────────────

export const HUD = {
  update(save, creatures, stages) {
    if (!save) return;
    const d   = creatures[save.creatureId];
    const st  = save.stage;
    const stg = stages[st - 1];
    const nxt = stages[st];
    const sn  = d.stageNames[st - 1] || stg.name;
    const emo = d.stageEmoji[Math.min(st, d.stageEmoji.length - 1)];

    // Mood ring
    const mr = document.getElementById('mood-ring');
    mr.textContent = emo;
    const s = save.stats;
    mr.className = 'mood-ring' + (s.happy > 65 ? ' happy' : s.hunger < 30 ? ' hungry' : ' sad');

    // Name / stage
    document.getElementById('hud-name').textContent  = save.creatureName;
    document.getElementById('hud-stage').textContent = `Stage ${st} · ${sn}`;

    // Core stats
    const statMap = {
      hunger: ['sv-hunger', 'sf-hunger'],
      energy: ['sv-energy', 'sf-energy'],
      happy:  ['sv-happy',  'sf-happy'],
      clean:  ['sv-clean',  'sf-clean'],
    };
    Object.entries(statMap).forEach(([k, [vid, fid]]) => {
      const v = Math.round(s[k]);
      document.getElementById(vid).textContent  = v;
      document.getElementById(fid).style.width  = v + '%';
    });

    // Star energy
    const se = Math.round(s.starEnergy);
    document.getElementById('se-val').textContent    = se;
    document.getElementById('se-fill').style.width   = Math.min(100, se) + '%';

    // XP bar
    const xp      = save.xp;
    const prevReq = stg.xpReq;
    const nextReq = nxt ? nxt.xpReq : stages[stages.length - 1].xpReq;
    const prog    = nxt ? ((xp - prevReq) / (nextReq - prevReq)) * 100 : 100;
    document.getElementById('xp-fill').style.width  = Math.max(0, Math.min(100, prog)) + '%';
    document.getElementById('xp-lbl-r').textContent = nxt ? `${xp} / ${nextReq}` : '✦ MAX';

    // Disable energy-hungry actions
    document.getElementById('act-train').classList.toggle('disabled', s.energy < 15);
    document.getElementById('act-explore').classList.toggle('disabled', s.energy < 12);
  },
};
