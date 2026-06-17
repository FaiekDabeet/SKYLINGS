# ✦ SKYLINGS: Fallen From The Stars

A cozy creature-raising browser game inspired by Tamagotchi, Chao Garden, and Pokémon.
Raise mysterious star creatures from Stage 1 → Stage 5, unlock their destiny, and become Guardian of the Stars.

---

## 🚀 Quick Start (3 steps)

### Step 1 — Install Node.js
Download and install from **https://nodejs.org** (choose the LTS version).
This also installs `npm` automatically.

### Step 2 — Install dependencies
Open a terminal / command prompt inside the `skylings` folder and run:

```bash
npm install
```

### Step 3 — Start the game
```bash
npm run dev
```

Then open your browser at **http://localhost:3000** — the game will load automatically.

---

## 📁 Project Structure

```
skylings/
├── index.html               # Main HTML entry point
├── package.json             # Project config & scripts
├── vite.config.js           # Vite bundler config
├── public/
│   └── manifest.json        # PWA manifest (installable on mobile)
└── src/
    ├── main.js              # Entry point – boots all systems
    ├── game.js              # Master game controller & state machine
    ├── style.css            # Complete stylesheet
    ├── data/
    │   ├── creatures.js     # All 5 creatures, dialogue, evolutions
    │   ├── achievements.js  # Achievement definitions
    │   └── items.js         # Item definitions & effects
    ├── systems/
    │   ├── save.js          # LocalStorage persistence
    │   ├── audio.js         # Web Audio sound system
    │   ├── notify.js        # Toast notifications + particle FX
    │   ├── starbg.js        # Animated star canvas background
    │   └── minigame.js      # All 3 minigames (Catch/Memory/Dash)
    ├── three/
    │   └── scene3d.js       # Three.js scene + all creature 3D models
    └── ui/
        └── ui.js            # Modal, HUD, Achievements, Items, Tabs
```

---

## 🎮 How To Play

1. **Begin Your Journey** — tap the start button on the intro screen
2. **Watch the cinematic** — learn the backstory (or skip it)
3. **Choose a creature** — each has a unique personality and destiny
4. **Name your creature** — pick a name or use a suggestion
5. **Raise it** — feed, play, clean, train, sleep, and explore
6. **Watch it evolve** — Stage 1 → 5 through XP and care
7. **Star Awakening** — at Stage 3, choose a cosmic power
8. **Reach Stage 5** — trigger the unique creature ending
9. **Complete all 5** — unlock the Master Guardian secret ending

### Creatures
| Name   | Core       | Theme                    | Ending             |
|--------|------------|--------------------------|--------------------|
| Peblo  | Terra Core | Earth · Stone · Strength | The World Builder  |
| Fluffi | Wind Core  | Wind · Freedom · Flight  | The Sky Dancer     |
| Voltik | Storm Core | Lightning · Discovery    | The Explorer       |
| Moko   | Life Core  | Nature · Growth · Healing| The Seed Of Life   |
| Drako  | Nova Core  | Fire · Stars · Leadership| The Star Guardian  |

### Actions
- 🍎 **Feed** — restores hunger
- 💤 **Sleep** — restores energy over time
- 🎮 **Play** — boosts happiness (costs energy)
- 🛁 **Clean** — restores cleanliness
- ⚡ **Train** — large Star Energy boost (costs energy)
- 🌌 **Explore** — Star Energy + chance to find items

### Minigames
- ⭐ **Catch The Stars** — move a basket to catch falling stars (30 seconds)
- 🔮 **Memory Match** — flip cards to match cosmic symbol pairs
- ☄️ **Meteor Dash** — dodge meteors and collect stars (survive as long as possible)

### Items
Found through Explore or earned in minigames:
- ✨ Stardust, 🍇 Cosmic Fruit, 🍵 Moon Tea, 💎 Joy Crystal
- 🫧 Sparkle Bath, 🎂 Nebula Cake, 🌑 Void Shard

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. You can deploy this anywhere static files are served.

### Deploy to Vercel (free)
1. Create an account at **https://vercel.com**
2. Install Vercel CLI: `npm install -g vercel`
3. Run inside the project folder: `vercel`
4. Follow the prompts — your game will be live at a `*.vercel.app` URL

### Deploy to Netlify (free)
1. Run `npm run build`
2. Drag the `dist/` folder to **https://app.netlify.com/drop**

---

## 📱 PWA / Mobile Install

The game works as a Progressive Web App on mobile.
On iOS: tap **Share → Add to Home Screen**
On Android: tap **⋮ → Add to Home Screen**

---

## 🧩 Expanding the Game

The codebase is fully modular. Common extension points:

| Want to add…        | Edit this file              |
|---------------------|-----------------------------|
| A new creature      | `src/data/creatures.js`     |
| New items           | `src/data/items.js`         |
| New achievements    | `src/data/achievements.js`  |
| New action type     | `src/game.js` → `doAction()`|
| New minigame        | `src/systems/minigame.js`   |
| New creature model  | `src/three/scene3d.js`      |
| UI changes          | `src/style.css` + `src/ui/ui.js` |
| Save data changes   | `src/systems/save.js`       |

---

## 🛠️ Tech Stack

- **Three.js** — 3D creature rendering
- **Vite** — lightning-fast dev server & bundler
- **Vanilla JS (ES Modules)** — no framework needed
- **Web Audio API** — procedural sound effects
- **LocalStorage** — automatic save/load
- **CSS Custom Properties** — full theming system
- **Canvas 2D API** — star background + minigames

---

## 📄 License

MIT — free to use, modify, and ship commercially.
