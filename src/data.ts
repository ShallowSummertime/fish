export type Creature = {
  name: string;
  kind: 'Creature' | 'Boss / Special';
  island: 'Lighthouse' | 'Forest' | 'Desert' | 'Rocks' | 'Volcano';
  lure: string;
  value: number;
  tier: 'Early' | 'Beginner' | 'Standard' | 'Professional' | 'Scientific' | 'Boss';
};
export type Boss = { name: string; summon: string; route: string; note: string };
const creatureRows: [Creature['name'], Creature['kind'], Creature['island'], Creature['lure'], Creature['value'], Creature['tier']][] = [
  ['Brown Crab','Creature','Lighthouse','Ham / Free Lure + Crab Rod',3,'Early'],
  ['Piranha','Creature','Forest','Hot Dog / Beginner Lure',4,'Early'],
  ['Gar','Creature','Forest','Free Lure / French Fry',5,'Early'],
  ['Shrimp','Creature','Lighthouse','Ham / Free Lure + Crab Rod',5,'Early'],
  ['Mackerel','Creature','Forest','Free Lure / French Fry',6,'Early'],
  ['Rock Crab','Creature','Lighthouse','Ham / Hot Dog + Crab Rod',7,'Early'],
  ['Lobster','Creature','Lighthouse','Hot Dog + Crab Rod',9,'Early'],
  ['Cod','Creature','Forest','Beginner Lure',10,'Beginner'],
  ['Goby','Creature','Forest','Beginner Lure',12,'Beginner'],
  ['Pike','Creature','Forest','Free / Beginner Lure',12,'Beginner'],
  ['Salmon','Creature','Forest','Beginner Lure',14,'Beginner'],
  ['Perch','Creature','Forest','Beginner Lure',18,'Beginner'],
  ['Triggerfish','Creature','Forest','Beginner Lure',18,'Beginner'],
  ['Goldfish','Creature','Forest','Free / Beginner Lure',24,'Beginner'],
  ['Catfish','Creature','Desert','Standard Lure',46,'Standard'],
  ['Clownfish','Creature','Desert','Standard Lure',46,'Standard'],
  ['Sea Urchin','Creature','Desert','Standard Lure',52,'Standard'],
  ['Yellow Boxfish','Creature','Desert','Standard Lure',53,'Standard'],
  ['Needlefish','Creature','Desert','Standard Lure',60,'Standard'],
  ['Angelfish','Creature','Desert','Standard Lure',62,'Standard'],
  ['Bluegill','Creature','Desert','Standard Lure',62,'Standard'],
  ['Seahorse','Creature','Desert','Standard Lure',100,'Standard'],
  ['Bowlfish','Creature','Desert','Standard Lure',150,'Standard'],
  ['Bass','Creature','Rocks','Professional Lure',250,'Professional'],
  ['Eel','Creature','Rocks','Professional Lure',280,'Professional'],
  ['Red Snapper','Creature','Rocks','Professional Lure',280,'Professional'],
  ['Sengarat','Creature','Rocks','Professional Lure',280,'Professional'],
  ['Halibut','Creature','Rocks','Professional Lure',290,'Professional'],
  ['Tigerfish','Creature','Rocks','Professional Lure',310,'Professional'],
  ['Flying Fish','Creature','Rocks','Professional Lure',320,'Professional'],
  ['Voxelfish','Creature','Rocks','Professional Lure',340,'Professional'],
  ['Parrotfish','Creature','Rocks','Professional Lure',350,'Professional'],
  ['Dripper','Creature','Rocks','Professional Lure',380,'Professional'],
  ['Blobfish','Creature','Volcano','Scientific Lure',1360,'Scientific'],
  ['Oarfish','Creature','Volcano','Scientific Lure',1450,'Scientific'],
  ['Anglerfish','Creature','Volcano','Scientific Lure',1500,'Scientific'],
  ['Stonefish','Creature','Volcano','Scientific Lure',1500,'Scientific'],
  ['Superdwarf Fish','Creature','Volcano','Scientific Lure',1700,'Scientific'],
  ['Sunfish','Boss / Special','Forest','Beginner Boss Lure',50,'Boss'],
  ['The Old Pike','Boss / Special','Forest','Beginner Boss Lure',80,'Boss'],
  ['Blue Shark','Boss / Special','Desert','Standard Boss Lure',300,'Boss'],
  ['Tuna','Boss / Special','Rocks','Professional Boss Lure',2000,'Boss'],
  ['Goblin Shark','Boss / Special','Volcano','Scientific Boss Lure',6200,'Boss'],
  ['Bowhead Whale','Boss / Special','Volcano','Fish Bucket',8000,'Boss'],
  ['Spider Crab','Boss / Special','Lighthouse','Empty Beer Can',10000,'Boss'],
  ['Giant Piranha','Boss / Special','Forest','Modified Leech',11000,'Boss'],
  ['Pufferfish','Boss / Special','Desert','Carrot',12000,'Boss'],
  ['Albatross','Boss / Special','Rocks','Defeated Tuna',13000,'Boss'],
  ['Mutated Bowhead Whale','Boss / Special','Volcano','Bowhead Whale → volcano',15000,'Boss'],
];
export const creatures: Creature[] = creatureRows.map(([name,kind,island,lure,value,tier]) => ({name,kind,island,lure,value,tier}));
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
  { label: 'Official Steam announcements (current Patch 1.0.10)', url: 'https://steamcommunity.com/app/4001890/announcements/' },
  { label: 'Skoottie — I\'m Playing 100% of How to Fish (YouTube)', url: 'https://www.youtube.com/watch?v=mK5WaARlT9w' },
  { label: 'Steam Community 49-creature field guide', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3789629297' },
  { label: 'Steam Community 28-achievement guide', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3788027308' },
  { label: 'Destructoid walkthrough', url: 'https://www.destructoid.com/complete-how-to-fish-game-walkthrough-100-completion/' },
  { label: 'Destructoid boss guide', url: 'https://www.destructoid.com/all-bosses-in-how-to-fish-and-how-to-defeat-them/' }
];
export const pageMeta: Record<string, {title:string; description:string; image?:string}> = {
  '/': { title: 'How to Fish Walkthrough & Guides Wiki - All Bosses, Fish & Islands | How to Fish Walkthrough', description: 'Complete How to Fish Game wiki and walkthrough: boss guides, all creatures, locations, lures, and a beginner route for the 2026 Dazed Games fishing sim.' },
  '/beginner-guide': { title: 'How to Fish Game Beginner Guide - Full Five-Island Route | How to Fish Walkthrough', description: 'A step-by-step How to Fish Game beginner walkthrough covering the Lighthouse opening, Spider Crab, upgrades, survival tips, and the five-island route to Volcano.', image: '/images/guides/beginner/localized/01-beginner-cover-en.png' },
  '/creatures': { title: 'All 49 How to Fish Game Creatures, Lures & Values | How to Fish Walkthrough', description: 'Illustrated How to Fish Game creature encyclopedia with all 49 creatures, locations, lures, reported base values, bosses, and a saved checklist.', image: '/images/creatures/encyclopedia-overview.webp' },
  '/bosses': { title: 'How to Fish Boss Guide & Progression | HTF Wiki', description: 'How to Fish Game boss guide: every special creature, summoning item, and progression route.', image: '/images/guides/island-1/08-spider-crab.jpg' },
  '/locations': { title: 'How to Fish Five-Island Route Guide | HTF Wiki', description: 'Deep five-stop How to Fish Game route: every Lighthouse, Forest, Desert, Rocks and Volcano objective, boss, hand-in, marker and failure recovery.', image: '/images/guides/locations/five-location-route-hero.png' },
  '/locations/lighthouse': { title: 'How to Fish Lighthouse Island Guide - First Island Walkthrough | How to Fish Walkthrough', description: 'Complete How to Fish Game Lighthouse walkthrough: survival HUD, Clam cash route, first rod, catch controls, upgrades, Empty Beer Can, Spider Crab, Boat Keys, and Radar.', image: '/images/guides/island-1/08-spider-crab.jpg' },
  '/locations/rocks': { title: 'How to Fish Rocks Island Guide | HTF Wiki', description: 'Complete Rocks Island 4 walkthrough for How to Fish Game: Professional catches, Tuna, Albatross cover strategy, Head hand-in, and Volcano coordinates.', image: '/images/creatures/encyclopedia-professional.webp' },
  '/locations/volcano': { title: 'How to Fish Volcano Island Guide | HTF Wiki', description: 'Complete Volcano Island 5 walkthrough for How to Fish Game: Scientific catches, Scientist quest, Bowhead Whale, crater carry, Mutated Bowhead fight, and Whale Fin ending.', image: '/images/guides/volcano/01-volcano-arrival.png' },
  '/guides/reel-of-fortune': { title: 'How to Fish Reel of Fortune Guide | HTF Wiki', description: 'Use one rare Drip creature at the Reel of Fortune, identify the random cosmetic skin, equip it with Z or C, and understand GOLD GOLD GOLD.', image: '/images/guides/reel-of-fortune/reel-machine-hero.png' },
  '/lures': { title: 'How to Fish Game Lures & Bait Guide | How to Fish Walkthrough', description: 'How to Fish Game lure and bait guide covering the four progression pools and special boss summons.' },
  '/bosses/spider-crab': { title: 'How to Beat Spider Crab | HTF Wiki', description: 'Beat the How to Fish Game Spider Crab: get the Empty Beer Can, dodge its charge, punish the stun, turn in the shell, and use the boat keys.', image: '/images/guides/island-1/08-spider-crab.jpg' },
  '/achievements': { title: 'How to Fish Game Achievements Guide - All 28 | How to Fish Walkthrough', description: 'Complete list of all 28 How to Fish Game achievements, organized into a clean completion checklist.' },
  '/about': { title: 'About How to Fish Walkthrough - Independent Game Guide', description: 'Learn how How to Fish Walkthrough researches, verifies, illustrates, and updates its independent player-made game guides.' },
  '/contact': { title: 'Contact How to Fish Walkthrough', description: 'Report a correction, broken page, or rights concern to the independent How to Fish Walkthrough editorial team.' },
  '/privacy': { title: 'Privacy Policy | How to Fish Walkthrough', description: 'Read the How to Fish Walkthrough privacy policy, including local checklist storage, cookies, advertising, and user choices.' },
  '/terms': { title: 'Terms & Disclaimer | How to Fish Walkthrough', description: 'Terms, game-trademark disclaimer, source policy, and limitations for the independent How to Fish Walkthrough guide site.' }
};
