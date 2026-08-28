export type Creature = {
  name: string;
  kind: "Creature" | "Boss / Special";
  island: "Lighthouse" | "Forest" | "Desert" | "Rocks" | "Volcano";
  lure: string;
  value: number;
  tier:
    "Early" | "Beginner" | "Standard" | "Professional" | "Scientific" | "Boss";
};
export type Boss = {
  name: string;
  summon: string;
  route: string;
  note: string;
  fight: string;
  reward: string;
  recovery: string;
};
export type Achievement = {
  name: string;
  official: string;
  category:
    "Story" | "Combat" | "Collection" | "Equipment" | "Economy" | "Stunt";
  route: string;
  caution?: string;
  icon: string;
  globalRate: number;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
};
const creatureRows: [
  Creature["name"],
  Creature["kind"],
  Creature["island"],
  Creature["lure"],
  Creature["value"],
  Creature["tier"],
][] = [
  [
    "Brown Crab",
    "Creature",
    "Lighthouse",
    "Ham / Free Lure + Crab Rod",
    3,
    "Early",
  ],
  ["Piranha", "Creature", "Forest", "Hot Dog / Beginner Lure", 4, "Early"],
  ["Gar", "Creature", "Forest", "Free Lure / French Fry", 5, "Early"],
  [
    "Shrimp",
    "Creature",
    "Lighthouse",
    "Ham / Free Lure + Crab Rod",
    5,
    "Early",
  ],
  ["Mackerel", "Creature", "Forest", "Free Lure / French Fry", 6, "Early"],
  [
    "Rock Crab",
    "Creature",
    "Lighthouse",
    "Ham / Hot Dog + Crab Rod",
    7,
    "Early",
  ],
  ["Lobster", "Creature", "Lighthouse", "Hot Dog + Crab Rod", 9, "Early"],
  ["Cod", "Creature", "Forest", "Beginner Lure", 10, "Beginner"],
  ["Goby", "Creature", "Forest", "Beginner Lure", 12, "Beginner"],
  ["Pike", "Creature", "Forest", "Free / Beginner Lure", 12, "Beginner"],
  ["Salmon", "Creature", "Forest", "Beginner Lure", 14, "Beginner"],
  ["Perch", "Creature", "Forest", "Beginner Lure", 18, "Beginner"],
  ["Triggerfish", "Creature", "Forest", "Beginner Lure", 18, "Beginner"],
  ["Goldfish", "Creature", "Forest", "Free / Beginner Lure", 24, "Beginner"],
  ["Catfish", "Creature", "Desert", "Standard Lure", 46, "Standard"],
  ["Clownfish", "Creature", "Desert", "Standard Lure", 46, "Standard"],
  ["Sea Urchin", "Creature", "Desert", "Standard Lure", 52, "Standard"],
  ["Yellow Boxfish", "Creature", "Desert", "Standard Lure", 53, "Standard"],
  ["Needlefish", "Creature", "Desert", "Standard Lure", 60, "Standard"],
  ["Angelfish", "Creature", "Desert", "Standard Lure", 62, "Standard"],
  ["Bluegill", "Creature", "Desert", "Standard Lure", 62, "Standard"],
  ["Seahorse", "Creature", "Desert", "Standard Lure", 100, "Standard"],
  ["Bowlfish", "Creature", "Desert", "Standard Lure", 150, "Standard"],
  ["Bass", "Creature", "Rocks", "Professional Lure", 250, "Professional"],
  ["Eel", "Creature", "Rocks", "Professional Lure", 280, "Professional"],
  [
    "Red Snapper",
    "Creature",
    "Rocks",
    "Professional Lure",
    280,
    "Professional",
  ],
  ["Sengarat", "Creature", "Rocks", "Professional Lure", 280, "Professional"],
  ["Halibut", "Creature", "Rocks", "Professional Lure", 290, "Professional"],
  ["Tigerfish", "Creature", "Rocks", "Professional Lure", 310, "Professional"],
  [
    "Flying Fish",
    "Creature",
    "Rocks",
    "Professional Lure",
    320,
    "Professional",
  ],
  ["Voxelfish", "Creature", "Rocks", "Professional Lure", 340, "Professional"],
  ["Parrotfish", "Creature", "Rocks", "Professional Lure", 350, "Professional"],
  ["Dripper", "Creature", "Rocks", "Professional Lure", 380, "Professional"],
  ["Blobfish", "Creature", "Volcano", "Scientific Lure", 1360, "Scientific"],
  ["Oarfish", "Creature", "Volcano", "Scientific Lure", 1450, "Scientific"],
  ["Anglerfish", "Creature", "Volcano", "Scientific Lure", 1500, "Scientific"],
  ["Stonefish", "Creature", "Volcano", "Scientific Lure", 1500, "Scientific"],
  [
    "Superdwarf Fish",
    "Creature",
    "Volcano",
    "Scientific Lure",
    1700,
    "Scientific",
  ],
  ["Sunfish", "Boss / Special", "Forest", "Beginner Boss Lure", 50, "Boss"],
  [
    "The Old Pike",
    "Boss / Special",
    "Forest",
    "Beginner Boss Lure",
    80,
    "Boss",
  ],
  ["Blue Shark", "Boss / Special", "Desert", "Standard Boss Lure", 300, "Boss"],
  ["Tuna", "Boss / Special", "Rocks", "Professional Boss Lure", 2000, "Boss"],
  [
    "Goblin Shark",
    "Boss / Special",
    "Volcano",
    "Scientific Boss Lure",
    6200,
    "Boss",
  ],
  ["Bowhead Whale", "Boss / Special", "Volcano", "Fish Bucket", 8000, "Boss"],
  [
    "Spider Crab",
    "Boss / Special",
    "Lighthouse",
    "Empty Beer Can",
    10000,
    "Boss",
  ],
  [
    "Giant Piranha",
    "Boss / Special",
    "Forest",
    "Modified Leech",
    11000,
    "Boss",
  ],
  ["Pufferfish", "Boss / Special", "Desert", "Carrot", 12000, "Boss"],
  ["Albatross", "Boss / Special", "Rocks", "Defeated Tuna", 13000, "Boss"],
  [
    "Mutated Bowhead Whale",
    "Boss / Special",
    "Volcano",
    "Bowhead Whale → volcano",
    15000,
    "Boss",
  ],
];
export const creatures: Creature[] = creatureRows.map(
  ([name, kind, island, lure, value, tier]) => ({
    name,
    kind,
    island,
    lure,
    value,
    tier,
  }),
);
export const bosses: Boss[] = [
  {
    name: "Sunfish",
    summon: "Beginner Boss Lure",
    route: "Forest lure pool",
    note: "Optional early special catch worth a reported base $50.",
    fight:
      "Land it on open ground, keep distance, and finish it before handling the body.",
    reward: "Collection credit and sale value; it is not a story key.",
    recovery:
      "If it escapes, restock the same lure and clear a safer landing lane.",
  },
  {
    name: "The Old Pike",
    summon: "Beginner Boss Lure",
    route: "Forest lure pool",
    note: "Optional Forest special catch worth a reported base $80.",
    fight:
      "Separate the catch from water and use the strongest reliable early weapon you can replace.",
    reward:
      "Collection credit and sale value; retain quest-marked items separately.",
    recovery:
      "Bank expensive gear, heal, and repeat the Beginner Boss Lure attempt.",
  },
  {
    name: "Blue Shark",
    summon: "Standard Boss Lure",
    route: "Desert lure pool",
    note: "Optional mid-route special catch worth a reported base $300.",
    fight:
      "Create a long shoreline lane and avoid standing between the creature and the sea.",
    reward:
      "Collection credit and sale value; this is distinct from the Pufferfish story chain.",
    recovery:
      "Return with food and ranged damage rather than trading hits near the water.",
  },
  {
    name: "Tuna",
    summon: "Professional Boss Lure",
    route: "Rocks story setup",
    note: "The required bait body for the Albatross encounter.",
    fight:
      "Subdue it without cooking or selling it, then keep the whole defeated Tuna in inventory.",
    reward:
      "A defeated Tuna becomes Albatross bait and also has reported base value $2,000.",
    recovery:
      "If sold or lost, repeat the Professional Boss Lure catch before attempting Albatross.",
  },
  {
    name: "Goblin Shark",
    summon: "Scientific Boss Lure",
    route: "Volcano lure pool",
    note: "Optional late special catch worth a reported base $6,200.",
    fight:
      "Use late-game ranged damage and fight away from lava, steep edges, and the boat.",
    reward:
      "Collection credit and high sale value; it is separate from the whale finale.",
    recovery:
      "Recover dropped weapons first, then recast only after healing and clearing the arena.",
  },
  {
    name: "Bowhead Whale",
    summon: "Fish Bucket",
    route: "Volcano finale, stage one",
    note: "Catch and transport the whale rather than treating it as the final kill.",
    fight:
      "Secure the body, keep the carry path clear, and take it to the crater objective.",
    reward:
      "The Bowhead body triggers the Mutated Bowhead stage; reported base value is $8,000.",
    recovery:
      "Do not sell, grill, or abandon the body. Recatch it with a Fish Bucket if the chain breaks.",
  },
  {
    name: "Spider Crab",
    summon: "Empty Beer Can",
    route: "Lighthouse story boss",
    note: "First story boss: Shell hand-in unlocks Boat Keys.",
    fight:
      "Sidestep the straight charge, attack only during the visible daze, then reset before it turns.",
    reward:
      "Keep the Spider Crab Shell and give it to the Lighthouse Keeper for Boat Keys.",
    recovery:
      "Normal bait will not summon it. Repeat the beer exchange to obtain another Empty Beer Can.",
  },
  {
    name: "Giant Piranha",
    summon: "Modified Leech",
    route: "Forest story boss",
    note: "Forest boss whose unique Skeleton advances the route.",
    fight:
      "Use movement and ranged damage, then secure the body before it can return to water.",
    reward:
      "Return the Giant Piranha Skeleton to the quest NPC for the next Radar marker.",
    recovery:
      "If the Skeleton is lost, repeat the Modified Leech chain and preserve the new drop.",
  },
  {
    name: "Pufferfish",
    summon: "Carrot",
    route: "Desert story boss",
    note: "The Tourist quest supplies the Carrot used for this encounter.",
    fight:
      "Give the inflated body room, attack from range, and keep the fight off the boat lane.",
    reward: "Return the Pufferfish Fin to continue the route toward Rocks.",
    recovery:
      "If no boss appears, verify that the Carrot—not an ordinary lure—is equipped.",
  },
  {
    name: "Albatross",
    summon: "Defeated Tuna",
    route: "Rocks story boss",
    note: "Aerial Rocks boss; use cover instead of chasing it in open ground.",
    fight:
      "Place the defeated Tuna as bait, fight from cover, and punish safe passes.",
    reward:
      "Keep the Albatross Head and complete the NPC hand-in for Volcano coordinates.",
    recovery:
      "A sold Tuna or Head stalls the chain; recatch Tuna and repeat the encounter.",
  },
  {
    name: "Mutated Bowhead Whale",
    summon: "Bowhead Whale → volcano",
    route: "Volcano final boss",
    note: "Final combat stage after the Bowhead carry to the crater.",
    fight:
      "Use the arena geometry, avoid lava, preserve ammunition, and take damage only in safe windows.",
    reward:
      "Keep the Whale Fin, return it to the Scientist, and obtain the military boat key.",
    recovery:
      "If the chain stops, verify the Bowhead reached the crater and the Whale Fin was not sold.",
  },
];
export const locations = [
  {
    name: "Lighthouse",
    type: "Starting location",
    detail: "Your first base, tutorial route, and Spider Crab encounter.",
  },
  {
    name: "Forest",
    type: "Island",
    detail:
      "A mid-game island with The Old Pike and Giant Piranha progression.",
  },
  {
    name: "Desert",
    type: "Island",
    detail:
      "The third story location, centered on Pufferfish progression; Blue Shark is optional collection.",
  },
  {
    name: "Rocks",
    type: "Island",
    detail: "A main-route island for gear and story progression.",
  },
  {
    name: "Volcano",
    type: "Island",
    detail: "The final main-route island and endgame progression.",
  },
];
const achievementRows: Omit<
  Achievement,
  "icon" | "globalRate" | "location" | "difficulty"
>[] = [
  {
    name: "Getting Started",
    official: "Kill your first creature",
    category: "Story",
    route:
      "Land an opening catch at Lighthouse, move it away from the water, and finish it with your available tool.",
  },
  {
    name: "Drip",
    official: "Kill a drip creature",
    category: "Collection",
    route:
      "Find a rare Drip variant during normal collection and defeat it. Do not confuse the variant with the Reel of Fortune cosmetic reward.",
  },
  {
    name: "Who Stole My Beer",
    official:
      "Find and kill the culprit, then bring it to the lighthouse keeper",
    category: "Story",
    route:
      "Use the Empty Beer Can to summon Spider Crab, defeat it, keep the Shell, and complete the Lighthouse Keeper hand-in.",
  },
  {
    name: "Getting an Upgrade",
    official: "Upgrade your boat engine",
    category: "Equipment",
    route:
      "Buy any engine upgrade after securing enough cash. Confirm the new engine is fitted before leaving the shop.",
  },
  {
    name: "Noob",
    official: "Kill a creature with no kill score multiplier",
    category: "Combat",
    route:
      "Make a plain grounded kill without a trick-shot multiplier. Avoid airborne or stunt damage on the finishing hit.",
  },
  {
    name: "Dinnertime",
    official: "Catch dinner for the lady in the forest",
    category: "Story",
    route:
      "Complete the Forest lady’s food request and return the requested catch before moving to the boss hand-in.",
  },
  {
    name: "Let Me Go",
    official: "Get picked up by the seagull",
    category: "Stunt",
    route:
      "In the game, allow a seagull to collect your defeated character. Use a disposable cleanup save and bank valuable equipment first.",
  },
  {
    name: "Impressive",
    official: "Get a 5x killscore multiplier",
    category: "Combat",
    route:
      "Build a five-times multiplier on one creature before the final hit; practice with a safe early catch and inexpensive weapon.",
  },
  {
    name: "Grillmaster",
    official: "Start the grill",
    category: "Story",
    route:
      "Complete the route step that activates the grill. Keep the requested catch separate from sale inventory until the interaction completes.",
  },
  {
    name: "Vacation",
    official: "Help the tourist swim",
    category: "Story",
    route:
      "Follow the Desert Tourist quest through its requested catch and interaction; the route also supplies the Carrot used for Pufferfish.",
  },
  {
    name: "GOLD GOLD GOLD",
    official: "Unlock a legendary skin from the slot machine",
    category: "Economy",
    route:
      "Bring one rare Drip creature to the Reel of Fortune and roll for a legendary cosmetic. The outcome is random, so save additional Drips.",
  },
  {
    name: "360 No Scope",
    official: "Kill a creature with a 360 no scope",
    category: "Combat",
    route:
      "Use a suitable ranged weapon, rotate fully before the finishing shot, and avoid aiming down sights during the shot.",
  },
  {
    name: "I Am Speed",
    official: "Buy the best boat engine",
    category: "Equipment",
    route:
      "Finish the engine upgrade ladder after story-critical purchases are safe. Prices may change by patch, so use the final shop tier as the confirmation.",
  },
  {
    name: "Fully Equipped",
    official: "Have all attachments on one weapon",
    category: "Equipment",
    route:
      "Choose one attachment-compatible weapon and fill every available attachment slot on that same weapon.",
  },
  {
    name: "Terrorizing Bird",
    official: "Defend the scared islanders",
    category: "Story",
    route:
      "At Rocks, use a defeated Tuna to start the Albatross encounter, fight from cover, and complete the resulting Head hand-in.",
  },
  {
    name: "Yummy in My Tummy",
    official: "Eat a burned creature",
    category: "Stunt",
    route:
      "Burn a creature, remove it from the heat, then use the game interaction to eat it. Do this on non-quest food.",
  },
  {
    name: "Deadliest Catch",
    official: "Help the military defeat a big creature",
    category: "Story",
    route:
      "Complete the Volcano military objective and its large-creature encounter without discarding the resulting progression item.",
  },
  {
    name: "We Are So Back",
    official: "Finish the game",
    category: "Story",
    route:
      "Complete the Volcano whale finale, return the Whale Fin, and finish the military boat-key ending sequence.",
  },
  {
    name: "All In",
    official: "Bet on green and win the roulette",
    category: "Economy",
    route:
      "Use the roulette table, choose green, and win. Treat the stake as disposable because the result is random.",
  },
  {
    name: "Easy",
    official: "Kill a boss in under 10 seconds",
    category: "Combat",
    route:
      "Return to an early boss with endgame equipment, prepare the summon and damage position, then start the timed burst.",
  },
  {
    name: "I’m the Bird Now",
    official: "Make the boat fly",
    category: "Stunt",
    route:
      "Use an explosive interaction to launch the boat in-game. Empty expensive inventory and keep teammates clear before experimenting.",
  },
  {
    name: "Competitive Eating",
    official: "Eat a miniboss",
    category: "Stunt",
    route:
      "Defeat a miniboss, prepare it as edible food, and eat it instead of selling it or using it as quest bait.",
  },
  {
    name: "Rich! Millionaire",
    official: "Sell something for at least 100,000",
    category: "Economy",
    route:
      "Raise one item’s value to at least $100,000 with the available multiplier systems, then sell that single item.",
  },
  {
    name: "Collector",
    official: "Find and kill all creatures",
    category: "Collection",
    route:
      "Complete every standard and special creature entry. Use the 49-creature checklist to isolate the missing lure tier or boss.",
  },
  {
    name: "Everyone’s Dream",
    official: "Kill a seagull with dynamite",
    category: "Stunt",
    route:
      "Bait a seagull into a predictable approach and time Dynamite at a safe distance. Bank equipment before the attempt.",
  },
  {
    name: "Handyman",
    official: "Defeat the final boss with your bare hands",
    category: "Combat",
    route:
      "Fight the Mutated Bowhead with bare hands for the required defeat; solo play avoids uncertain co-op credit assignment.",
    caution:
      "Community reports disagree about whether only the final blow counts in co-op. Use bare hands for the whole finish and verify the current build.",
  },
  {
    name: "Fishipedia",
    official: "Find and kill all drip creatures",
    category: "Collection",
    route:
      "Track every rare Drip variant across lure pools and defeat each one. Expect this to take longer than the normal collection.",
  },
  {
    name: "Bean",
    official: "Finish the game in under 1 hour",
    category: "Story",
    route:
      "Use a separate speedrun save, rehearse every hand-in, and time a clean five-location route from start to ending.",
    caution:
      "Old community shortcuts were patched. No current-version exploit is recommended; verify timing against the active build.",
  },
];
const achievementGallery: Record<
  string,
  Pick<Achievement, "icon" | "globalRate" | "location" | "difficulty">
> = {
  "Getting Started": {
    icon: "6dd241ec65b3f2b01f98b522d4654dee4d049b73",
    globalRate: 98.7,
    location: "Any location",
    difficulty: "Easy",
  },
  Drip: {
    icon: "b2d534bef56baa1529465cdf37f06a0c8e5b2ad8",
    globalRate: 96.7,
    location: "Any lure pool",
    difficulty: "Easy",
  },
  "Who Stole My Beer": {
    icon: "fe3f2fff4b264155ff6433c2cbdeef6462454979",
    globalRate: 90.8,
    location: "Lighthouse",
    difficulty: "Easy",
  },
  "Getting an Upgrade": {
    icon: "f4237c00b430233fd4cdbca4350dc37a07fc82ba",
    globalRate: 84.5,
    location: "Boat engine shop",
    difficulty: "Easy",
  },
  Noob: {
    icon: "02285b1970ee67fc8e26dc0b5f048f1ce4578e7d",
    globalRate: 84.1,
    location: "Any safe shoreline",
    difficulty: "Easy",
  },
  Dinnertime: {
    icon: "dac3b88201a5d24704692af43b62f29a4a639843",
    globalRate: 80.9,
    location: "Forest",
    difficulty: "Medium",
  },
  "Let Me Go": {
    icon: "b6595a889f04c3b8c639cf9ebe54d2841ecc822e",
    globalRate: 80.2,
    location: "Seagull route",
    difficulty: "Easy",
  },
  Impressive: {
    icon: "5e68e833d65a5892b8a75e42a4d4e3dfc4fe991a",
    globalRate: 78.3,
    location: "Any combat area",
    difficulty: "Medium",
  },
  Grillmaster: {
    icon: "1522c6c670294903e081b891472540313e050587",
    globalRate: 76.6,
    location: "Desert",
    difficulty: "Medium",
  },
  Vacation: {
    icon: "97f20b60e492d66ed5658a8b38a27aef46a6bb91",
    globalRate: 66.1,
    location: "Desert tourist",
    difficulty: "Medium",
  },
  "GOLD GOLD GOLD": {
    icon: "fb6197d91ad32488087439f861627f4757b03077",
    globalRate: 65.3,
    location: "Reel of Fortune",
    difficulty: "Medium",
  },
  "360 No Scope": {
    icon: "a55985a010ece627f4dff09393720b4c4e79d369",
    globalRate: 60.7,
    location: "Any combat area",
    difficulty: "Medium",
  },
  "I Am Speed": {
    icon: "669f3fd0b5a8952445dc00cfe0d423ab8cd9ab60",
    globalRate: 56.5,
    location: "Final engine shop",
    difficulty: "Medium",
  },
  "Fully Equipped": {
    icon: "588da3b50c3fa6eb15a43e0a74d7531fc88373e0",
    globalRate: 53.6,
    location: "Weapon shop",
    difficulty: "Medium",
  },
  "Terrorizing Bird": {
    icon: "e870f7f510d6256f48c73e6be911d2c50fe2de38",
    globalRate: 48.4,
    location: "Rocks",
    difficulty: "Hard",
  },
  "Yummy in My Tummy": {
    icon: "5ad1884e2ecbeaf019e4eade2cf34ef62106a922",
    globalRate: 44.7,
    location: "Any unlocked grill",
    difficulty: "Easy",
  },
  "Deadliest Catch": {
    icon: "8b8ec5975c1db36b9ee8faffb8497e07e59fa22b",
    globalRate: 34.7,
    location: "Volcano",
    difficulty: "Hard",
  },
  "We Are So Back": {
    icon: "717fa9271a6f07b6f3827c6c21fe36e49ab6f0ae",
    globalRate: 33.6,
    location: "Volcano finale",
    difficulty: "Hard",
  },
  "All In": {
    icon: "0ec14d7ad488508265fb44fe7325aba8f41284a2",
    globalRate: 32.8,
    location: "Roulette",
    difficulty: "Medium",
  },
  Easy: {
    icon: "fcb224953994284c7f14c237460c8e8b3ff4f3d0",
    globalRate: 26.4,
    location: "Any boss arena",
    difficulty: "Hard",
  },
  "I’m the Bird Now": {
    icon: "bc58e071e58ac9e5ca2797f2969fadcdec9fb038",
    globalRate: 22.1,
    location: "Island shoreline",
    difficulty: "Medium",
  },
  "Competitive Eating": {
    icon: "09cd177f7515ba9d693b6c2ebf7ed8bc2794b4d9",
    globalRate: 19.6,
    location: "Miniboss route",
    difficulty: "Hard",
  },
  "Rich! Millionaire": {
    icon: "82b360170155e88b25173c34c4540215c4d75b94",
    globalRate: 13.4,
    location: "Economy cleanup",
    difficulty: "Hard",
  },
  Collector: {
    icon: "4031100910abf99aa0482464a06991bc9273e417",
    globalRate: 13.2,
    location: "All five locations",
    difficulty: "Hard",
  },
  "Everyone’s Dream": {
    icon: "5d3f868c0630042e23a547e9dd6689efa875bea8",
    globalRate: 5.1,
    location: "Seagull route",
    difficulty: "Hard",
  },
  Handyman: {
    icon: "9f978a5ee40c390d66605ee42333628186ccd337",
    globalRate: 2.4,
    location: "Final boss",
    difficulty: "Extreme",
  },
  Fishipedia: {
    icon: "147a0ddca007ca61f1c422ec9d16e67b98905c5b",
    globalRate: 2.0,
    location: "All lure pools",
    difficulty: "Extreme",
  },
  Bean: {
    icon: "4da2c251978cafab300932d7bfa1d6fc4b60edf6",
    globalRate: 1.6,
    location: "Full game",
    difficulty: "Extreme",
  },
};
export const achievements: Achievement[] = achievementRows.map(
  (achievement) => ({
    ...achievement,
    ...achievementGallery[achievement.name],
  }),
);
export const sourceNotes = [
  {
    label: "Steam Community 49-creature field guide",
    url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3789629297",
  },
];
export const homeFaqs = [
  {
    question:
      "Is this website about the How to Fish game or real-world fishing?",
    answer:
      "This is an independent walkthrough for How to Fish, the 2026 co-op fishing simulator by Dazed Games. Every guide is written around the game’s creatures, weapons, lures, bosses, NPC hand-ins, and five-location story route. It is not advice about real fishing, boats, tackle, or wildlife.",
  },
  {
    question: "How many main locations are in How to Fish?",
    answer:
      "The main progression has five accessible locations: Lighthouse, Forest, Desert, Rocks, and Volcano. Lighthouse is available at the start, so some players describe the route as four unlockable islands. This walkthrough calls it a five-location route because all five stops contain required objectives. Developer Island is optional and is not part of the normal story chain.",
  },
  {
    question: "What should a new player do first?",
    answer:
      "Learn the Lighthouse survival and cash loop, buy the first rod, keep one recovery item, and finish the keeper’s early requests. Then obtain the Empty Beer Can, use it to summon Spider Crab, fight during the dazed window, and protect the Spider Crab Shell until it has been handed in for Boat Keys. Buy the Radar before sailing away.",
  },
  {
    question: "What is the difference between normal lures and boss bait?",
    answer:
      "Normal lure tiers expand the ordinary creature pool for a location and are mainly used for money, collection, and NPC requests. Named bait or boss lures start specific encounters and progression chains. Examples include the Empty Beer Can for Spider Crab, Modified Leech for Giant Piranha, Carrot for Pufferfish, and Fish Bucket for Bowhead Whale.",
  },
  {
    question: "Why did my next island marker not appear?",
    answer:
      "Defeating a boss is usually only one part of the unlock. Recover the unique boss item, return it to the correct NPC, finish the dialogue or hand-in, and then check the Radar. Selling, cooking, losing, or leaving behind a unique drop can make the route appear stuck even though the fight itself is complete.",
  },
  {
    question: "Does the site include all 49 creatures?",
    answer:
      "Yes. The creature encyclopedia covers 49 ordinary, boss, and special creatures with their location, lure or summon item, progression tier, and reported base value. The checklist is stored locally in your browser, does not require an account, and does not change your Steam achievements or game save.",
  },
  {
    question: "How are these walkthroughs checked after patches?",
    answer:
      "Detailed routes are built from owner-supplied gameplay research, clean explanatory images, official patch announcements, and independent written cross-checks. Pages show a checked date or version boundary when that context matters. Route dependencies are treated as more stable than prices, weapon damage, key bindings, and other numbers that can change between patches.",
  },
];
export const pageMeta: Record<
  string,
  { title: string; description: string; image?: string }
> = {
  "/": {
    title: "How to Fish Walkthrough & Game Guides Wiki",
    description:
      "Complete How to Fish Game wiki and walkthrough: boss guides, all creatures, locations, lures, and a beginner route for the 2026 Dazed Games fishing sim.",
  },
  "/beginner-guide": {
    title: "How to Fish Beginner Guide: Five-Location Route",
    description:
      "A step-by-step How to Fish Game beginner walkthrough covering the Lighthouse opening, Spider Crab, upgrades, survival tips, and the five-location route to Volcano.",
    image: "/images/guides/beginner/localized/01-beginner-cover-en.webp",
  },
  "/creatures": {
    title: "All 49 How to Fish Creatures, Lures & Values",
    description:
      "Illustrated How to Fish Game creature encyclopedia with all 49 creatures, locations, lures, reported base values, bosses, and a saved checklist.",
    image: "/images/creatures/encyclopedia-early.webp",
  },
  "/bosses": {
    title: "How to Fish Boss Guide & Progression | HTF Wiki",
    description:
      "Actionable How to Fish Game boss board with every summon, route, combat plan, reward, and recovery step.",
    image: "/images/guides/island-1/08-spider-crab.jpg",
  },
  "/locations": {
    title: "How to Fish Five-Island Route Guide | HTF Wiki",
    description:
      "Deep five-stop How to Fish Game route: every Lighthouse, Forest, Desert, Rocks and Volcano objective, boss, hand-in, marker and failure recovery.",
    image: "/images/guides/locations/five-location-route-hero.png",
  },
  "/locations/lighthouse": {
    title: "How to Fish Lighthouse Guide: First Location",
    description:
      "Complete How to Fish Game Lighthouse walkthrough: survival HUD, Clam cash route, first rod, catch controls, upgrades, Empty Beer Can, Spider Crab, Boat Keys, and Radar.",
    image: "/images/guides/island-1/08-spider-crab.jpg",
  },
  "/locations/forest": {
    title: "How to Fish Forest Guide: Giant Piranha Route",
    description:
      "Evidence-bounded How to Fish Forest walkthrough: current Leech objective, special bait verification, Giant Piranha phases, Skeleton hand-in, and Desert checks.",
    image: "/images/home/04-forest-route.webp",
  },
  "/locations/desert": {
    title: "How to Fish Desert Guide: Pufferfish Route",
    description:
      "Evidence-bounded How to Fish Desert walkthrough: quest verification, Standard pool boundary, Pufferfish gas phase, Fin safety, and Rocks departure checks.",
    image: "/images/guides/locations/five-location-route-hero.png",
  },
  "/locations/rocks": {
    title: "How to Fish Rocks Island Guide | HTF Wiki",
    description:
      "Complete Rocks Island 4 walkthrough for How to Fish Game: Professional catches, Tuna, Albatross cover strategy, Head hand-in, and Volcano coordinates.",
    image: "/images/creatures/encyclopedia-professional.webp",
  },
  "/locations/volcano": {
    title: "How to Fish Volcano Island Guide | HTF Wiki",
    description:
      "Complete Volcano Island 5 walkthrough for How to Fish Game: Scientific catches, Scientist quest, Bowhead Whale, crater carry, Mutated Bowhead fight, and Whale Fin ending.",
    image: "/images/guides/volcano/01-volcano-arrival.png",
  },
  "/guides/reel-of-fortune": {
    title: "How to Fish Reel of Fortune Guide | HTF Wiki",
    description:
      "Use one rare Drip creature at the Reel of Fortune, identify the random cosmetic skin, equip it with Z or C, and understand GOLD GOLD GOLD.",
    image: "/images/guides/reel-of-fortune/reel-machine-hero.png",
  },
  "/lures": {
    title: "How to Fish Lures & Bait Guide",
    description:
      "How to Fish Game lure guide with every regular pool, creature assignment, special boss summon, route use, and safe casting routine.",
    image: "/images/creatures/encyclopedia-scientific.webp",
  },
  "/bosses/spider-crab": {
    title: "How to Beat Spider Crab | HTF Wiki",
    description:
      "Beat the How to Fish Game Spider Crab: get the Empty Beer Can, dodge its charge, punish the stun, turn in the shell, and use the boat keys.",
    image: "/images/guides/island-1/08-spider-crab.jpg",
  },
  "/achievements": {
    title: "How to Fish Achievements Guide: All 28",
    description:
      "All 28 official How to Fish Game achievement conditions with practical routes, cleanup order, patch cautions, and global completion rates.",
    image: "/images/achievements/4031100910abf99aa0482464a06991bc9273e417.webp",
  },
  "/about": {
    title: "About How to Fish Walkthrough - Independent Game Guide",
    description:
      "Learn how How to Fish Walkthrough researches, verifies, illustrates, and updates its independent player-made game guides.",
  },
  "/contact": {
    title: "Contact How to Fish Walkthrough",
    description:
      "Privately report a correction, privacy question, accessibility problem, broken page, or rights concern to How to Fish Walkthrough.",
  },
  "/privacy": {
    title: "Privacy Policy | How to Fish Walkthrough",
    description:
      "Read the How to Fish Walkthrough privacy policy, including email communications, local storage, cookies, advertising, and user choices.",
  },
  "/terms": {
    title: "Terms & Disclaimer | How to Fish Walkthrough",
    description:
      "Terms, game-trademark disclaimer, source policy, and limitations for the independent How to Fish Walkthrough guide site.",
  },
};
