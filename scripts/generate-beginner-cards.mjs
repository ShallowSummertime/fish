import { mkdir, writeFile } from 'node:fs/promises'

const out = new URL('../public/images/guides/beginner/localized/', import.meta.url)
await mkdir(out, { recursive: true })

const cards = [
  {
    file: '02-survival-loop-en.svg', part: '01', title: 'YOUR FIRST SURVIVAL LOOP', kicker: 'LIGHTHOUSE START',
    lead: 'Stabilize hunger, health, and cash before chasing rare catches.',
    items: [
      ['1', 'SURVIVE', 'Watch hunger and health. Eat clams or catches before hunger reaches zero.'],
      ['2', 'FIRST CASH', 'Pick up clams near the Lighthouse. Hold Q to throw them to the merchant and get paid.'],
      ['3', 'FIRST TOOL', 'Save $6. Press E at the shop and buy the Crab Fishing Rod.'],
      ['4', 'CATCH LOOP', 'Right-click cast • hold left-click reel • right-click drop • press X • attack before it escapes.'],
      ['5', 'CHECK PROGRESS', 'Hold F to inspect weight and price. Press Tab to open the creature collection.'],
    ], footer: 'NEXT: BAIT, LURES & HOTSPOTS', accent: '#65d6ad'
  },
  {
    file: '03-bait-hotspots-en.svg', part: '02', title: 'BAIT CONTROLS THE CATCH', kicker: 'LURES & HOTSPOTS',
    lead: 'Choose the lure for the target, then keep it moving after the cast.',
    items: [
      ['1', 'HOT DOG — $1', 'Auto-attaches to the rod and can attract colorful variants.'],
      ['2', 'EMPTY BEER CAN', 'Drink a beer to obtain the can. Use it for the Long-Legged Spider Crab encounter.'],
      ['3', 'LEECH — FOREST', 'Give it to the woman by the cabin to prepare the Giant Piranha lure. Eating one heals a little, then poisons you.'],
      ['4', 'CARROT', 'Unlocked through the endangered seahorse task; used for Tropical Pufferfish.'],
      ['5', 'WORK THE LURE', 'Reel or walk backward so the lure moves. Fast, dense surface ripples can signal a better target.'],
    ], footer: 'NEXT: TRICK SHOTS & GRILL VALUE', accent: '#45c8f0'
  },
  {
    file: '04-profit-multipliers-en.svg', part: '03', title: 'RAISE VALUE BEFORE YOU SELL', kicker: 'TRICK SHOTS × GRILL',
    lead: 'Add a stunt multiplier, then stop cooking at the value peak.',
    items: [
      ['1', 'THROW', 'After subduing a creature, press Q to toss it high.'],
      ['2', 'SPIN & SHOOT', 'Turn before the hit and shoot it in mid-air to build the trick-shot multiplier.'],
      ['3', 'MULTIPLIER', 'The displayed bonus can climb from 1.2× toward 5× with cleaner stunts.'],
      ['4', 'GRILL', 'Cooking unlocks after the early crocodile task on the tropical island. Hold the shown cook key and watch the meter.'],
      ['5', 'STOP AT THE PEAK', 'Best grill value is around 1.5×. Burnt catches can fall to $0.'],
    ], footer: 'SELL ONLY AFTER THE VALUE BOOST', accent: '#ffb449'
  },
  {
    file: '05-weapon-ladder-en.svg', part: '04', title: 'FROM FISTS TO FIREPOWER', kicker: 'EARLY WEAPON LADDER',
    lead: 'Buy damage upgrades when the current tool makes every catch take too long.',
    items: [
      ['1', 'BARE FISTS — 3 DMG', 'Free and always available, but inefficient against large creatures and bosses.'],
      ['2', 'BRASS KNUCKLES — $24', 'A small early upgrade with limited range and stagger.'],
      ['3', 'SURVIVAL KNIFE — $45', '16 base damage. Anvil tiers raise it to 18, 20, then 22 damage.'],
      ['4', 'PISTOL — $50', '30 base damage and a useful first ranged option. Ammo upgrades cost $25 per tier.'],
      ['5', 'SHOTGUN / SMG', 'Shotgun controls clustered small enemies. The $650 SMG has a 40-round magazine but needs recoil control.'],
    ], footer: 'NEXT: ENDGAME GUNS & DEATH RISK', accent: '#ff7d67'
  },
  {
    file: '06-firepower-death-en.svg', part: '05', title: 'FIREPOWER & DEATH RISK', kicker: 'PROTECT YOUR LOADOUT',
    lead: 'Late-game damage is expensive; recovery planning matters just as much.',
    items: [
      ['1', 'SNIPER — $3,800', 'High burst damage and strong precision; pairs well with mid-air trick shots.'],
      ['2', 'ASSAULT RIFLE', 'A Volcano-stage main weapon whose upgrades can reach 100 damage per shot.'],
      ['3', 'ATTACHMENTS', 'Extended mag $100 • compensator $600 • laser/red dot $100 • suppressor $100.'],
      ['4', 'DYNAMITE — $25', 'Large area damage. A bad cook or throw can down you or a teammate.'],
      ['5', 'DEATH DROPS', 'Equipped gear and most carried items drop where you fall. White markers help recovery; deep water and grass make it harder.'],
    ], footer: 'BANK VALUE BEFORE A HIGH-RISK RUN', accent: '#a88bff'
  },
  {
    file: '07-island-route-en.svg', part: '06', title: 'THE FIVE-ISLAND ROUTE', kicker: 'KEYS, COORDINATES & BOAT',
    lead: 'Hand each boss objective to the key NPC to reveal the next destination.',
    items: [
      ['1', 'LIGHTHOUSE — ISLAND 1', 'Summon Spider Crab with the Empty Beer Can. Return its Shell to the keeper for Boat Keys; Forest appears as a green Radar marker.'],
      ['2', 'FOREST — ISLAND 2', 'Follow the current Leech objective and verify its bait. Defeat Giant Piranha and return its Skeleton; Desert appears as a yellow marker.'],
      ['3', 'DESERT — ISLAND 3', 'Complete the Tourist request for a Carrot. Defeat Pufferfish and return its Fin; Rocks appears as a red marker.'],
      ['4', 'ROCKS — ISLAND 4', 'Catch Tuna with a Professional Boss Lure and place it on land. Defeat Albatross and return its Head for the final coordinates.'],
      ['5', 'VOLCANO — ISLAND 5', 'Five native catches → Fish Bucket → Bowhead body/crater → Mutated Bowhead → Whale Fin → scientist → military boat key.'],
    ], footer: 'KEEP THE COORDINATE DRIVE AFTER HAND-IN', accent: '#50d6e8'
  },
  {
    file: '08-coop-hazards-en.svg', part: '07', title: 'CO-OP REVIVES & HAZARDS', kicker: 'KEEP THE TEAM MOVING',
    lead: 'A teammate can save the run—if someone stays close enough to revive.',
    items: [
      ['1', 'DOWNED STATE', 'After drowning or losing all health, the player becomes motionless.'],
      ['2', 'DIRECT REVIVE', 'A teammate can interact with or punch the downed body to revive it.'],
      ['3', 'REVIVE FISH', 'Carry one in a backpack for an emergency instant revive.'],
      ['4', 'PACK SPACE', 'Buy slots in stages: $5, $10, then $100. Store high-value items before risky travel.'],
      ['5', 'ENVIRONMENT CLOCK', 'Day is predictable. Night adds hostile shore creatures. Waterspouts, sea urchins, and lava can rapidly end a run.'],
    ], footer: 'DO NOT LEAVE VALUABLE CATCHES ON THE SHORE', accent: '#78df7a'
  },
  {
    file: '09-boss-clear-en.svg', part: '08', title: 'FIVE-ISLAND BOSS CLEAR', kicker: 'GET THE COORDINATES. LEAVE THE ARCHIPELAGO.',
    lead: 'Treat every boss as a hand-off: summon, control, defeat, then secure the quest item.',
    items: [
      ['1', 'LIGHTHOUSE — SPIDER CRAB', 'Summon with the Empty Beer Can. Sidestep its charge, attack during the stun, then return its Shell for the Boat Keys.'],
      ['2', 'FOREST — GIANT PIRANHA', 'Use the Modified Leech. Clear its smaller attackers, defeat the boss, and return its Skeleton for Desert coordinates.'],
      ['3', 'DESERT — PUFFERFISH', 'Use the Carrot. Keep distance from its rolling attack, then return its Fin for Rocks coordinates.'],
      ['4', 'ROCKS — ALBATROSS', 'Catch Tuna with the Professional Boss Lure and leave it on land. Use cover, defeat Albatross, and return its Head.'],
      ['5', 'VOLCANO — WHALE FINALE', 'Five native catches → Fish Bucket → Bowhead body/crater → Mutated Bowhead → Whale Fin → scientist → military boat key.'],
    ], footer: '100% COMPLETE — ESCAPE THE ISLANDS', accent: '#ff5d4d'
  },
]

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const wrap = (text, max = 68) => {
  const words = text.split(' '); const lines = []; let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max) { lines.push(line); line = word } else line = (line + ' ' + word).trim()
  }
  if (line) lines.push(line)
  return lines
}

for (const card of cards) {
  const rows = card.items.map(([n, head, body], i) => {
    const y = 360 + i * 190
    const lines = wrap(body)
    return `<g transform="translate(70 ${y})"><rect width="1060" height="160" rx="28" fill="#102b3a" stroke="#315064" stroke-width="2"/><circle cx="70" cy="80" r="42" fill="${card.accent}"/><text x="70" y="92" text-anchor="middle" class="num">${n}</text><text x="140" y="58" class="head">${esc(head)}</text>${lines.map((line, j) => `<text x="140" y="${96 + j * 34}" class="body">${esc(line)}</text>`).join('')}</g>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" role="img" aria-labelledby="title desc"><title id="title">${esc(card.title)}</title><desc id="desc">Original English How to Fish beginner guide infographic.</desc><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#062231"/><stop offset="1" stop-color="#07141e"/></linearGradient><style>.k{font:700 24px Arial,sans-serif;letter-spacing:4px;fill:${card.accent}}.part{font:900 28px Arial,sans-serif;fill:#09212e}.title{font:900 58px Arial,sans-serif;fill:#f7f4e8}.lead{font:400 27px Arial,sans-serif;fill:#bcd0d8}.num{font:900 38px Arial,sans-serif;fill:#09212e}.head{font:800 29px Arial,sans-serif;fill:#fff}.body{font:400 24px Arial,sans-serif;fill:#c9d6dc}.foot{font:800 26px Arial,sans-serif;fill:#09212e;letter-spacing:1px}</style></defs><rect width="1200" height="1500" fill="url(#bg)"/><circle cx="1100" cy="80" r="240" fill="${card.accent}" opacity=".08"/><circle cx="70" cy="1410" r="260" fill="${card.accent}" opacity=".06"/><text x="70" y="76" class="k">HOW TO FISH GAME GUIDE</text><rect x="70" y="120" width="170" height="55" rx="14" fill="${card.accent}"/><text x="155" y="158" text-anchor="middle" class="part">PART ${card.part}</text><text x="70" y="248" class="title">${esc(card.title)}</text><text x="70" y="300" class="lead">${esc(card.lead)}</text>${rows}<rect x="70" y="1345" width="1060" height="86" rx="25" fill="${card.accent}"/><text x="600" y="1399" text-anchor="middle" class="foot">${esc(card.footer)}</text></svg>`
  await writeFile(new URL(card.file, out), svg)
}

console.log(`Generated ${cards.length} original English guide cards.`)
