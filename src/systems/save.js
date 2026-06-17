// ============================================================
// SAVE SYSTEM  –  LocalStorage persistence
// ============================================================

import { ITEMS } from '../data/items.js';

const KEY = 'skylings_v3';

export const Save = {
  /** Return a fresh default save object */
  default() {
    return {
      ver: 3,
      creatureId: null,
      creatureName: null,
      stage: 1,
      xp: 0,
      totalXp: 0,
      stats: { hunger: 100, energy: 100, happy: 100, clean: 100, starEnergy: 0 },
      awakenChoice: null,
      achievements: [],
      completedCreatures: [],
      exploreCount: 0,
      sleepCount: 0,
      cleanCount: 0,
      trainCount: 0,
      items: ITEMS.map(i => ({ id: i.id, qty: i.qty })),
      sessionPerfect: true,
      playTime: 0,
      bondLevel: 0,
    };
  },

  /** Persist to localStorage */
  write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...data, _ts: Date.now() }));
    } catch (e) {
      console.warn('[Save] write failed:', e);
    }
  },

  /** Load from localStorage; returns null if absent or version mismatch */
  read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.ver === 3 ? data : null;
    } catch (e) {
      return null;
    }
  },

  /** Wipe all save data */
  clear() {
    localStorage.removeItem(KEY);
  },
};
