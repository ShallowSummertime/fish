export type Creature = { name: string; kind: 'Creature' | 'Boss / Special' };
export type Boss = { name: string; summon: string; route: string; note: string };
export const creatures: Creature[] = [
  ...'Brown Crab,Piranha,Gar,Shrimp,Mackerel,Rock Crab,Lobster,Cod,Goby,Pike,Salmon,Perch,Triggerfish,Goldfish,Catfish,Clownfish,Sea Urchin,Yellow Boxfish,Needlefish,Angelfish,Bluegill,Seahorse,Bowlfish,Bass,Eel,Red Snapper,Sengarat,Halibut,Tigerfish,Flying Fish,Voxel Fish,Parrotfish,Dripper,Blobfish,Oarfish,Anglerfish,Stonefish,Superdwarf Fish'.split(',').map(name => ({ name, kind: 'Creature' as const })),
  ...'Sunfish,The Old Pike,Blue Shark,Tuna,Goblin Shark,Bowhead Whale,Spider Crab,Giant Piranha,Pufferfish,Albatross,Mutated Bowhead Whale'.split(',').map(name => ({ name, kind: 'Boss / Special' as const }))
];
export const bosses: Boss[] = [
  { name: 'Sunfish', summon: 'Beginner Boss Lure', route: 'Early progression', note: 'A special catch in the beginner boss-lure path.' },
  { name: 'The Old Pike', summon: 'Beginner Boss Lure', route: 'Forest progression', note: 'A tougher early special creature.' },
  { name: 'Blue Shark', summon: 'Standard Boss Lure', route: 'Desert progression', note: 'A mid-route boss encounter.' },
  { name: 'Tuna', summon: 'Professional Boss Lure', route: 'Late progression', note: 'A professional-tier special catch.' },
  { name: 'Goblin Shark', summon: 'Scientific Boss Lure', route: 'Late progression', note: 'A scientific-tier special catch.' },
  { name: 'Bowhead Whale', summon: 'Fish Bucket', route: 'Endgame path', note: 'A special endgame encounter.' },
  { name: 'Spider Crab', summon: 'Empty Beer Can', route: 'Lighthouse', note: 'The first dedicated boss guide on this site.' },
  { name: 'Giant Piranha', summon: 'Modified Leech', route: 'Forest', note: 'A Forest boss encounter.' },
  { name: 'Pufferfish', summon: 'Carrot', route: 'Progression route', note: 'A special bait encounter.' },
  { name: 'Albatross', summon: 'Tuna', route: 'Progression route', note: 'A special bait encounter.' },
  { name: 'Mutated Bowhead Whale', summon: 'Bowhead Whale', route: 'Final boss', note: 'The final special creature.' }
];
export const locations = [
  { name: 'Lighthouse', type: 'Starting location', detail: 'Your first base, tutorial route, and Spider Crab encounter.' },
  { name: 'Forest', type: 'Island', detail: 'A mid-game island with The Old Pike and Giant Piranha progression.' },
  { name: 'Desert', type: 'Island', detail: 'A later island that advances the Blue Shark route.' },
  { name: 'Rocks', type: 'Island', detail: 'A main-route island for gear and story progression.' },
  { name: 'Volcano', type: 'Island', detail: 'The final main-route island and endgame progression.' }
];
export const achievements = ['Getting Started','Drip','Who Stole My Beer','Getting an Upgrade','Dinnertime','Grillmaster','Vacation','I Am Speed','Terrorizing Bird','Fully Equipped','Deadliest Catch','We Are So Back','Easy','360 No Scope','Noob','Impressive','Let Me Go','Yummy in My Tummy','Competitive Eating','GOLD GOLD GOLD','I’m the Bird Now','Everyone’s Dream','Collector','Fishipedia','All In','Rich! Millionaire','Handyman','Bean'];
export const sourceNotes = [
  { label: 'Official Steam announcements (Patch 1.0.9)', url: 'https://steamcommunity.com/app/4001890/announcements/' },
  { label: 'Skoottie — I\'m Playing 100% of How to Fish (YouTube)', url: 'https://www.youtube.com/watch?v=mK5WaARlT9w' },
  { label: 'Steam Community 49-creature field guide', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3789629297' },
  { label: 'Steam Community 28-achievement guide', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3788027308' },
  { label: 'Destructoid walkthrough', url: 'https://www.destructoid.com/complete-how-to-fish-game-walkthrough-100-completion/' },
  { label: 'Destructoid boss guide', url: 'https://www.destructoid.com/all-bosses-in-how-to-fish-and-how-to-defeat-them/' }
];
export const pageMeta: Record<string, {title:string; description:string; image?:string}> = {
  '/': { title: 'How to Fish Walkthrough & Guides Wiki - All Bosses, Fish & Islands | How to Fish Walkthrough', description: 'Complete How to Fish Game wiki and walkthrough: boss guides, all creatures, locations, lures, and a beginner route for the 2026 Dazed Games fishing sim.' },
  '/beginner-guide': { title: 'How to Fish Game Beginner Guide & Lighthouse Route | How to Fish Walkthrough', description: 'A step-by-step How to Fish Game beginner route: finish the Lighthouse tutorial, earn safely, prepare for Spider Crab, keep the shell, and reach Island 2.', image: '/images/guides/beginner-lighthouse-loop.svg' },
  '/creatures': { title: 'All 49 How to Fish Game Creatures Checklist | How to Fish Walkthrough', description: 'Browse, filter, and track all 49 creatures in How to Fish Game, including 11 boss and special creatures.' },
  '/bosses': { title: 'All How to Fish Game Bosses & Special Creatures | How to Fish Walkthrough', description: 'How to Fish Game boss guide: every special creature, summoning item, and progression route.' },
  '/locations': { title: 'How to Fish Game Islands & Locations Guide | How to Fish Walkthrough', description: 'Guide to all five main How to Fish Game locations: Lighthouse plus Forest, Desert, Rocks, and Volcano.' },
  '/lures': { title: 'How to Fish Game Lures & Bait Guide | How to Fish Walkthrough', description: 'How to Fish Game lure and bait guide covering the four progression pools and special boss summons.' },
  '/bosses/spider-crab': { title: 'How to Beat Spider Crab in How to Fish Game | How to Fish Walkthrough', description: 'Beat the How to Fish Game Spider Crab: get the Empty Beer Can, dodge its charge, punish the stun, turn in the shell, and use the boat keys.', image: '/images/guides/spider-crab-combat-loop.svg' },
  '/achievements': { title: 'How to Fish Game Achievements Guide - All 28 | How to Fish Walkthrough', description: 'Complete list of all 28 How to Fish Game achievements, organized into a clean completion checklist.' }
};
