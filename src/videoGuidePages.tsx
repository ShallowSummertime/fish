type Step = { title: string; body: string };

const Crumb = ({ title }: { title: string }) => (
  <div className="crumb"><a href="/">Chart room</a><span>›</span><a href="/bosses">Video guides</a><span>›</span>{title}</div>
);

const GuideImage = ({ src, alt, caption }: { src: string; alt: string; caption: string }) => (
  <figure className="video-guide-image">
    <img src={src} alt={alt} width="1536" height="1024" loading="eager" decoding="async" fetchPriority="high" />
    <figcaption><span>SITE GUIDE ART</span>{caption}</figcaption>
  </figure>
);

const Steps = ({ items }: { items: Step[] }) => (
  <ol className="video-guide-steps">
    {items.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></li>)}
  </ol>
);

const Related = ({ links }: { links: [string, string][] }) => (
  <aside className="related"><p className="eyebrow">KEEP READING</p><div>{links.map(([label, href]) => <a href={href} key={href}>{label}<span>→</span></a>)}</div></aside>
);

export function AllBossesWeaponsEndgameGuide() {
  return <article className="article guide-article"><Crumb title="Boss and endgame route"/><p className="eyebrow">VIDEO ROUTE 01 · CHECKED AUG 31, 2026</p><h1>All Bosses, Weapons<br/><i>&amp; Endgame Route</i></h1><p className="standfirst">A practical five-location run that connects weapon upgrades to the fight that needs them. The route starts with Spider Crab, moves through Forest, Desert and Rocks, and ends with the two-stage whale finale at Volcano.</p>
    <GuideImage src="/images/guides/locations/five-location-route-hero.png" alt="Five-location How to Fish route from Lighthouse to Volcano" caption="The main run is Lighthouse, Forest, Desert, Rocks and Volcano. Upgrade for the next fight, then protect each boss drop until the NPC hand-in is complete."/>
    <div className="callout"><b>Route rule:</b> a boss kill is not the end of an island. Pick up the unique part, return it to the correct NPC, and confirm the next marker, key or coordinates before spending money or sailing away.</div>
    <h2>Build weapons around the next encounter</h2><p>The safest economy is selective. Use early melee tools on ordinary catches, buy dependable ranged damage before the Forest and Desert fights, and reserve the strongest guns and attachments for Rocks and Volcano. A large inventory of side-grades costs more to replace and does not solve a missing quest item.</p>
    <Steps items={[
      {title:"Lighthouse — learn the loop",body:"Collect early cash, buy the first rod and a reliable weapon, then trade for the Empty Beer Can. Cast the boss item, sidestep Spider Crab's straight charge, punish the dazed window, and hand the Shell to the keeper."},
      {title:"Forest — keep distance",body:"Complete the current Leech request and verify the special bait before casting. Giant Piranha is easier when the crew spreads out, keeps moving and fires during clear approach windows. Recover the Skeleton before leaving."},
      {title:"Desert — control the gas zone",body:"Finish the Tourist request, keep the Carrot reward, and use it for Pufferfish. Do not stand inside the expanding poison area. Reposition, fire from clean ground, and protect the Fin after the kill."},
      {title:"Rocks — use cover against Albatross",body:"Catch Tuna with the Professional Boss Lure and place it on open land. Fight from hard cover so the bird's dive hits terrain, then shoot during recovery. Take the Head back for the Volcano coordinates."},
      {title:"Volcano — finish both whale stages",body:"Deliver the five native catches, obtain the Fish Bucket and defeat Bowhead Whale. Carry the body to the crater to begin Mutated Bowhead Whale, use the rock geometry to break attacks, then return the Whale Fin."},
    ]}/>
    <h2>Upgrade order that avoids wasted cash</h2><p>Buy consistency before spectacle: a weapon you can control, enough ammunition, a larger magazine where available, and recoil help for sustained fire. Dynamite is useful only when the blast cannot remove you, a teammate or a protected drop. Before every boss cast, place optional equipment in storage, carry recovery food, and leave an empty inventory slot.</p>
    <div className="checkpoint"><span>READY FOR ENDGAME</span><b>You have a stable ranged weapon, room for the Whale Fin, a clean save, and every earlier boss hand-in is reflected by the route marker or coordinates.</b></div>
    <Related links={[["Five-location walkthrough","/locations"],["All bosses board","/bosses"],["Volcano finale","/locations/volcano"],["Weapon and lure reference","/lures"]]}/>
  </article>;
}

export function CasinoMoneyRouteGuide() {
  return <article className="article guide-article"><Crumb title="Casino money route"/><p className="eyebrow">VIDEO ROUTE 02 · PATCH-SENSITIVE</p><h1>Casino Money Route<br/><i>&amp; Safe Save Routine</i></h1><p className="standfirst">The recorded route moves cash and equipment between a normal island, the boat and the roulette room. Treat it as an experimental money-management loop—not a guaranteed infinite-money method—and protect the main save before testing it.</p>
    <GuideImage src="/images/guides/reel-of-fortune/reel-machine-hero.png" alt="Stylized How to Fish machine room" caption="The casino route depends on travel, inventory state and a random result. Record the starting balance so you can tell profit from a lucky single spin."/>
    <div className="callout"><b>Patch warning:</b> save, host and inventory behavior can change. Never test a community money route with irreplaceable boss parts, your only late-game weapon, or money you need for story progression.</div>
    <Steps items={[
      {title:"Record the baseline",body:"Write down the current balance and take note of the important weapons in your inventory. Make a clean save before moving or transferring anything."},
      {title:"Separate route gear",body:"Carry only the tool needed for travel and a small test stake. Store quest items, rare catches and expensive attachments so a failed reload cannot confuse the result."},
      {title:"Travel to the roulette room",body:"Use the boat route shown by your current progression state. Do not assume the casino is an early-game shortcut; if the destination is not available, continue the five-location story first."},
      {title:"Test one controlled spin",body:"Use a fixed amount, wait for the result to settle and compare the new balance with the number you recorded. A win is random profit, not proof of duplication."},
      {title:"Exit safely",body:"Stop while the state is clear, return to a safe area and confirm that money, weapons and quest items persisted. Reload once before committing more funds."},
    ]}/>
    <h2>How to verify whether the route actually works</h2><p>Repeat with the same small stake and keep a simple win/loss log. If the balance changes only with roulette outcomes, this is gambling rather than a duplication exploit. If the result depends on disconnecting, force-closing, changing host or using an older build, do not treat it as a dependable progression strategy. Updates can remove the behavior or produce partial saves.</p>
    <h2>Better money before endgame</h2><p>For a normal run, sell ordinary catches after checking their value, cook only when you can control the grill, and avoid spending boss rewards on optional weapons. This takes longer than a lucky casino result, but it does not risk story items or leave the save in an uncertain state.</p>
    <Related links={[["Beginner economy route","/beginner-guide"],["Five-location progression","/locations"],["Reel of Fortune cosmetics","/guides/reel-of-fortune"]]}/>
  </article>;
}

export function MutatedWhaleHandymanGuide() {
  return <article className="article guide-article"><Crumb title="Handyman achievement"/><p className="eyebrow">VIDEO ROUTE 03 · ACHIEVEMENT</p><h1>Easiest Mutated Whale<br/><i>Handyman Achievement</i></h1><p className="standfirst">The in-game achievement is <strong>Handyman</strong>: defeat the final boss with bare hands. This route uses the crater's solid geometry to shorten the Mutated Bowhead Whale's attack windows and keep the final punches controlled.</p>
    <GuideImage src="/images/guides/volcano/03-mutated-bowhead-fight.png" alt="Mutated Bowhead Whale fight at the Volcano crater" caption="Stay on stable rock, keep the whale on the far side of solid terrain, and step in for short bare-hand punish windows."/>
    <div className="callout"><b>Credit-safe setup:</b> attempt this solo if possible. Community reports disagree about co-op final-hit credit, so use bare hands for the entire finishing phase and verify the achievement popup before leaving.</div>
    <Steps items={[
      {title:"Finish the Volcano setup",body:"Deliver the five native catches, receive the Fish Bucket, defeat Bowhead Whale and carry the body to the crater. The achievement applies to the mutated final stage, not the first whale."},
      {title:"Bank every weapon",body:"Move guns, knives, explosives and damaging equipment out of the active slots. Keep recovery food only if consuming it cannot produce damage."},
      {title:"Take the rock-side position",body:"Stand on stable ground with a large rock or crater edge between you and the whale. Avoid the lava lip and do not chase into open terrain."},
      {title:"Punch in short windows",body:"Let the boss collide with or path around the geometry, step close for a short burst of punches, then return behind cover before the next sweep."},
      {title:"Confirm the unlock",body:"Keep using bare hands through the defeat animation. Wait for the Handyman popup, collect the Whale Fin, and finish the scientist hand-in."},
    ]}/>
    <h2>Common reasons Handyman fails</h2><p>A teammate deals the final damage, a lingering explosion finishes the boss, the first Bowhead stage is mistaken for the final boss, or the player leaves before the unlock registers. If the popup does not appear, reload the clean pre-fight save and repeat solo with all damaging items stored.</p>
    <Related links={[["Volcano full walkthrough","/locations/volcano"],["All 28 achievements","/achievements"],["All bosses board","/bosses"]]}/>
  </article>;
}

export function UnlockWeaponSkinsFastGuide() {
  return <article className="article guide-article"><Crumb title="Unlock weapon skins"/><p className="eyebrow">VIDEO ROUTE 04 · COSMETIC GUIDE</p><h1>How to Unlock<br/><i>Weapon Skins Fast</i></h1><p className="standfirst">Catch a rare Drip variant, kill it without losing the body, feed that body into the Reel of Fortune, then hold the matching weapon and cycle its unlocked appearance with Z or C.</p>
    <GuideImage src="/images/guides/reel-of-fortune/reel-machine-hero.png" alt="Reel of Fortune cosmetic machine" caption="The fastest loop is catch, confirm Drip, preserve the body, use the Reel, then test the named weapon immediately."/>
    <Steps items={[
      {title:"Fish a safe ordinary pool",body:"Choose a landing spot near open ground. Drip is a rare visual variant, so inspect the catch before carrying it across the map."},
      {title:"Kill and preserve the Drip",body:"Subdue the creature, keep its body out of the water, and do not cook, sell or eat it. Clear one inventory slot before transport."},
      {title:"Use the Reel of Fortune",body:"Carry the dead Drip body to the machine and let the full result resolve. Read which item received the cosmetic appearance."},
      {title:"Equip the exact item",body:"Own and hold the named weapon or tool. A skin is an appearance unlock, not necessarily a second pickup on the floor."},
      {title:"Cycle with Z or C",body:"Press Z or C to move through the available looks. If nothing changes, check the current key bindings and confirm that you are holding the correct item."},
    ]}/>
    <div className="callout"><b>Cosmetic only:</b> skins do not increase damage, magazine size, recoil control, fishing performance or sale value. The legendary Reel result is tied to GOLD GOLD GOLD, but no guaranteed odds are claimed here.</div>
    <Related links={[["Full Reel of Fortune guide","/guides/reel-of-fortune"],["Creature checklist","/creatures"],["Achievement checklist","/achievements"]]}/>
  </article>;
}

export function KillscoreMultipliersGuide() {
  return <article className="article guide-article"><Crumb title="Killscore multipliers"/><p className="eyebrow">VIDEO NOTE 05 · COMBAT TIMING</p><h1>Killscore Multiplier<br/><i>Details &amp; Timing</i></h1><p className="standfirst">A multi-kill chain starts when the next target dies within three seconds of the previous kill. The recorded table shows ×1.05 for two kills, ×1.10 for three, ×1.15 for four, and a reported cap of ×1.50 at ten or more.</p>
    <GuideImage src="/images/guides/beginner/localized/04-profit-multipliers-cover-en.png" alt="How to Fish multiplier planning artwork" caption="Group low-risk targets first, then begin the chain. The three-second window is easier to maintain when every target is already weakened."/>
    <div className="multiplier-table" role="table" aria-label="Killscore multiplier details"><div role="row"><b>Kills</b><b>Multiplier</b><b>Requirement</b></div><div role="row"><span>2</span><strong>×1.05</strong><span>Second kill within 3 seconds</span></div><div role="row"><span>3</span><strong>×1.10</strong><span>Continue the same window</span></div><div role="row"><span>4</span><strong>×1.15</strong><span>Continue the same window</span></div><div role="row"><span>10+</span><strong>×1.50</strong><span>Reported maximum</span></div></div>
    <Steps items={[
      {title:"Collect suitable targets",body:"Use ordinary, low-risk creatures on open ground. Do not include a boss or protected quest creature in a multiplier test."},
      {title:"Lower health before the chain",body:"Weaken each target without finishing it. Space them close enough that you can turn and attack without reloading or crossing water."},
      {title:"Start with a clean kill",body:"Defeat the first target only when the others are ready. The next death must land inside the three-second continuation window."},
      {title:"Keep the rhythm",body:"Move from one prepared target to the next. A missed shot, reload or long turn can end the chain, so consistency matters more than weapon damage."},
      {title:"Read the final result",body:"Check the displayed multiplier after the sequence. Treat ×1.50 as the reported cap for ten or more kills and recheck after balance patches."},
    ]}/>
    <p className="fineprint">Only the values visible in the supplied table are listed as fixed rows. Intermediate five-to-nine-kill labels are not invented here.</p>
    <Related links={[["Beginner combat and value guide","/beginner-guide"],["Creature checklist","/creatures"],["Weapons and lures","/lures"]]}/>
  </article>;
}

export function SummonSpiderCrabGuide() {
  return <article className="article guide-article"><Crumb title="Summon Spider Crab"/><p className="eyebrow">VIDEO NOTE 06 · LIGHTHOUSE</p><h1>How to Summon<br/><i>Spider Crab</i></h1><p className="standfirst">The short clip captures the Lighthouse Keeper hand-off: bring the required item to the seated keeper, receive the boss bait, then cast it from the Lighthouse shore to start the first boss encounter.</p>
    <GuideImage src="/images/guides/island-1/08-spider-crab.jpg" alt="Spider Crab at the Lighthouse" caption="Complete the keeper exchange before casting. The boss encounter begins only after the correct special bait is equipped and placed in the water."/>
    <Steps items={[
      {title:"Get the Empty Beer Can",body:"Finish the opening Lighthouse errands and secure the Empty Beer Can. Keep it separate from food and ordinary sellable catches."},
      {title:"Return to the keeper",body:"Find the top-hatted Lighthouse Keeper seated beside the tower and complete the item hand-off. Do not leave while the dialogue is still advancing."},
      {title:"Check the boss bait",body:"Open the inventory and verify that the exchange produced the special Spider Crab bait. If it is absent, reopen the keeper interaction."},
      {title:"Cast from clear shoreline",body:"Equip the boss bait and cast into open water with enough room behind you to dodge. Keep weapons ready before the encounter resolves."},
      {title:"Finish the progression hand-in",body:"Sidestep the charge, punish the dazed window, collect the Shell and return it to the keeper. The next route depends on the Shell hand-in, not only the kill."},
    ]}/>
    <Related links={[["Full Spider Crab fight","/bosses/spider-crab"],["Lighthouse walkthrough","/locations/lighthouse"],["Beginner route","/beginner-guide"]]}/>
  </article>;
}

export function FiveBossChallengeGuide() {
  return <article className="article guide-article"><Crumb title="Five-boss challenge"/><p className="eyebrow">VIDEO ROUTE 07 · OPTIONAL CHALLENGE</p><h1>Five-Boss Challenge<br/><i>Route &amp; Loadout</i></h1><p className="standfirst">Run five major encounters in story order with one prepared loadout: Spider Crab, Giant Piranha, Pufferfish, Albatross and the Volcano whale finale. This version keeps the route inside the normal game and does not require third-party mods.</p>
    <GuideImage src="/images/guides/locations/five-location-route-hero.png" alt="Five-stop boss challenge route" caption="Prepare every verified summon and hand-in, then move Lighthouse → Forest → Desert → Rocks → Volcano without optional detours."/>
    <div className="callout"><b>Safe challenge rule:</b> use the current retail game, back up the save through normal platform tools, and avoid unknown executables or mod downloads. A fast clear is not worth account, device or save risk.</div>
    <Steps items={[
      {title:"Prepare one compact loadout",body:"Carry one controllable ranged weapon, ammunition, recovery food and only the required summon items. Leave room for every unique boss part."},
      {title:"Spider Crab — bait the charge",body:"Cast the special bait at Lighthouse, sidestep the straight attack, deal damage during the dazed window and complete the Shell hand-in."},
      {title:"Giant Piranha — move continuously",body:"Use the Forest quest bait, stay off the direct approach line and fire while it commits to another path. Secure the Skeleton."},
      {title:"Pufferfish — reset around gas",body:"Use the Carrot, retreat when the poison area expands, and re-enter only from clean ground. Keep the Fin after the kill."},
      {title:"Albatross — fight from cover",body:"Place the Tuna on land, anchor beside hard terrain and punish after a blocked dive. Recover the Head and confirm Volcano coordinates."},
      {title:"Whale finale — protect the finish",body:"Complete the Scientist chain, defeat Bowhead Whale, carry its body to the crater and finish Mutated Bowhead Whale from stable rock cover."},
    ]}/>
    <h2>How to time the challenge fairly</h2><p>Start the timer from the first boss cast or from a fresh Lighthouse spawn—choose one rule before the run. Stop it when the final whale is defeated or when the Whale Fin hand-in completes. Record deaths, reloads and co-op help. A consistent rule makes later attempts comparable even when the game receives balance changes.</p>
    <Related links={[["All bosses board","/bosses"],["Five-location route","/locations"],["Volcano finale","/locations/volcano"],["Achievements","/achievements"]]}/>
  </article>;
}
