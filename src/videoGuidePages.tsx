type Step = { title: string; body: string };

const Crumb = ({ title }: { title: string }) => (
  <div className="crumb"><a href="/">Chart room</a><span>›</span><a href="/bosses">Video guides</a><span>›</span>{title}</div>
);

const GuideImage = ({ src, alt, caption, width = 1536, height = 1024 }: { src: string; alt: string; caption: string; width?: number; height?: number }) => (
  <figure className="video-guide-image">
    <img src={src} alt={alt} width={width} height={height} loading="eager" decoding="async" fetchPriority="high" />
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

const HandymanLoadoutDiagram = () => (
  <figure className="guide-visual handyman-diagram">
    <svg viewBox="0 0 1200 520" role="img" aria-labelledby="handyman-loadout-title handyman-loadout-desc" xmlns="http://www.w3.org/2000/svg">
      <title id="handyman-loadout-title">Handyman bare-hand preparation checklist</title>
      <desc id="handyman-loadout-desc">A four-part checklist: finish the Volcano chain, store damage tools, keep recovery separate, and begin solo when possible.</desc>
      <rect width="1200" height="520" rx="36" fill="#102824" />
      <text x="64" y="88" fill="#f7e6be" fontFamily="Georgia,serif" fontSize="42" fontWeight="700">HANDYMAN PRE-FIGHT CHECK</text>
      <text x="64" y="126" fill="#a8c7bf" fontFamily="Arial,sans-serif" fontSize="22">Use this before placing the regular Bowhead body at the crater.</text>
      {[
        ['01', ['Finish Volcano', 'story chain'], ['Fish Bucket → Bowhead', '→ crater']],
        ['02', ['Store damage', 'tools'], ['No gun, knife,', 'or explosive']],
        ['03', ['Separate recovery', 'items'], ['Keep food away from', 'weapon slots']],
        ['04', ['Prefer a solo', 'attempt'], ['Co-op final credit', 'may be unclear']],
      ].map(([n, head, body], index) => {
        const x = 64 + index * 282;
        return <g key={String(n)}><rect x={x} y="178" width="248" height="258" rx="24" fill="#1b4139" stroke="#4d8d7d" strokeWidth="3"/><circle cx={x + 44} cy="226" r="25" fill="#efae58"/><text x={x + 44} y="234" fill="#102824" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="20" fontWeight="700">{n}</text><text x={x + 28} y="286" fill="#f7e6be" fontFamily="Arial,sans-serif" fontSize="21" fontWeight="700">{(head as string[]).map((line, lineIndex) => <tspan x={x + 28} dy={lineIndex === 0 ? 0 : 28} key={line}>{line}</tspan>)}</text><text x={x + 28} y="358" fill="#b9d8cf" fontFamily="Arial,sans-serif" fontSize="17">{(body as string[]).map((line, lineIndex) => <tspan x={x + 28} dy={lineIndex === 0 ? 0 : 24} key={line}>{line}</tspan>)}</text></g>;
      })}
    </svg>
    <figcaption>Original route diagram: verify the bare-hand setup before the mutated stage begins.</figcaption>
  </figure>
);

const HandymanCombatDiagram = () => (
  <figure className="guide-visual handyman-diagram">
    <svg viewBox="0 0 1200 520" role="img" aria-labelledby="handyman-loop-title handyman-loop-desc" xmlns="http://www.w3.org/2000/svg">
      <title id="handyman-loop-title">Mutated Bowhead Whale bare-hand combat loop</title>
      <desc id="handyman-loop-desc">A loop showing safe rock cover, watch for the attack tell, wait for it to pass, use short punches, and reset behind cover.</desc>
      <rect width="1200" height="520" rx="36" fill="#211b26" />
      <text x="64" y="88" fill="#f7e6be" fontFamily="Georgia,serif" fontSize="42" fontWeight="700">CRATER COMBAT LOOP</text>
      <text x="64" y="126" fill="#d2c1d4" fontFamily="Arial,sans-serif" fontSize="22">A short safe window is better than chasing the whale across lava.</text>
      {[
        ['1', ['Hold', 'rock-side cover']],
        ['2', ['Watch the', 'lift / charge']],
        ['3', ['Let the', 'attack pass']],
        ['4', ['Punch briefly,', 'then reset']],
      ].map(([n, label], index) => {
        const x = 88 + index * 280;
        return <g key={String(n)}><circle cx={x} cy="306" r="90" fill="#3e3146" stroke="#e48f63" strokeWidth="5"/><text x={x} y="273" fill="#efae58" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="30" fontWeight="700">{n}</text><text x={x} y="323" fill="#f7e6be" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="700">{(label as string[]).map((line, lineIndex) => <tspan x={x} dy={lineIndex === 0 ? 0 : 24} key={line}>{line}</tspan>)}</text>{index < 3 && <path d={`M ${x + 108} 306 H ${x + 162}`} stroke="#efae58" strokeWidth="8" markerEnd="url(#arrow)"/>}</g>;
      })}
      <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#efae58" /></marker></defs>
    </svg>
    <figcaption>Original route diagram: cover, tell, evade, short punches, then cover again.</figcaption>
  </figure>
);

export function CasinoMoneyRouteGuide() {
  return <article className="article guide-article"><Crumb title="Casino money route"/><p className="eyebrow">ARCHIVED TEST NOTE · CURRENT-PATCH VERIFICATION PENDING</p><h1>Casino Money Route<br/><i>Verification Notes</i></h1><p className="standfirst">This page is kept as a save-safety checklist, not as a current money method. The recorded route does not provide enough repeatable evidence to recommend a roulette or inventory loop on the current patch.</p>
    <GuideImage src="/images/guides/reel-of-fortune/reel-machine-hero.png" alt="Stylized How to Fish machine room" caption="The available recording does not establish a repeatable current-patch casino route. Do not treat this cosmetic-machine image as roulette proof."/>
    <div className="callout"><b>Do not rely on this for progression:</b> inventory, host, save, and random-result behavior can change. Keep story money and unique boss drops out of any unverified test.</div>
    <Steps items={[
      {title:"Make a clean manual save",body:"Record your balance and bank protected quest items before testing any community claim. A usable test has a known starting state."},
      {title:"Use a small disposable stake",body:"Do not carry your only late-game weapon, rare catch, or the funds required for the next story unlock."},
      {title:"Change one variable at a time",body:"If you test a machine, travel, or reload behavior, change one input and write down the result rather than assuming a single lucky spin is a route."},
      {title:"Reload and recheck",body:"Return to a safe area, reload normally, and confirm that money, weapons, and quest items persisted before repeating anything."},
      {title:"Prefer normal catch-and-sell income",body:"Until three clean current-patch runs reproduce the same result, ordinary sales and story progression are the responsible money plan."},
    ]}/>
    <h2>What would make this page publishable again</h2><p>A future update needs three independently repeatable current-patch runs, a clearly identifiable machine or interaction, beginning and ending balances, normal-save confirmation, and evidence that the result is not ordinary randomness. Until then, this page intentionally avoids a profit promise, exploit instructions, or numerical payout claim.</p>
    <Related links={[["Beginner economy route","/beginner-guide"],["Five-location progression","/locations"],["Reel of Fortune cosmetics","/guides/reel-of-fortune"]]}/>
  </article>;
}

export function MutatedWhaleHandymanGuide() {
  return <article className="article guide-article"><Crumb title="Handyman achievement"/><p className="eyebrow">FINAL BOSS ACHIEVEMENT · CHECKED AUG 31, 2026</p><h1>Mutated Whale<br/><i>Handyman Guide</i></h1><p className="standfirst">Handyman’s official condition is to defeat the final boss with bare hands. This cautious route turns the Mutated Bowhead Whale crater into a controlled punch fight: finish the Volcano chain, remove damage tools, use rock cover, and only step out for short safe windows.</p>
    <GuideImage src="/images/guides/volcano/01-volcano-arrival.png" alt="Volcano arrival area before the final How to Fish boss route" caption="Handyman starts only after the normal Volcano progression has reached the final boss chain." width={1672} height={941}/>
    <section id="what-counts"><h2>What Handyman requires — and what this route does not assume</h2><p>The official achievement text says: <strong>“Defeat the final boss with your bare hands.”</strong> The final boss is the mutated stage that begins after the regular Bowhead Whale body reaches the crater. It is not the first whale encounter, a generic Volcano kill, or simply reaching the end area.</p><p>The safest practical interpretation is to use bare hands for the whole mutated fight. That is a conservative route, not a claim that every earlier hit is proven to invalidate the achievement. Because co-op credit and patch behavior can be inconsistent, attempt it solo when possible, bank every damaging tool, and wait for the achievement popup before leaving. If you are helping another player, do not assume their final hit will award your unlock.</p></section>
    <HandymanLoadoutDiagram />
    <section id="unlock-crater"><h2>1. Reach the mutated whale with a clean setup</h2><p>Do the normal Volcano dependency chain first. Catch the required native fish for the Scientist, receive the Fish Bucket, complete the regular Bowhead Whale encounter, and carry the whole body to the crater. The Handyman attempt begins only when Mutated Bowhead Whale is active; do not add an achievement attempt to an unfinished quest run.</p><p>Before placing the body, make a manual save and decide whether this is a dedicated attempt. Store guns, knives, explosives, and any equipment whose damage behavior you cannot rule out. Recovery food is useful for survival, but it should stay clearly separate from weapon slots so an emergency inventory action cannot become an accidental attack. Leave room to collect the Whale Fin after the fight.</p></section>
    <GuideImage src="/images/guides/volcano/02-bowhead-to-crater.png" alt="How to Fish Bowhead Whale body being taken toward the Volcano crater" caption="Carry the regular Bowhead body to the crater to begin the mutated final stage; do not confuse this setup with the Handyman completion itself." width={1672} height={941}/>
    <section id="position"><h2>2. Choose rock geometry before throwing a punch</h2><p>The crater is dangerous because open ground gives the whale a clean line for a charge, body slam, or lava pressure. Start on stable dark ground with a large rock or crater edge between you and the whale. Leave enough lateral space to move around that cover; a narrow lava lip can turn a successful dodge into a fall.</p><p>Do not chase the boss across the arena for damage. Your goal is to make it commit into terrain, turn around, or finish an attack past your lane. Keep the camera wide while moving so you see glowing ground and your escape line. A missed attack that leaves you safe is a better opening than a long combo that strands you in lava.</p></section>
    <GuideImage src="/images/guides/volcano/03-mutated-bowhead-fight.png" alt="Mutated Bowhead Whale fight at the Volcano crater" caption="Stable rock cover creates a repeatable approach: observe the tell, let the movement pass, then take only the nearest punch window." width={1672} height={941}/>
    <HandymanCombatDiagram />
    <section id="fight-loop"><h2>3. Read the tell, punch briefly, reset behind cover</h2><p>Watch the whale rather than staring at your fist reticle. When it lifts, lines up a charge, or begins a broad body movement, stop trying to attack. Move across the safe lane and let the committed attack pass the rock. Only after it lands, turns, or loses its direct line should you step in.</p><ol className="steps"><li><b>Wait for the commitment.</b><span>Hold cover until the approach is obvious. Trading punches before the attack resolves gives up the advantage of the rock.</span></li><li><b>Cross the safe side.</b><span>Use a sideways route with solid ground behind it. Avoid backing straight into glowing lava or an unscouted ledge.</span></li><li><b>Use a short burst of punches.</b><span>Get close enough for a few clear hits, then leave before the boss can reset its path on top of you.</span></li><li><b>Break line of sight again.</b><span>Return to the same rock-side position, heal if necessary, and wait for another committed pass.</span></li></ol><p>The boss also has an escape-pressure bar, so hiding indefinitely can waste the encounter. The balance is deliberate: stay close enough to keep the fight active, but only spend time in the open after a clear miss. Slow, repeated windows beat a panic chase.</p></section>
    <section id="failure-recovery"><h2>4. Recover cleanly when an attempt goes wrong</h2><p>If a weapon fires, an explosive is triggered, a teammate contributes uncertain final damage, or the arena state becomes too chaotic to trust, treat the attempt as compromised. Do not turn a doubtful run into a longer loss. Leave safely if the game allows it, reload the clean pre-crater save, re-check your inventory, and restart as a dedicated bare-hand attempt.</p><p>If the whale defeats you, recover without rushing. Re-establish a rock-side lane, make sure the white escape bar is still manageable, and do not sprint through lava for a single hit. The goal is a reliable achievement unlock, not the fastest final-boss time. In co-op, communicate that this is a solo-credit attempt; if the game’s result is unclear, repeat solo instead of claiming a shared completion.</p></section>
    <section id="completion"><h2>5. Confirm Handyman before moving on</h2><p>Keep using bare hands through the defeat animation, then pause. Wait for the Handyman notification, collect the Whale Fin, and finish the Scientist hand-in as normal. The Whale Fin and military-boat progression confirm the story chain; the achievement popup confirms the separate Handyman condition. If the story finishes but the popup never appears, record that result as unsuccessful and repeat from the clean save rather than guessing which hit counted.</p><div className="checkpoint"><span>HANDYMAN COMPLETE</span><b>Mutated final boss defeated → Handyman notification appears → Whale Fin collected → Scientist hand-in completed.</b></div></section>
    <GuideImage src="/images/achievements/9f978a5ee40c390d66605ee42333628186ccd337.webp" alt="Handyman achievement icon from How to Fish" caption="Use the in-game achievement notification as the only completion confirmation; story progress alone is not proof of Handyman." width={256} height={256}/>
    <Related links={[["Volcano full walkthrough","/locations/volcano"],["All 28 achievements","/achievements"],["All bosses board","/bosses"]]}/>
  </article>;
}
