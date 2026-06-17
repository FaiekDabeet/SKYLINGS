// ============================================================
// CREATURE DATA
// ============================================================

export const CREATURES = {
  peblo: {
    id: 'peblo',
    name: 'Peblo',
    core: 'Terra Core',
    colorHex: '#a0856a',
    color: 0xa0856a,
    accent: 0x4caf50,
    personality: ['Calm', 'Protective', 'Reliable'],
    theme: 'Earth · Stone · Strength',
    stageEmoji: ['🥚', '🪨', '🏔️', '🌋', '🗿'],
    nameSugs: ['Rocky', 'Boulder', 'Pebble', 'Granite', 'Cliff'],
    awakenPowers: [
      { id: 'earthwall',   name: 'Earth Wall',     desc: 'Summon ancient stone barriers. All stats decay 20% slower.' },
      { id: 'quake',       name: 'Tremor Strike',  desc: 'Channel seismic energy. Training gives 50% more Star Energy.' },
      { id: 'crystalgrow', name: 'Crystal Growth', desc: 'Grow gemstone armor. Hunger & Cleanliness hold much longer.' },
    ],
    endingTitle: 'The World Builder',
    endingText:
      'Peblo raises its mighty paws toward the sky. The earth answers — vast slabs of ancient stone rise from the ground, assembling into a magnificent floating island wreathed in waterfalls. Flowers of impossible colors bloom across its cliffs. Peblo becomes its eternal guardian, watching over this new world with quiet, powerful love.',
    stageNames: ['Pebbling', 'Stone Pup', 'Rocky', 'Boulder', 'Gaia Titan'],
    dialogue: {
      1: ['Hello...', 'You found me.', '...warm here.', 'Safe?', 'I am... small.'],
      2: ['I like being here.', 'This ground feels familiar.', 'My core is stronger now.', 'Thank you for the food.', 'I can feel the earth.'],
      3: ['I think I remember something...', 'There was a great stone... in the sky.', 'I can feel mountains inside me.', 'Was I a guardian once?', 'The earth speaks to me.'],
      4: ['My home is beyond the stars.', 'But the Earth calls to me too.', 'I could protect this world...', 'I feel the weight of mountains.', 'A guardian never leaves.'],
      5: ['Thank you for helping me.', 'I know my purpose now.', 'This world needs a guardian.', 'And I am that guardian.', 'No star rises alone.'],
    },
  },

  fluffi: {
    id: 'fluffi',
    name: 'Fluffi',
    core: 'Wind Core',
    colorHex: '#ffd6ec',
    color: 0xffd6ec,
    accent: 0x87ceeb,
    personality: ['Playful', 'Joyful', 'Curious'],
    theme: 'Wind · Freedom · Flight',
    stageEmoji: ['🥚', '🐣', '🐥', '🦤', '🦅'],
    nameSugs: ['Puff', 'Breeze', 'Windy', 'Cotton', 'Sky'],
    awakenPowers: [
      { id: 'windgust',  name: 'Wind Gust',    desc: 'Unleash playful gusts. Happiness barely decays anymore.' },
      { id: 'stardance', name: 'Star Dance',   desc: 'Dance among falling stars. Minigame rewards are doubled.' },
      { id: 'cloudride', name: 'Cloud Rider',  desc: 'Soar on celestial clouds. Energy restores 2× faster during sleep.' },
    ],
    endingTitle: 'The Sky Dancer',
    endingText:
      "With a joyful shriek, Fluffi spreads wings that shimmer like auroras and leaps into the heavens. A long ribbon of golden stardust trails behind as it spirals into the cosmos, laughing all the way. Children across the world will see a new constellation — Fluffi's dance frozen in starlight, forever winking at those who dare to dream.",
    stageNames: ['Flufflet', 'Puffball', 'Breezy', 'Galewind', 'Celestia'],
    dialogue: {
      1: ['Wheee!', 'Hello! Hello!', 'Spin spin spin!', 'You smell nice.', 'BOING!'],
      2: ['I like it here!', 'Can we play? Can we?!', 'The wind feels so familiar!', 'I love everything!', 'Yay yay yay!'],
      3: ['I think I remember... flying!', 'The stars! I can almost touch them!', 'There was music in the wind...', 'I danced once, with a million stars!', 'I want to fly again!'],
      4: ['My home is beyond the stars!', 'I want to dance across the sky again!', 'But leaving means goodbye...', 'Maybe I can visit? Maybe?', 'You make me happy.'],
      5: ["Thank you for helping me!", "I'll dance for you every night!", 'Look for me in the stars!', 'WHEEEEE!', "I'll miss you the most."],
    },
  },

  voltik: {
    id: 'voltik',
    name: 'Voltik',
    core: 'Storm Core',
    colorHex: '#ffe135',
    color: 0xffe135,
    accent: 0x4169e1,
    personality: ['Curious', 'Inventive', 'Adventurous'],
    theme: 'Lightning · Discovery · Exploration',
    stageEmoji: ['🥚', '⚡', '🌩️', '🌪️', '☄️'],
    nameSugs: ['Sparky', 'Zappy', 'Tesla', 'Bolt', 'Storm'],
    awakenPowers: [
      { id: 'thunderburst',   name: 'Thunder Burst',   desc: 'Release stored lightning. Training gives double Star Energy.' },
      { id: 'chainlightning', name: 'Chain Lightning', desc: 'Chain discoveries together. Exploration always finds rare items.' },
      { id: 'cosmicradar',    name: 'Cosmic Radar',    desc: 'Scan the cosmos. Unlocks hidden dialogue a stage early.' },
    ],
    endingTitle: 'The Explorer',
    endingText:
      'Voltik crackles with cosmic energy and builds a vessel from pure lightning and starlight. With a thunderous roar that shakes the mountains, it launches into space, instruments humming with excitement. Unmapped galaxies await! Every lightning storm on Earth carries a signal — Voltik saying hello from somewhere impossibly far and impossibly wonderful.',
    stageNames: ['Zapplet', 'Sparky', 'Stormling', 'Thunderclaw', 'Nova Wanderer'],
    dialogue: {
      1: ['Bzzt! Hello!', "What's that? And that?", 'So many things!', 'Zap!', 'How does this work?'],
      2: ['I like it here!', 'I want to know EVERYTHING!', 'How does THIS work?', 'Why is the sky blue?', 'I made a discovery!'],
      3: ['I think I remember... something vast!', 'There are galaxies I need to map!', 'My instruments are coming back online!', 'The universe is calling!', 'So many questions!'],
      4: ['My home is beyond the stars!', 'So many systems to explore!', "I've been mapping your world too.", "It's full of wonders!", 'Science is everywhere!'],
      5: ["Thank you for helping me!", "I'll send you coordinates!", 'Every star I name... one is yours.', 'Bzzzt! Adventure awaits!', "I'll never stop discovering."],
    },
  },

  moko: {
    id: 'moko',
    name: 'Moko',
    core: 'Life Core',
    colorHex: '#98fb98',
    color: 0x98fb98,
    accent: 0xff69b4,
    personality: ['Kind', 'Empathetic', 'Gentle'],
    theme: 'Nature · Growth · Healing',
    stageEmoji: ['🥚', '🌱', '🌿', '🌸', '🌳'],
    nameSugs: ['Blossom', 'Fern', 'Petal', 'Sprout', 'Leaf'],
    awakenPowers: [
      { id: 'bloomheal',    name: 'Bloom Heal',    desc: 'Heal with celestial flowers. All stats recover 10% faster passively.' },
      { id: 'lifeaura',    name: 'Life Aura',     desc: 'Radiate healing energy. Stat decay reduced by 30% across the board.' },
      { id: 'spiritgarden', name: 'Spirit Garden', desc: 'Grow a cosmic garden. Care actions give bonus Star Energy.' },
    ],
    endingTitle: 'The Seed Of Life',
    endingText:
      "Moko closes its eyes and breathes deeply. From its tiny paws, golden seeds drift across the Earth like gentle wishes. Impossible gardens bloom — flowers that glow at night, trees that hum with old songs. Moko dissolves into a tender breeze, becoming the spirit of growth itself. Every bloom is a whisper. Every new leaf, a letter. Every quiet spring morning — Moko saying: I'm still here.",
    stageNames: ['Seedling', 'Sproutling', 'Bloom Pup', 'Grove Keeper', 'Forest Spirit'],
    dialogue: {
      1: ['Hello...', '*nuzzles gently*', 'I feel safe here.', 'Thank you...', '...flowers?'],
      2: ['I like being here.', 'Are you okay? You seem tired.', 'I made you a flower. In my mind.', 'Being kind feels right.', 'I sense your heart.'],
      3: ['I think I remember... green and vast.', 'A garden between the stars.', 'Life needs tending... I know this.', 'I can feel every living thing near me.', 'The earth is alive.'],
      4: ['My home is beyond the stars.', 'But Earth is full of life that needs love.', 'I feel what the flowers feel.', 'I think I belong here too.', 'Everything deserves care.'],
      5: ['Thank you for helping me become who I am.', "I'll be in every leaf and petal.", "When a flower blooms, that's me saying hello.", 'Take care of yourself. And each other.', 'Love is the oldest star.'],
    },
  },

  drako: {
    id: 'drako',
    name: 'Drako',
    core: 'Nova Core',
    colorHex: '#ff4500',
    color: 0xff4500,
    accent: 0xffd700,
    personality: ['Brave', 'Determined', 'Noble'],
    theme: 'Fire · Stars · Leadership',
    stageEmoji: ['🥚', '🔥', '🐲', '🐉', '🌟'],
    nameSugs: ['Ember', 'Blaze', 'Nova', 'Flame', 'Ash'],
    awakenPowers: [
      { id: 'solarflame',   name: 'Solar Flame',   desc: 'Channel star fire. Training rewards tripled once per minute.' },
      { id: 'meteorbreath', name: 'Meteor Breath', desc: 'Breathe cosmic fire. Exploration always succeeds and finds rare items.' },
      { id: 'starroar',     name: 'Star Roar',     desc: 'Roar across the galaxy. Bond XP gains doubled in all actions.' },
    ],
    endingTitle: 'The Star Guardian',
    endingText:
      'Drako spreads wings of living starfire and rises into the heavens with a noble roar that shakes every mountain on Earth. On its distant home world, a thousand creatures look up as a new star blazes in their sky — brighter than all others. Ancient prophecies are fulfilled. The legendary Star Guardian has returned. An age of peace begins across the galaxy.',
    stageNames: ['Emberclaw', 'Flamewing', 'Firebrand', 'Nova Drake', 'Star Guardian'],
    dialogue: {
      1: ['...', '*stares intensely*', 'Guardian.', 'I will grow strong.', '...strong.'],
      2: ['I like being here.', 'I train because I must.', 'Strength has purpose.', 'Thank you for believing in me.', 'I am growing.'],
      3: ['I think I remember... a battle.', 'Stars were falling... I was fighting.', 'There is darkness out there.', 'And I was meant to face it.', 'I will not falter.'],
      4: ['My home is beyond the stars.', 'A world that needs protection.', 'I feel the weight of destiny.', 'And I am not afraid.', 'A guardian fears nothing.'],
      5: ['Thank you for helping me become who I am.', 'I go now to face my destiny.', 'I carry your friendship as my shield.', 'No star burns alone.', 'I will not forget you.'],
    },
  },
};

export const STAGES = [
  { level: 1, name: 'Hatchling',     xpReq: 0   },
  { level: 2, name: 'Youngling',     xpReq: 120  },
  { level: 3, name: 'Explorer',      xpReq: 280  },
  { level: 4, name: 'Guardian',      xpReq: 500  },
  { level: 5, name: 'Celestial',     xpReq: 750  },
];

export const CINEMATIC_SCENES = [
  { emoji: '🌌', title: 'Thousands of Years Ago…',  body: 'A great cosmic storm tore across the galaxy, scattering the eggs of mysterious celestial creatures to the far corners of space.' },
  { emoji: '☄️', title: 'Fallen From The Stars',    body: 'A handful of these eggs crashed to Earth inside meteorites, buried deep underground where they slumbered for millennia, dreaming of home.' },
  { emoji: '🔬', title: 'A Discovery',               body: 'Recently, researchers uncovered a hidden underground chamber. Inside, five dormant creatures waited inside glowing crystal cocoons.' },
  { emoji: '✨', title: 'You Are Their Guardian',    body: 'These creatures have lost their memories and almost all their power. But they each hold a destiny. And now — so do you.' },
];
