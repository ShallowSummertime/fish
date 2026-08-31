import { useEffect, useMemo, useState } from "react";
import {
  achievements,
  bosses,
  creatures,
  homeFaqs,
  locations,
  pageMeta,
  sourceNotes,
} from "./data";
import {
  DesertGuide,
  ForestGuide,
  LocationsGuide,
  ReelOfFortuneGuide,
  RocksGuide,
  VolcanoGuide,
} from "./guidePages";
import {
  CasinoMoneyRouteGuide,
  MutatedWhaleHandymanGuide,
} from "./videoGuidePages";

const DOMAIN = "https://howtofishwalkthrough.com";
const nav = [
  ["Beginner Guide", "/beginner-guide"],
  ["Creature List", "/creatures"],
  ["Boss Guides", "/bosses"],
  ["Locations", "/locations"],
  ["Lures", "/lures"],
];
const articlePaths = new Set([
  "/beginner-guide",
  "/locations/lighthouse",
  "/locations/forest",
  "/locations/desert",
  "/locations/rocks",
  "/locations/volcano",
  "/guides/reel-of-fortune",
  "/guides/casino-money-route",
  "/guides/mutated-whale-handyman",
  "/bosses/spider-crab",
]);
const collectionPaths = new Set([
  "/creatures",
  "/bosses",
  "/locations",
  "/lures",
  "/achievements",
]);
const schemaType = (path: string) =>
  path === "/"
    ? "WebSite"
    : articlePaths.has(path)
      ? "Article"
      : collectionPaths.has(path)
        ? "CollectionPage"
        : path === "/about"
          ? "AboutPage"
          : path === "/contact"
            ? "ContactPage"
            : "WebPage";
function Meta({ path }: { path: string }) {
  const noindex = path === "/guides/casino-money-route";
  const known = Boolean(pageMeta[path]);
  const m = pageMeta[path] ?? {
    title: "Page Not Found | How to Fish Walkthrough",
    description: "This How to Fish Walkthrough page does not exist.",
  };
  useEffect(() => {
    const url = known ? DOMAIN + path : DOMAIN;
    const image = m.image ? DOMAIN + m.image : undefined;
    document.title = m.title;
    const set = (name: string, content: string, property = false) => {
      let el = document.head.querySelector(
        `meta[${property ? "property" : "name"}="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(property ? "property" : "name", name);
        document.head.append(el);
      }
      el.content = content;
    };
    set("description", m.description);
    set("og:title", m.title, true);
    set("og:description", m.description, true);
    set(
      "og:type",
      known && articlePaths.has(path) ? "article" : "website",
      true,
    );
    set("og:url", url, true);
    set("twitter:card", "summary_large_image");
    set("robots", known && !noindex ? "index,follow,max-image-preview:large" : "noindex,follow");
    if (image) {
      set("og:image", image, true);
      set("twitter:image", image);
    }
    let canonical = document.head.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = url;
    const type = schemaType(path);
    const primary: any = {
      "@type": type,
      name: m.title,
      description: m.description,
      url,
    };
    if (type === "Article")
      Object.assign(primary, {
        headline: m.title,
        mainEntityOfPage: url,
        image,
        dateModified:
          path.startsWith("/guides/")
            ? "2026-08-31"
            : path === "/locations/forest" || path === "/locations/desert"
            ? "2026-08-29"
            : "2026-08-28",
        author: { "@type": "Organization", name: "How to Fish Walkthrough" },
        about: { "@type": "VideoGame", name: "How to Fish" },
      });
    if (path === "/achievements")
      Object.assign(primary, {
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: achievements.length,
          itemListElement: achievements.map((achievement, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: achievement.name,
            description: achievement.official,
            image: `${DOMAIN}/images/achievements/${achievement.icon}.webp`,
          })),
        },
      });
    const graph: any[] = [
      primary,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "How to Fish Walkthrough",
            item: DOMAIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: path === "/" ? "Guides" : m.title,
            item: url,
          },
        ],
      },
    ];
    if (path === "/")
      graph.push({
        "@type": "FAQPage",
        mainEntity: homeFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      });
    const schema = { "@context": "https://schema.org", "@graph": graph };
    const id = "ld-json";
    document.getElementById(id)?.remove();
    const s = document.createElement("script");
    s.id = id;
    s.type = "application/ld+json";
    s.text = JSON.stringify(schema);
    document.head.append(s);
    return () => s.remove();
  }, [path, m, known]);
  return null;
}
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <a className="brand" href="/">
        <span className="brand-mark">◉</span>
        <span>
          HOW TO FISH<em> WALKTHROUGH</em>
        </span>
      </a>
      <button
        className="menu"
        aria-label="Toggle navigation"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      <nav id="primary-navigation" className={open ? "open" : ""}>
        {nav.map(([label, href]) => (
          <a href={href} key={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        HOW TO FISH <span>WALKTHROUGH</span>
      </div>
      <p>
        Independent player-made guide for the Dazed Games fishing simulator. Not
        affiliated with Dazed Games.
      </p>
      <nav className="footer-nav" aria-label="Site information">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms &amp; Disclaimer</a>
      </nav>
      <div className="source-links">
        Research references:{" "}
        {sourceNotes.map((s, i) => (
          <span key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
            {i < sourceNotes.length - 1 ? " · " : ""}
          </span>
        ))}
      </div>
    </footer>
  );
}
const Crumb = ({ children }: { children: React.ReactNode }) => (
  <div className="crumb">
    <a href="/">Chart room</a>
    <span>›</span>
    {children}
  </div>
);
const Trust = () => (
  <div className="trust">
    <b>UPDATED AUG 28, 2026 · PATCH 1.0.10</b>
    <span>
      Patch 1.0.10 is the current maintenance reference. The earlier 1.0.9
      footage still verifies the Lighthouse, Empty Beer Can, knife, and
      post-charge daze visuals, and its Easy/Hard difficulty note remains
      relevant; no platform frames are republished here.
    </span>
  </div>
);
const Related = ({ links }: { links: [string, string][] }) => (
  <aside className="related">
    <p className="eyebrow">RELATED GUIDES</p>
    <div>
      {links.map(([label, href]) => (
        <a href={href} key={href}>
          {label}
          <span>→</span>
        </a>
      ))}
    </div>
  </aside>
);
function GuideVisual({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  if (src.includes("/beginner/localized/")) return null;
  return (
    <figure className="guide-visual">
      <img src={src} alt={alt} />
      <figcaption>
        <span>ORIGINAL FIELD DIAGRAM</span>
        {caption}
      </figcaption>
    </figure>
  );
}
function VideoFrame({
  src,
  step,
  title,
  caption,
}: {
  src: string;
  step: string;
  title: string;
  caption: string;
}) {
  return (
    <figure className="video-frame">
      <div>
        <img
          src={src}
          alt={`${title} shown in How to Fish gameplay`}
          width="1248"
          height="490"
          loading="lazy"
          decoding="async"
        />
        <span>STEP {step}</span>
        <b>{title}</b>
      </div>
      <figcaption>
        {caption}
        <small>
          Frame extracted from owner-provided gameplay footage; platform chrome
          and embedded subtitles removed.
        </small>
      </figcaption>
    </figure>
  );
}
const beginnerSlides = [
  {
    src: "/images/guides/beginner/localized/01-beginner-cover-en.webp",
    label: "START HERE",
    title: "Plan the whole beginner route",
    summary:
      "The opening route has three goals: stabilize survival, upgrade only when a fight requires it, and complete each boss hand-in before sailing away.",
    steps: [
      "Learn the Lighthouse food-and-cash loop.",
      "Buy tools for the next obstacle—not the whole shop.",
      "Follow the boss drop → NPC hand-in → coordinates chain.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/02-survival-loop-cover-en.webp",
    label: "PART 01",
    title: "Build your first survival loop",
    summary:
      "Turn the Lighthouse tutorial into a repeatable loop that produces food, cash, and collection progress without wasting an early life.",
    steps: [
      "Watch health and hunger; keep one edible item.",
      "Collect Clams and use the keeper hand-in for seed money.",
      "Buy the first rod, then cast, reel, drop, stow, and attack.",
      "Inspect weight and price before choosing to eat or sell.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/03-bait-hotspots-cover-en.webp",
    label: "PART 02",
    title: "Match the bait to the target",
    summary:
      "Normal lure tiers expand the catch pool, while named bait advances quests or summons bosses. Confirm the equipped item before every important cast.",
    steps: [
      "Empty Beer Can summons Spider Crab.",
      "Modified Leech leads to Giant Piranha.",
      "Carrot summons Pufferfish.",
      "Move the lure by reeling or walking backward; investigate dense surface ripples.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/04-profit-multipliers-cover-en.webp",
    label: "PART 03",
    title: "Raise value before selling",
    summary:
      "Trick shots and cooking can improve profit, but only after the creature is safely subdued and moved away from water or environmental hazards.",
    steps: [
      "Secure the catch before attempting a stunt.",
      "Use a controlled airborne shot instead of chasing the maximum multiplier.",
      "Watch the grill meter and remove the catch near its value peak.",
      "Sell only after the multiplier step is complete.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/05-weapon-ladder-cover-en.webp",
    label: "PART 04",
    title: "Climb the early weapon ladder",
    summary:
      "Every purchase should shorten the next dangerous interaction. A dependable melee tool comes before expensive ranged options and attachments.",
    steps: [
      "Use fists only for the safest opening catches.",
      "Buy a Knife or other reliable melee upgrade.",
      "Move to a Pistol or Shotgun when distance becomes important.",
      "Delay optional weapons until the current boss demands them.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/06-firepower-death-cover-en.webp",
    label: "PART 05",
    title: "Protect late-game firepower",
    summary:
      "Sniper and assault-rifle upgrades help at Volcano, but expensive equipment is also what hurts most to lose after a careless death.",
    steps: [
      "Buy the core gun before stacking attachments.",
      "Prioritize magazine and recoil control for consistent damage.",
      "Treat Dynamite as a danger to you and nearby teammates.",
      "Follow the white marker and recover the expensive weapon first.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/07-island-route-cover-en.webp",
    label: "PART 06",
    title: "Follow the five-location route",
    summary:
      "Count Lighthouse as the first accessible location. Forest, Desert, Rocks, and Volcano are the four destinations unlocked afterward.",
    steps: [
      "Lighthouse: Spider Crab → Boat Keys → green marker.",
      "Forest: Giant Piranha Skeleton → yellow marker.",
      "Desert: Pufferfish Fin → red marker.",
      "Rocks: Albatross Head → final coordinates.",
      "Volcano: complete the whale finale and obtain the military boat key.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/08-coop-hazards-cover-en.webp",
    label: "PART 07",
    title: "Manage revives and environmental risk",
    summary:
      "A team saves time only when it stays close enough to revive. Inventory discipline also prevents a waterspout, night creature, or lava mistake from erasing the run.",
    steps: [
      "Keep one teammate in revival range during boss attempts.",
      "Carry a Revive Fish when the route allows it.",
      "Expand backpack space, but bank valuable items before risk.",
      "Treat night, sea urchins, waterspouts, and lava as route hazards.",
    ],
  },
  {
    src: "/images/guides/beginner/localized/09-boss-clear-cover-en.webp",
    label: "PART 08",
    title: "Clear every boss hand-in",
    summary:
      "A boss kill alone does not unlock the next destination. Recover the unique progression item and finish the NPC exchange before checking the Radar.",
    steps: [
      "Spider Crab: keep every unique drop until Boat Keys are awarded.",
      "Giant Piranha: return its Skeleton.",
      "Pufferfish: return its Fin.",
      "Albatross: return its Head.",
      "Volcano: finish Bowhead Whale and Mutated Bowhead Whale.",
    ],
  },
];
function BeginnerCarousel() {
  const [active, setActive] = useState(0);
  const move = (delta: number) =>
    setActive(
      (i) => (i + delta + beginnerSlides.length) % beginnerSlides.length,
    );
  return (
    <section
      className="beginner-carousel"
      aria-label="Beginner walkthrough steps"
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
      }}
      tabIndex={0}
    >
      <div className="carousel-toolbar">
        <div>
          <span>VISUAL WALKTHROUGH</span>
          <b>{String(active + 1).padStart(2, "0")} / 09</b>
        </div>
        <div>
          <button onClick={() => move(-1)} aria-label="Previous guide step">
            ←
          </button>
          <button onClick={() => move(1)} aria-label="Next guide step">
            →
          </button>
        </div>
      </div>
      <div className="carousel-track">
        {beginnerSlides.map((slide, i) => (
          <article
            key={slide.src}
            hidden={i !== active}
            aria-hidden={i !== active}
          >
            <figure>
              <img
                src={slide.src}
                alt={`${slide.title} infographic`}
                width={i === 6 ? 1024 : i === 8 ? 1019 : i === 7 ? 940 : 941}
                height={i === 6 ? 1536 : i === 8 ? 1543 : 1672}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
              />
            </figure>
            <div className="carousel-copy">
              <p className="eyebrow">{slide.label}</p>
              <h2>{slide.title}</h2>
              <p>{slide.summary}</p>
              <ol>
                {slide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>
      <div className="carousel-dots" aria-label="Choose guide step">
        {beginnerSlides.map((slide, i) => (
          <button
            key={slide.src}
            className={i === active ? "active" : ""}
            onClick={() => setActive(i)}
            aria-label={`Show ${slide.label}: ${slide.title}`}
            aria-current={i === active ? "step" : undefined}
          >
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
const homeSlides = [
  {
    src: "/images/home/01-lighthouse-start.webp",
    label: "FIELD FRAME 01",
    title: "Start at the Lighthouse",
    copy: "Meet the keeper, stabilize hunger, and turn the opening errands into your first reliable cash loop.",
    href: "/locations/lighthouse",
  },
  {
    src: "/images/home/02-first-catch.webp",
    label: "FIELD FRAME 02",
    title: "Land the first catch",
    copy: "Cast from the starting dock, subdue the catch, then inspect its value before deciding whether to eat or sell.",
    href: "/beginner-guide",
  },
  {
    src: "/images/home/03-spider-crab.webp",
    label: "FIELD FRAME 03",
    title: "Beat Spider Crab",
    copy: "Use the Empty Beer Can, sidestep the charge, and punish the boss only during the visible dazed window.",
    href: "/bosses/spider-crab",
  },
  {
    src: "/images/home/04-forest-route.webp",
    label: "FIELD FRAME 04",
    title: "Follow the Forest marker",
    copy: "Complete the boss hand-in, secure the Boat Keys, buy the Radar, and follow the green route across the sea.",
    href: "/locations",
  },
];
function HomeCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const move = (delta: number) =>
    setActive((i) => (i + delta + homeSlides.length) % homeSlides.length);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const id = window.setInterval(() => move(1), 6500);
    return () => window.clearInterval(id);
  }, [paused]);
  return (
    <section
      className="hero-gallery"
      aria-label="Original How to Fish gameplay field images"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
      }}
      tabIndex={0}
    >
      <div className="hero-gallery-track">
        {homeSlides.map((slide, i) => (
          <figure
            key={slide.src}
            hidden={i !== active}
            aria-hidden={i !== active}
          >
            <a href={slide.href}>
              <img
                src={slide.src}
                alt={`${slide.title} in How to Fish gameplay`}
                width="1536"
                height="1024"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
              />
              <figcaption>
                <span>{slide.label}</span>
                <b>{slide.title}</b>
                <small>{slide.copy}</small>
              </figcaption>
            </a>
          </figure>
        ))}
      </div>
      <div className="hero-gallery-controls">
        <button onClick={() => move(-1)} aria-label="Previous field image">
          ←
        </button>
        <div>
          {homeSlides.map((slide, i) => (
            <button
              key={slide.src}
              className={i === active ? "active" : ""}
              onClick={() => setActive(i)}
              aria-label={`Show ${slide.title}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>
        <b>
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(homeSlides.length).padStart(2, "0")}
        </b>
        <button onClick={() => move(1)} aria-label="Next field image">
          →
        </button>
      </div>
    </section>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE UNOFFICIAL FIELD GUIDE</p>
          <h1>
            How to Fish
            <br />
            <i>Walkthrough &amp; Guides</i>
          </h1>
          <p className="lede">
            How to Fish is a 2026 co-op fishing simulator by Dazed Games. Chart
            every creature, boss, lure, and main location with a route built for
            new crews.
          </p>
          <div className="cta">
            <a className="button primary" href="/beginner-guide">
              Start at the Lighthouse <b>→</b>
            </a>
            <a className="text-link" href="/creatures">
              Open creature log
            </a>
          </div>
        </div>
        <HomeCarousel />
      </section>
      <section className="status-strip">
        <div>
          <strong>49</strong>
          <span>CREATURES LOGGED</span>
        </div>
        <div>
          <strong>11</strong>
          <span>BOSS &amp; SPECIALS</span>
        </div>
        <div>
          <strong>5</strong>
          <span>MAIN LOCATIONS</span>
        </div>
        <div>
          <strong>28</strong>
          <span>ACHIEVEMENTS</span>
        </div>
      </section>
      <section className="section intro">
        <p className="eyebrow">PLOT A COURSE</p>
        <h2>
          Everything has a <i>next step.</i>
        </h2>
        <p>
          This How to Fish Game walkthrough follows the dependency chain the
          game actually uses. Story progress comes from a special bait, a boss
          encounter, a unique drop, an NPC hand-in, and a new Radar marker.
          Creature collection runs beside that chain: ordinary lure tiers open
          larger pools for money and completion, but catching more fish does not
          replace the required story item.
        </p>
        <p>
          Use the site in the same order you would use a field manual. Start
          with the beginner route if the controls, hunger loop, inventory, or
          first purchases are still unfamiliar. Open the creature log when you
          know the target but not its lure, location, or value. Move to a
          location guide when the objective marker has disappeared, an NPC will
          not accept an item, or a boss drop needs to reach the next island
          safely.
        </p>
      </section>
      <section className="path-grid">
        <GuideCard
          n="01"
          title="Begin here"
          copy="A no-nonsense first route from the Lighthouse to your first upgrades."
          href="/beginner-guide"
          accent="amber"
        />
        <GuideCard
          n="02"
          title="Creature log"
          copy="Search all 49 creatures and keep a personal checklist that stays saved."
          href="/creatures"
          accent="mint"
        />
        <GuideCard
          n="03"
          title="Boss board"
          copy="Every special creature, its summons, and where it belongs in the route."
          href="/bosses"
          accent="coral"
        />
      </section>
      <section className="home-video-guides">
        <div className="video-guides-heading">
          <p className="eyebrow">DEEPER FIELD ROUTES</p>
          <h2>One task per page.<br/><i>One clear next step.</i></h2>
          <p>Use the route that matches the thing you are doing now: the first boss, the full five-stop progression, cosmetic skins, or the final achievement attempt.</p>
        </div>
        <div className="video-guides-list">
          {[
            ["01", "Spider Crab: summon, fight, hand-in", "/bosses/spider-crab"],
            ["02", "All bosses and five-stop route", "/bosses#boss-run"],
            ["03", "Mutated Whale Handyman", "/guides/mutated-whale-handyman"],
            ["04", "Reel of Fortune weapon skins", "/guides/reel-of-fortune#fast-skins"],
            ["05", "Beginner value and multi-kill chain", "/beginner-guide#profit-multipliers"],
          ].map(([n, label, href]) => <a href={href} key={href}><span>{n}</span><b>{label}</b><i>→</i></a>)}
        </div>
      </section>
      <section className="home-split">
        <div>
          <p className="eyebrow">FIELD NOTES</p>
          <h2>
            Five main locations.
            <br />
            <i>One clear route.</i>
          </h2>
          <p>
            Lighthouse is the starting location. Forest, Desert, Rocks, and
            Volcano are the four main islands. Secret Developer Island is a
            testing area, not part of the normal route.
          </p>
          <a className="text-link" href="/locations">
            View location chart →
          </a>
        </div>
        <div className="location-list">
          {locations.map((x, i) => (
            <a
              href={
                x.name === "Lighthouse"
                  ? "/locations/lighthouse"
                  : x.name === "Forest"
                    ? "/locations/forest"
                    : x.name === "Desert"
                      ? "/locations/desert"
                  : x.name === "Rocks"
                    ? "/locations/rocks"
                    : "/locations/volcano"
              }
              key={x.name}
            >
              <span>0{i + 1}</span>
              <b>{x.name}</b>
              <small>{x.type}</small>
              <i>→</i>
            </a>
          ))}
        </div>
      </section>
      <section className="home-field-manual">
        <div className="manual-heading">
          <p className="eyebrow">HOW THE WALKTHROUGH WORKS</p>
          <h2>
            Keep the route item.
            <br />
            <i>Unlock the next marker.</i>
          </h2>
          <p>
            How to Fish is built around short combat and collection loops, but
            the story only advances when their outputs are handled correctly.
            These are the habits that prevent a successful boss fight from
            turning into a stalled save.
          </p>
        </div>
        <div className="manual-grid">
          <article>
            <span>01 · LIGHTHOUSE</span>
            <h3>Stabilize before you collect</h3>
            <p>
              Watch health and hunger, turn the shore errands into seed money,
              and buy the first rod before wandering. Keep one edible catch
              instead of selling the entire inventory. Once the basic cast,
              reel, land, subdue, inspect, and sell loop feels safe, prepare the
              Empty Beer Can encounter rather than farming every early creature.
            </p>
            <p>
              Spider Crab teaches the permanent boss rule: dodge the committed
              attack, punish the recovery window, and stop attacking before the
              boss turns. Recover the Spider Crab Shell, hand it to the
              Lighthouse Keeper for Boat Keys, and purchase the Radar
              separately. A kill without the Shell hand-in does not complete the
              departure chain.
            </p>
            <a href="/locations/lighthouse">
              Read the Lighthouse walkthrough →
            </a>
          </article>
          <article>
            <span>02 · FOREST &amp; DESERT</span>
            <h3>Treat every NPC request as a dependency</h3>
            <p>
              Forest and Desert expand the lure pools, but their route bosses
              still depend on named quest items. In Forest, the Modified Leech
              leads to Giant Piranha; its Skeleton belongs in the next hand-in.
              In Desert, the Tourist’s request produces the Carrot used for
              Pufferfish, and the Pufferfish Fin is the route item that opens
              Rocks.
            </p>
            <p>
              Before sailing, confirm that the unique drop is physically in your
              possession and separated from food, sale items, and grill
              experiments. If the marker is missing, return to the last NPC
              rather than repeating random catches. The most common progression
              mistake is assuming that defeating the creature automatically
              completes the objective.
            </p>
            <a href="/locations/forest">Open the Forest walkthrough →</a>{" "}
            <a href="/locations/desert">Open the Desert walkthrough →</a>
          </article>
          <article>
            <span>03 · ROCKS &amp; VOLCANO</span>
            <h3>Prepare for multi-stage objectives</h3>
            <p>
              Late-game routes combine collection, combat, transport, and
              hand-ins. Rocks uses Professional lure pools, a Tuna objective,
              and the Albatross encounter before the Head can be exchanged for
              Volcano coordinates. The challenge is not simply damage: protect
              the boss item and keep enough inventory control to finish the
              chain.
            </p>
            <p>
              Volcano adds a longer finale. Complete the scientist’s
              native-creature request, receive the Fish Bucket, catch Bowhead
              Whale, and carry the whole body to the crater. The Mutated Bowhead
              fight produces the Whale Fin required for the final scientist
              hand-in and military-boat key. Read the full guide before starting
              so an expensive loadout or whale body is not lost between stages.
            </p>
            <a href="/locations/volcano">Open the Volcano finale →</a>
          </article>
        </div>
      </section>
      <section className="home-principles">
        <div>
          <p className="eyebrow">FIRST-HOUR PRIORITIES</p>
          <h2>
            Spend for the next obstacle,
            <br />
            <i>not for the whole shop.</i>
          </h2>
        </div>
        <div className="principle-copy">
          <p>
            Early money has three jobs: keep the run alive, fund the required
            fishing tool, and shorten the next dangerous interaction. A
            dependable melee upgrade is more useful than several optional
            collection lures when Spider Crab is the blocker. Ranged weapons
            become valuable when distance, flying targets, or Volcano hazards
            make close combat unreliable. Buy the core weapon before stacking
            attachments, and store spare value before a risky voyage.
          </p>
          <p>
            Ordinary lure tiers and boss bait answer different questions. Use
            ordinary lures when you are building cash, completing the
            49-creature log, or fulfilling a named NPC catch request. Use
            special items only when the objective calls for that encounter.
            Check the equipped slot, leave a clear landing area, and make room
            in the inventory before casting a quest-critical bait.
          </p>
          <p>
            Value multipliers, trick shots, cooking, optional cosmetics, and
            achievement cleanup are best left until the route is stable. Secure
            the creature before attempting a stunt, move away from water before
            throwing it, and watch the grill meter rather than guessing.
            Reliable sales and protected quest drops beat a theoretical maximum
            multiplier that ends at the bottom of the sea.
          </p>
        </div>
      </section>
      <section className="link-matrix" aria-label="All walkthrough sections">
        <a href="/lures">
          Lures &amp; Bait <span>→</span>
        </a>
        <a href="/achievements">
          28 Achievements <span>→</span>
        </a>
        <a href="/bosses/spider-crab">
          Spider Crab Guide <span>→</span>
        </a>
        <a href="/locations/forest">
          Forest &amp; Giant Piranha <span>→</span>
        </a>
        <a href="/locations/desert">
          Desert &amp; Pufferfish <span>→</span>
        </a>
        <a href="/locations/rocks">
          Rocks Island 4 Guide <span>→</span>
        </a>
        <a href="/locations/volcano">
          Volcano Island 5 Guide <span>→</span>
        </a>
        <a href="/guides/reel-of-fortune">
          Reel of Fortune &amp; Skins <span>→</span>
        </a>
      </section>
      <section className="home-faq" aria-labelledby="home-faq-heading">
        <div className="faq-heading">
          <p className="eyebrow">HOW TO FISH GAME FAQ</p>
          <h2 id="home-faq-heading">
            Answers before
            <br />
            <i>you cast.</i>
          </h2>
          <p>
            These answers cover the questions that most often send a new crew to
            the wrong page or leave a completed boss without the next marker.
          </p>
        </div>
        <div className="faq-list">
          {homeFaqs.map((faq, i) => (
            <article key={faq.question}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="tools-banner">
        <div>
          <p className="eyebrow">YOUR PROGRESS, ON THIS DEVICE</p>
          <h2>
            Build your own
            <br />
            <i>catch checklist.</i>
          </h2>
        </div>
        <a className="button light" href="/creatures">
          Track all 49 <b>→</b>
        </a>
      </section>
    </>
  );
}
function GuideCard({
  n,
  title,
  copy,
  href,
  accent,
}: {
  n: string;
  title: string;
  copy: string;
  href: string;
  accent: string;
}) {
  return (
    <a className={`guide-card ${accent}`} href={href}>
      <span>{n}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      <b>Open guide →</b>
    </a>
  );
}
function Beginner() {
  return (
    <article className="article guide-article">
      <Crumb>Beginner Guide</Crumb>
      <p className="eyebrow">COMPLETE BEGINNER ROUTE · LIGHTHOUSE → VOLCANO</p>
      <h1>
        How to Fish Game
        <br />
        <i>Beginner Guide</i>
      </h1>
      <p className="standfirst">
        Start with a stable food-and-cash loop, defeat Spider Crab without
        wasting the quest drop, then follow the five-location story route
        through Forest, Desert, Rocks, and Volcano. This is a walkthrough for
        Dazed Games’ 2026 game—not real-world fishing advice.
      </p>
      <Trust />
      <div className="quick-nav" aria-label="On this page">
        <b>ON THIS PAGE</b>
        <a href="#first-20">First 20 minutes</a>
        <a href="#bait">Bait &amp; hotspots</a>
        <a href="#profit-multipliers">Make more money</a>
        <a href="#spider-prep">Spider Crab</a>
        <a href="#five-islands">Five-island route</a>
        <a href="#upgrades">Weapons</a>
        <a href="#survival">Survival</a>
        <a href="#if-stuck">Troubleshooting</a>
      </div>
      <BeginnerCarousel />
      <section id="first-20">
        <h2>First 20 minutes: make the loop safe</h2>
        <p>
          The opening tutorial establishes the economy and the hand-in rhythm
          you will reuse. Finish the sailor’s onboarding tasks before treating
          Lighthouse as an open-ended collection zone. PC Gamer’s route
          specifically starts with feeding clams, buying the fishing rod, and
          returning to the sailor before buying the beer for this boss path.
        </p>
        <ol className="steps">
          <li>
            <b>Complete the tutorial prompts.</b>
            <span>
              Follow the sailor’s early objective sequence. It gives the context
              for the first fishing-rod purchase and ensures the beer exchange
              is available.
            </span>
          </li>
          <li>
            <b>Use ordinary catches to fund the next route step.</b>
            <span>
              PC Gamer recommends feeding the sailor clams or fish for more
              profitable meals before buying the beer. The purpose is one
              prepared attempt, not filling the creature log.
            </span>
          </li>
          <li>
            <b>Keep a recovery option.</b>
            <span>
              PC Gamer recommends eating seafood before the fight and holding a
              clam or two for recovery if you are having trouble.
            </span>
          </li>
          <li>
            <b>Return to the fisherman.</b>
            <span>
              His beer problem becomes the first boss trigger. This is the
              checkpoint that distinguishes the Lighthouse story route from
              normal fishing.
            </span>
          </li>
        </ol>
        <div className="checkpoint">
          <span>CHECKPOINT A</span>
          <b>
            You are ready to move on when the tutorial is complete, you have
            finished the sailor’s early fishing-rod route, and you have enough
            food or clams for the first boss attempt.
          </b>
        </div>
      </section>
      <section id="bait">
        <h2>Bait and hotspots: decide what you want before casting</h2>
        <p>
          Ordinary lure tiers expand the creature pool, while named items
          trigger specific encounters. Do not burn a quest lure on random water.
          Equip the correct item, cast where the route expects it, then keep the
          lure moving by reeling or walking backward. Dense, fast surface
          ripples are a better reason to investigate than an empty patch of sea.
        </p>
        <GuideVisual
          src="/images/guides/beginner/localized/03-bait-hotspots-en.svg"
          alt="English How to Fish infographic covering Hot Dog, Empty Beer Can, Leech, Carrot and moving lure hotspots"
          caption="Part 02 of the beginner route: match the special bait to the target, then work the lure instead of waiting motionless."
        />
        <div className="two-column">
          <div>
            <h3>Story-critical bait</h3>
            <ul>
              <li>
                <b>Empty Beer Can:</b> Spider Crab at Lighthouse.
              </li>
              <li>
                <b>Modified Leech:</b> Giant Piranha in Forest.
              </li>
              <li>
                <b>Carrot:</b> Pufferfish in Desert.
              </li>
              <li>
                <b>Professional Boss Lure + Tuna:</b> Albatross on Rocks.
              </li>
            </ul>
          </div>
          <div>
            <h3>Before you cast</h3>
            <ul>
              <li>Confirm the lure name in the equipped slot.</li>
              <li>Leave a clear landing area behind you.</li>
              <li>Put food and quest items in predictable inventory slots.</li>
              <li>Check that the current NPC request is active.</li>
            </ul>
          </div>
        </div>
      </section>
      <section id="profit-multipliers">
        <h2>Make more money from the catch you already landed</h2>
        <p>
          Progression purchases become easier when you improve value before
          selling. The video-derived reference set highlights two systems:
          airborne trick-shot multipliers and cooking. Treat both as optional
          value layers after the catch is safely subdued. A failed stunt near
          water or an overcooked catch can erase the gain.
        </p>
        <GuideVisual
          src="/images/guides/beginner/localized/04-profit-multipliers-en.svg"
          alt="English infographic explaining How to Fish trick-shot and grill sale multipliers"
          caption="Part 03: secure the catch first, add a controlled multiplier second, and sell only after the value step is complete."
        />
        <ol className="steps compact">
          <li>
            <b>Subdue the creature.</b>
            <span>
              Do not attempt a value stunt while it can still escape or attack.
            </span>
          </li>
          <li>
            <b>Create safe throwing space.</b>
            <span>
              Move away from deep water and other hazards before using an
              airborne shot.
            </span>
          </li>
          <li>
            <b>Watch the displayed multiplier.</b>
            <span>
              Stop chasing a higher bonus if the next attempt risks losing the
              entire catch.
            </span>
          </li>
          <li>
            <b>Cook with the meter, not a timer guess.</b>
            <span>
              Remove the catch near the value peak; burnt food can lose its sale
              value.
            </span>
          </li>
        </ol>
        <div className="callout">
          <b>Beginner priority:</b> consistent ordinary sales beat risky maximum
          multipliers. Use trick shots and grilling only after the basic
          catch-and-sell loop feels automatic.
        </div>
        <h3>Multi-kill chain bonus: a patch-sensitive combat value layer</h3>
        <p>
          A short recorded combat note shows a separate <strong>multi-kill
          chain</strong>: the next target must die within about three seconds
          of the previous kill. Its visible rows were ×1.05 for two kills,
          ×1.10 for three, and ×1.15 for four; the same note reports ×1.50 at
          ten or more. These are clip-reported values, not a promise that the
          current build has unchanged timing, intermediate rows, or cap.
        </p>
        <div className="multiplier-table" role="table" aria-label="Clip-reported multi-kill chain values"><div role="row"><b>Kills</b><b>Multiplier</b><b>Recorded condition</b></div><div role="row"><span>2</span><strong>×1.05</strong><span>Next kill within about 3 seconds</span></div><div role="row"><span>3</span><strong>×1.10</strong><span>Continue the same short window</span></div><div role="row"><span>4</span><strong>×1.15</strong><span>Continue the same short window</span></div><div role="row"><span>10+</span><strong>×1.50</strong><span>Reported cap; recheck after patches</span></div></div>
        <p>
          Set up low-risk ordinary targets on open ground, weaken them first,
          then finish them without a reload, long turn, or water crossing. Do
          not use bosses or protected quest creatures as a test group. This is
          not the same as the official <strong>Impressive</strong> achievement,
          whose condition is to get a 5x killscore multiplier on one creature.
          Treat the clip as a practical chain note and use the achievement page
          for the official completion condition.
        </p>
      </section>
      <section id="spider-prep">
        <h2>Prepare for Spider Crab before you cast</h2>
        <p>
          Spider Crab is the first named boss and the route off the starting
          island. The trigger is an <strong>Empty Beer Can</strong>. The current
          progression item is the <strong>Spider Crab Shell</strong>: pick it
          up, return it to the Lighthouse Keeper, and complete the hand-in for
          Boat Keys.
        </p>
        <div className="two-column">
          <div>
            <h3>Bring / arrange</h3>
            <ul>
              <li>Food or a saved catch for recovery.</li>
              <li>
                A melee weapon if you are playing solo; PC Gamer recommends a
                knife or brass knuckles after its author’s fist-only attempts
                failed.
              </li>
              <li>The Empty Beer Can equipped as the special lure.</li>
            </ul>
          </div>
          <div>
            <h3>The cited errand chain</h3>
            <ol>
              <li>Buy the full beer after the early tutorial route.</li>
              <li>Give it to the Lighthouse keeper.</li>
              <li>Use the Empty Beer Can he returns as bait.</li>
              <li>Reel in Spider Crab and begin the combat loop.</li>
            </ol>
          </div>
        </div>
        <div className="callout">
          <b>Safe hand-in rule:</b> pick up the Spider Crab Shell, return it to
          the Lighthouse Keeper, and complete the hand-in for Boat Keys before
          selling or cooking ordinary drops.
        </div>
      </section>
      <section>
        <h2>Fight with a repeatable rhythm</h2>
        <p>
          GamesRadar+ describes Spider Crab’s main attack as a straight charge.
          Move out of its path, then attack only when stars show the crab is
          stunned. As it recovers and starts to turn, move away and wait for the
          next charge. PC Gamer independently describes the post-attack dazed
          window and recommends patient, short attack attempts.
        </p>
        <div className="checkpoint">
          <span>CHECKPOINT B</span>
          <b>
            The fight is on track when you move away from the charge, attack
            during the visible dazed / stars window, and leave again as Spider
            Crab recovers.
          </b>
        </div>
      </section>
      <section id="after-crab">
        <h2>After Spider Crab: complete the hand-in before selling</h2>
        <p>
          Pick up the <strong>Spider Crab Shell</strong>, return it to the
          Lighthouse Keeper, and complete the hand-in for{" "}
          <strong>Boat Keys</strong>. The Radar is a separate purchase used to
          find the next colored marker.
        </p>
        <ol className="steps compact">
          <li>
            <b>Pick up the Spider Crab Shell.</b>
            <span>Keep it out of the sell, food, and cooking pile.</span>
          </li>
          <li>
            <b>Return it to the Lighthouse Keeper.</b>
            <span>
              Complete the Shell hand-in and confirm that Boat Keys are awarded.
            </span>
          </li>
          <li>
            <b>Buy the Radar.</b>
            <span>
              The Forest destination appears as a green marker; the Radar is
              what turns that marker into a usable route.
            </span>
          </li>
          <li>
            <b>Save at the milestone.</b>
            <span>
              Use the manual save option before the first voyage and keep
              recovery food separate from quest items.
            </span>
          </li>
        </ol>
        <a className="button primary" href="/bosses/spider-crab">
          Open the complete Spider Crab guide <b>→</b>
        </a>
      </section>
      <section id="five-islands">
        <h2>The complete five-location story route</h2>
        <p>
          The main route contains five accessible locations. Some guides call it
          “four islands” because Lighthouse is available by default and only
          four destinations need unlocking. For progression, use the clearer
          five-stop sequence below.
        </p>
        <GuideVisual
          src="/images/guides/beginner/localized/07-island-route-en.svg"
          alt="Five-island How to Fish route from Lighthouse through Forest, Desert and Rocks to Volcano"
          caption="Each new marker appears after a boss objective and NPC hand-in—not simply after reaching a cash or collection threshold."
        />
        <ol className="steps">
          <li>
            <b>Lighthouse — Spider Crab.</b>
            <span>
              Use the Empty Beer Can, defeat Spider Crab, return its Shell to
              the Lighthouse Keeper, then take the Boat Keys and follow the
              green Radar marker.
            </span>
          </li>
          <li>
            <b>Forest — Giant Piranha.</b>
            <span>
              Follow the current lake NPC Leech counter, verify the received
              special bait, defeat Giant Piranha, and return its Skeleton for
              the yellow Desert marker. A captured Patch 1.0.8 counter showed
              three Leeches, but the live objective is authoritative.
            </span>
          </li>
          <li>
            <b>Desert — Pufferfish.</b>
            <span>
              Complete the Tourist’s endangered-creature request for a Carrot.
              Use it to summon Pufferfish and return its Fin for the red Rocks
              marker.
            </span>
          </li>
          <li>
            <b>Rocks — Albatross.</b>
            <span>
              Catch Tuna with the Professional Boss Lure and place it on land.
              Defeat Albatross and return its Head to obtain the final
              coordinates.
            </span>
          </li>
          <li>
            <b>Volcano — whale finale.</b>
            <span>
              Catch five native creatures for the scientist, receive the Fish
              Bucket, catch Bowhead Whale, carry its body to the crater, defeat
              Mutated Bowhead Whale, then return the Whale Fin to the scientist
              for the military boat key.
            </span>
          </li>
        </ol>
        <GuideVisual
          src="/images/guides/beginner/localized/09-boss-clear-en.svg"
          alt="Five-location boss and quest-item checklist for How to Fish"
          caption="Think of every island as a dependency chain: special bait → boss → unique drop → NPC hand-in → next coordinates."
        />
      </section>
      <section id="upgrades">
        <h2>Upgrade priorities: buy the next solution, not everything</h2>
        <p>
          Early cash is scarce, so solve the immediate bottleneck. Start with
          the basic fishing route, keep a knife or other reliable close-range
          option for landed catches, then move into ranged weapons when bosses
          and flying targets demand distance.
        </p>
        <GuideVisual
          src="/images/guides/beginner/localized/05-weapon-ladder-en.svg"
          alt="Original English infographic showing the early How to Fish weapon ladder"
          caption="Part 04: move from fists to a dependable melee tool, then buy ranged damage when the encounter demands it."
        />
        <div className="two-column">
          <div>
            <h3>Buy first</h3>
            <ul>
              <li>A rod required by the tutorial.</li>
              <li>Food for one failed-attempt recovery.</li>
              <li>A reliable knife or ranged weapon for the current boss.</li>
              <li>Radar before leaving Lighthouse.</li>
            </ul>
          </div>
          <div>
            <h3>Delay until needed</h3>
            <ul>
              <li>Collection lures unrelated to the current quest.</li>
              <li>Expensive weapon attachments before owning the core gun.</li>
              <li>
                Boat speed upgrades when the current marker is already
                reachable.
              </li>
              <li>
                Cosmetic or completion purchases during story progression.
              </li>
            </ul>
          </div>
        </div>
        <h3>Late-game firepower and death risk</h3>
        <p>
          High-tier guns shorten Volcano encounters, but their price makes
          careless deaths expensive. Buy the core weapon before stacking
          attachments, store spare value before dangerous travel, and recover
          marked drops before starting another objective.
        </p>
        <GuideVisual
          src="/images/guides/beginner/localized/06-firepower-death-en.svg"
          alt="English How to Fish infographic covering sniper rifle, assault rifle, attachments, dynamite and death drops"
          caption="Part 05: protect the loadout you paid for. Late-game damage only helps when the weapon returns from the run with you."
        />
        <ol className="steps compact">
          <li>
            <b>Choose the core gun for the next boss.</b>
            <span>
              Long-range targets and Volcano fights reward stable ranged damage.
            </span>
          </li>
          <li>
            <b>Add control before luxury.</b>
            <span>
              Magazine and recoil improvements usually matter before cosmetic
              collection goals.
            </span>
          </li>
          <li>
            <b>Treat dynamite as a team hazard.</b>
            <span>Bad placement can down the user or nearby teammates.</span>
          </li>
          <li>
            <b>Recover death drops deliberately.</b>
            <span>
              Use the white marker, clear nearby danger, then pick up the
              expensive weapon first.
            </span>
          </li>
        </ol>
      </section>
      <section id="survival">
        <h2>Survival rules that prevent lost runs</h2>
        <p>
          Hunger, environmental damage, dropped equipment, and bad inventory
          handling cause more lost progress than ordinary catches. Enter every
          voyage with food, store high-value items before a dangerous boss, and
          keep one teammate in revival range during co-op fights.
        </p>
        <GuideVisual
          src="/images/guides/beginner/localized/08-coop-hazards-en.svg"
          alt="Original English infographic about co-op revives, backpack space and island hazards"
          caption="At night and around Volcano, route safety matters: keep recovery nearby and avoid carrying unnecessary value into the next unknown encounter."
        />
        <div className="callout">
          <b>Version note:</b> exact prices, damage numbers, key bindings, and
          attachment values can change. The route order and boss hand-in chain
          are more stable than individual economy numbers.
        </div>
      </section>
      <section id="if-stuck">
        <h2>If the route stalls, check the last completed hand-in</h2>
        <div className="troubleshoot">
          <article>
            <b>“I cannot summon the crab.”</b>
            <span>
              Confirm you gave full beer to the keeper and received the{" "}
              <strong>Empty Beer Can</strong>. Equip that returned can as the
              boss bait.
            </span>
          </article>
          <article>
            <b>“The crab keeps killing me.”</b>
            <span>
              Use the charge → sidestep → daze → short-attack cycle. Patch 1.0.9
              also adds Easy and Hard difficulty settings.
            </span>
          </article>
          <article>
            <b>“I beat it, but cannot leave.”</b>
            <span>
              Pick up the Spider Crab Shell, return it to the Lighthouse Keeper,
              complete the hand-in for Boat Keys, then buy the separate Radar.
            </span>
          </article>
          <article>
            <b>“The next marker never appeared.”</b>
            <span>
              A boss kill alone is not enough. Recover its unique drop, complete
              the NPC hand-in, and inspect the Radar again.
            </span>
          </article>
        </div>
      </section>
      <Related
        links={[
          ["Spider Crab: summon, combat, hand-in", "/bosses/spider-crab"],
          ["All five locations in order", "/locations"],
          ["Reel of Fortune & cosmetic skins", "/guides/reel-of-fortune"],
        ]}
      />
    </article>
  );
}
function LighthouseGuide() {
  return (
    <article className="article guide-article">
      <Crumb>
        <>
          <a href="/locations">Locations</a>
          <span>›</span>Lighthouse
        </>
      </Crumb>
      <p className="eyebrow">ISLAND 01 · STARTING LOCATION · VIDEO-VERIFIED</p>
      <h1>
        How to Fish Lighthouse
        <br />
        <i>First Island Guide</i>
      </h1>
      <p className="standfirst">
        Lighthouse teaches the entire game loop in miniature: manage hunger,
        turn Clams into cash, buy a rod, land and subdue catches, inspect their
        value, then use the Empty Beer Can to summon Spider Crab. Finish the
        keeper’s hand-in, take the Boat Keys, buy the Radar, and follow the
        green marker to Forest.
      </p>
      <div className="trust">
        <b>FOOTAGE REVIEWED AUG 28, 2026</b>
        <span>
          This walkthrough was rebuilt from the owner-provided 112-second HEVC
          gameplay video. Eleven clean frames were extracted at the exact steps
          shown below; platform chrome and Chinese editorial subtitles were
          removed.
        </span>
      </div>
      <div className="quick-nav" aria-label="On this page">
        <b>ON THIS PAGE</b>
        <a href="#hud">Stay alive</a>
        <a href="#cash">First cash</a>
        <a href="#rod">Fishing loop</a>
        <a href="#shop">Upgrades</a>
        <a href="#beer">Boss trigger</a>
        <a href="#fight">Spider Crab</a>
        <a href="#leave">Leave Lighthouse</a>
      </div>
      <section id="hud">
        <h2>1. Orient at the keeper before starting the survival loop</h2>
        <p>
          The two icons at the lower-left are your immediate constraints:{" "}
          <strong>health</strong> and <strong>hunger</strong>. Lighthouse is
          safe enough to learn on, but standing around while reading menus still
          drains the run. Use edible creatures or Clams when hunger falls; do
          not carry every low-value item indefinitely while the bar empties.
        </p>
        <VideoFrame
          src="/images/guides/island-1/01-hud.jpg"
          step="01"
          title="ORIENT AT THE LIGHTHOUSE KEEPER"
          caption="The keeper and nearby shoreline are your starting reference point. Check your health and hunger indicators in the game interface before leaving this safe area."
        />
        <div className="checkpoint">
          <span>FIRST RULE</span>
          <b>
            Keep one edible item outside the sell pile. A prepared recovery item
            is worth more than the tiny cash gain from selling absolutely
            everything.
          </b>
        </div>
      </section>
      <section id="cash">
        <h2>2. Build the Clam-to-cash loop</h2>
        <p>
          Clams are scattered around the Lighthouse shore. Pick them up, face
          the keeper, and throw the requested amount to him. The footage shows
          the early hand-in as the dependable way to produce enough money for
          the first fishing purchase. This is faster and safer than trying to
          fight a valuable catch with no tools.
        </p>
        <VideoFrame
          src="/images/guides/island-1/02-clams.jpg"
          step="02"
          title="FEED CLAMS TO THE KEEPER"
          caption="Collect shore Clams and complete the keeper’s early hand-in. The objective is seed money, not a long farming session."
        />
        <ol className="steps compact">
          <li>
            <b>Walk the shoreline.</b>
            <span>
              Pick up the visible Clams around the starting slope and dock.
            </span>
          </li>
          <li>
            <b>Return to the keeper.</b>
            <span>
              Stand close enough that the thrown item reaches him instead of
              rolling toward the water.
            </span>
          </li>
          <li>
            <b>Throw the requested quantity.</b>
            <span>
              The supplied footage shows a three-Clam hand-in before the first
              rod purchase.
            </span>
          </li>
          <li>
            <b>Stop when the next purchase is funded.</b>
            <span>
              Extra cash is useful, but the rod unlocks the repeatable economy.
            </span>
          </li>
        </ol>
      </section>
      <section id="rod">
        <h2>3. Buy the first rod, then use the complete catch loop</h2>
        <p>
          Open the Lighthouse shop and buy the basic fishing rod shown by the
          tutorial. Move to the dock or a clear shoreline. The video
          demonstrates the full sequence: equip the rod, cast into open water,
          wait for a bite, reel the creature onto land, put the rod away, and
          attack the catch before it escapes back into the sea.
        </p>
        <VideoFrame
          src="/images/guides/island-1/03-first-rod.jpg"
          step="03"
          title="BUY AND EQUIP THE FIRST ROD"
          caption="The rod turns the one-time Clam tutorial into a repeatable catch-and-sell route."
        />
        <VideoFrame
          src="/images/guides/island-1/04-catch-loop.jpg"
          step="04"
          title="CAST, REEL, DROP, THEN ATTACK"
          caption="Use open shoreline so a landed creature cannot immediately slide back into deep water. Put the rod away before switching to damage."
        />
        <p>
          The supplied video shows <strong>right-click to cast</strong>,{" "}
          <strong>hold left-click to reel after the bite</strong>,{" "}
          <strong>right-click to place the catch</strong>, and{" "}
          <strong>X to stow the rod</strong>. Treat these as the demonstrated
          keyboard controls; re-check bindings if you changed the control
          preset.
        </p>
        <VideoFrame
          src="/images/guides/island-1/05-inspect-value.jpg"
          step="05"
          title="INSPECT WEIGHT AND VALUE"
          caption="After subduing the catch, inspect its weight and sale value before deciding whether to eat, sell, or retain it."
        />
      </section>
      <section id="shop">
        <h2>4. Upgrade for the next problem, not for the display wall</h2>
        <p>
          The Lighthouse shop carries early melee choices and bait. The footage
          highlights Brass Knuckles, a Knife, and Hot Dogs. A stronger tool
          shortens the dangerous period between landing a creature and fully
          subduing it, but buying every item delays the boss route.
        </p>
        <VideoFrame
          src="/images/guides/island-1/06-shop-upgrades.jpg"
          step="06"
          title="COMPARE EARLY SHOP UPGRADES"
          caption="Use the shop wall to solve the current bottleneck. A reliable melee weapon is more useful than several unused lure types."
        />
        <div className="two-column">
          <div>
            <h3>Practical priority</h3>
            <ol>
              <li>Required tutorial rod</li>
              <li>One recovery food item</li>
              <li>Knife or another dependable damage upgrade</li>
              <li>Beer for the boss-trigger exchange</li>
              <li>Radar after Boat Keys</li>
            </ol>
          </div>
          <div>
            <h3>Delay at first</h3>
            <ul>
              <li>Duplicate weapons</li>
              <li>Large stocks of ordinary bait</li>
              <li>Collection cleanup</li>
              <li>Optional upgrades unrelated to Spider Crab</li>
            </ul>
          </div>
        </div>
      </section>
      <section id="beer">
        <h2>5. Turn the full beer into the Empty Beer Can</h2>
        <p>
          The first boss is not summoned by a normal lure. Buy the beer, give it
          to the Lighthouse keeper, and keep the <strong>Empty Beer Can</strong>{" "}
          returned by the exchange. Equip that empty can in the lure slot, move
          to a clear fishing position, and cast it into the water.
        </p>
        <VideoFrame
          src="/images/guides/island-1/07-empty-beer-can.jpg"
          step="07"
          title="COMPLETE THE KEEPER EXCHANGE"
          caption="Return to the keeper after buying the full beer. Keep the returned Empty Beer Can visible in your inventory, then equip it before casting."
        />
        <div className="callout">
          <b>Do not confuse the items:</b> the full drink advances the keeper
          interaction; the returned Empty Beer Can is the special boss lure.
        </div>
      </section>
      <section id="fight">
        <h2>6. Beat Spider Crab with a charge-and-punish rhythm</h2>
        <p>
          Once the boss bites, reel it onto the Lighthouse shore. Spider Crab
          has a large health bar and can punish players who stand directly in
          front of it. Create a clear lane, face the boss from medium distance,
          then move sideways when it commits to a charge. Attack during the
          recovery or visible dazed window and back away before it turns again.
        </p>
        <VideoFrame
          src="/images/guides/island-1/08-spider-crab.jpg"
          step="08"
          title="REEL IN SPIDER CRAB"
          caption="Spider Crab is now clearly visible beside the Lighthouse. Pull it onto the open slope and leave side room for the incoming charge."
        />
        <VideoFrame
          src="/images/guides/island-1/09-dodge-charge.jpg"
          step="09"
          title="SIDESTEP, THEN COUNTERATTACK"
          caption="Do not trade damage head-on. Bait the straight approach, move off the line, land a short punish, and reset."
        />
        <ol className="steps">
          <li>
            <b>Pull the boss onto open ground.</b>
            <span>
              Leave enough side room to avoid the charge without falling into
              the water.
            </span>
          </li>
          <li>
            <b>Hold medium distance.</b>
            <span>
              This makes the forward attack readable and discourages chaotic
              point-blank trading.
            </span>
          </li>
          <li>
            <b>Sidestep the committed charge.</b>
            <span>Move across its path rather than backing straight away.</span>
          </li>
          <li>
            <b>Take a short damage window.</b>
            <span>
              Strike during the daze or recovery, then disengage before the crab
              fully turns.
            </span>
          </li>
          <li>
            <b>Repeat patiently.</b>
            <span>
              Watch the boss timer and health; greed is the main cause of failed
              early attempts.
            </span>
          </li>
        </ol>
      </section>
      <section id="leave">
        <h2>7. Complete the hand-in, buy the Radar, and sail to Forest</h2>
        <p>
          Pick up the <strong>Spider Crab Shell</strong>, return it to the
          Lighthouse Keeper, and complete the hand-in for{" "}
          <strong>Boat Keys</strong>. Keep the Shell out of the food, cooking,
          and sell pile. The video then shows the Radar route toward the
          tree-covered next island.
        </p>
        <VideoFrame
          src="/images/guides/island-1/10-boss-handoff.jpg"
          step="10"
          title="RETURN THE SPIDER CRAB SHELL"
          caption="Carry the Spider Crab Shell directly to the Lighthouse Keeper and complete the hand-in for Boat Keys."
        />
        <VideoFrame
          src="/images/guides/island-1/11-radar-route.jpg"
          step="11"
          title="FOLLOW THE GREEN FOREST MARKER"
          caption="Buy the Radar separately, board the boat, and steer toward the next marker. The tree-covered Forest island is your second main location."
        />
        <div className="checkpoint">
          <span>LIGHTHOUSE COMPLETE</span>
          <b>
            You have Boat Keys, a Radar, a working food-and-cash loop, and the
            green Forest marker. Save before the voyage.
          </b>
        </div>
      </section>
      <section id="mistakes">
        <h2>Common first-island mistakes</h2>
        <div className="troubleshoot">
          <article>
            <b>The catch escapes</b>
            <span>
              Land it farther from the water, stow the rod immediately, and
              attack before inspecting value.
            </span>
          </article>
          <article>
            <b>Spider Crab never appears</b>
            <span>
              Complete the beer exchange and equip the returned Empty Beer
              Can—not a regular lure.
            </span>
          </article>
          <article>
            <b>The boss wins every trade</b>
            <span>
              Stop standing in front of it. Use medium distance, sidestep the
              charge, and attack only during recovery.
            </span>
          </article>
          <article>
            <b>No next-island marker</b>
            <span>
              Finish the boss-drop hand-in, confirm Boat Keys, then purchase and
              equip the separate Radar.
            </span>
          </article>
        </div>
      </section>
      <Related
        links={[
          ["Forest location 2 walkthrough", "/locations/forest"],
          ["Full beginner route to Volcano", "/beginner-guide"],
          ["Spider Crab combat guide", "/bosses/spider-crab"],
          ["All five locations", "/locations"],
          ["Creature checklist", "/creatures"],
          ["Lures and special bait", "/lures"],
        ]}
      />
    </article>
  );
}
const creatureGallerySlides = [
  {
    src: "/images/creatures/encyclopedia-early.webp",
    label: "FIELD CAPTURE 01",
    title: "Lighthouse and early catches",
    caption:
      "Brown Crab through Pike, with the opening base-value references visible in the owner-provided game capture.",
  },
  {
    src: "/images/creatures/encyclopedia-standard.webp",
    label: "FIELD CAPTURE 02",
    title: "Beginner and Standard pools",
    caption: "The next entries cover Forest and Desert progression.",
  },
  {
    src: "/images/creatures/encyclopedia-professional.webp",
    label: "FIELD CAPTURE 03",
    title: "Standard and Professional pools",
    caption:
      "Desert entries transition into the larger Professional Lure pool at Rocks.",
  },
  {
    src: "/images/creatures/encyclopedia-scientific.webp",
    label: "FIELD CAPTURE 04",
    title: "Professional and Scientific catches",
    caption: "Late regular catches lead into the first two boss-lure entries.",
  },
  {
    src: "/images/creatures/encyclopedia-bosses.webp",
    label: "FIELD CAPTURE 05",
    title: "Bosses and story creatures",
    caption:
      "Revealed models and captured silhouettes complete the illustrated set.",
  },
];
const creatureSheets = {
  early: {
    src: "/images/creatures/encyclopedia-early.webp",
    width: 1394,
    scale: 0.36,
  },
  standard: {
    src: "/images/creatures/encyclopedia-standard.webp",
    width: 1363,
    scale: 0.36,
  },
  professional: {
    src: "/images/creatures/encyclopedia-professional.webp",
    width: 1348,
    scale: 0.36,
  },
  scientific: {
    src: "/images/creatures/encyclopedia-scientific.webp",
    width: 1521,
    scale: 0.34,
  },
  bosses: {
    src: "/images/creatures/encyclopedia-bosses.webp",
    width: 1462,
    scale: 0.34,
  },
} as const;
type CreatureSheet = keyof typeof creatureSheets;
const creatureCropMap: Record<string, [CreatureSheet, number, number]> = {
  "Brown Crab": ["early", 265, 235],
  Piranha: ["early", 500, 235],
  Gar: ["early", 715, 235],
  Shrimp: ["early", 930, 235],
  Mackerel: ["early", 1135, 235],
  "Rock Crab": ["early", 265, 450],
  Lobster: ["early", 500, 450],
  Cod: ["early", 715, 450],
  Goby: ["early", 930, 450],
  Pike: ["early", 1135, 450],
  Salmon: ["standard", 245, 235],
  Perch: ["standard", 470, 235],
  Triggerfish: ["standard", 680, 235],
  Goldfish: ["standard", 895, 235],
  Catfish: ["standard", 1110, 235],
  Clownfish: ["standard", 245, 450],
  "Sea Urchin": ["standard", 470, 450],
  "Yellow Boxfish": ["standard", 680, 450],
  Needlefish: ["standard", 895, 450],
  Angelfish: ["standard", 1110, 450],
  Bluegill: ["professional", 245, 235],
  Seahorse: ["professional", 470, 235],
  Bowlfish: ["professional", 680, 235],
  Bass: ["professional", 895, 235],
  Eel: ["professional", 1110, 235],
  "Red Snapper": ["professional", 245, 450],
  Sengarat: ["professional", 470, 450],
  Halibut: ["professional", 680, 450],
  Tigerfish: ["professional", 895, 450],
  "Flying Fish": ["professional", 1110, 450],
  Voxelfish: ["scientific", 350, 250],
  Parrotfish: ["scientific", 570, 250],
  Dripper: ["scientific", 790, 250],
  Blobfish: ["scientific", 1040, 250],
  Oarfish: ["scientific", 1260, 250],
  Anglerfish: ["scientific", 350, 490],
  Stonefish: ["scientific", 570, 490],
  "Superdwarf Fish": ["scientific", 790, 490],
  Sunfish: ["scientific", 1040, 490],
  "The Old Pike": ["scientific", 1260, 490],
  "Blue Shark": ["bosses", 205, 230],
  Tuna: ["bosses", 465, 230],
  "Goblin Shark": ["bosses", 715, 230],
  "Bowhead Whale": ["bosses", 950, 230],
  "Spider Crab": ["bosses", 1200, 230],
  "Giant Piranha": ["bosses", 205, 470],
  Pufferfish: ["bosses", 465, 470],
  Albatross: ["bosses", 715, 470],
  "Mutated Bowhead Whale": ["bosses", 950, 470],
};
function CreatureGallery() {
  const [active, setActive] = useState(0);
  const move = (delta: number) =>
    setActive(
      (index) =>
        (index + delta + creatureGallerySlides.length) %
        creatureGallerySlides.length,
    );
  const slide = creatureGallerySlides[active];
  return (
    <section
      className="creature-gallery"
      aria-label="In-game creature encyclopedia screenshots"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
    >
      <figure>
        <img
          src={slide.src}
          alt={slide.title}
          width="1521"
          height="876"
          loading="lazy"
          decoding="async"
        />
        <figcaption>
          <span>{slide.label}</span>
          <b>{slide.title}</b>
          <small>{slide.caption}</small>
        </figcaption>
      </figure>
      <div className="creature-gallery-controls">
        <button
          onClick={() => move(-1)}
          aria-label="Previous encyclopedia image"
        >
          ←
        </button>
        <div>
          {creatureGallerySlides.map((item, index) => (
            <button
              key={item.src}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
              aria-label={`Show ${item.title}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
        <b>
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(creatureGallerySlides.length).padStart(2, "0")}
        </b>
        <button onClick={() => move(1)} aria-label="Next encyclopedia image">
          →
        </button>
      </div>
    </section>
  );
}
function CreatureThumb({ name }: { name: string }) {
  const crop = creatureCropMap[name];
  if (!crop)
    return (
      <span className="creature-thumb missing">
        Image
        <br />
        pending
      </span>
    );
  const [sheetName, x, y] = crop;
  const sheet = creatureSheets[sheetName];
  const frameWidth = 94,
    frameHeight = 72,
    scale = sheet.scale * (frameWidth / 86);
  const locked = name === "Goblin Shark" || name === "Mutated Bowhead Whale";
  return (
    <span
      className={`creature-thumb ${locked ? "locked" : ""}`}
      title={
        locked
          ? "Captured locked silhouette from the in-game encyclopedia"
          : `${name} in-game encyclopedia model`
      }
    >
      <img
        src={sheet.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        style={{
          width: `${sheet.width * scale}px`,
          left: `${frameWidth / 2 - x * scale}px`,
          top: `${frameHeight / 2 - y * scale}px`,
        }}
      />
    </span>
  );
}
function Creatures() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [island, setIsland] = useState("All locations");
  const [caught, setCaught] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("htf-caught") || "[]");
      const names = new Set(creatures.map((c) => c.name));
      if (Array.isArray(raw))
        setCaught([
          ...new Set(
            raw.filter(
              (item): item is string =>
                typeof item === "string" && names.has(item),
            ),
          ),
        ]);
    } catch {
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem("htf-caught", JSON.stringify(caught));
  }, [caught, hydrated]);
  const visible = useMemo(
    () =>
      creatures.filter(
        (c) =>
          (filter === "All" || c.kind === filter) &&
          (island === "All locations" || c.island === island) &&
          c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, filter, island],
  );
  const toggle = (name: string) =>
    setCaught((current) =>
      current.includes(name)
        ? current.filter((value) => value !== name)
        : [...current, name],
    );
  return (
    <section className="hub creature-page">
      <Crumb>Creature Encyclopedia</Crumb>
      <p className="eyebrow">ILLUSTRATED COLLECTION TOOL</p>
      <h1>
        All 49 How to Fish
        <br />
        <i>Game Creatures</i>
      </h1>
      <p className="standfirst">
        Every regular catch, miniboss, and story creature in one illustrated,
        searchable log—with its progression location, lure or summon, and
        reported base value.
      </p>
      <CreatureGallery />
      <section className="creature-intro">
        <div>
          <span>49</span>
          <b>normal entries</b>
          <p>
            The in-game Tab encyclopedia tracks the ordinary set shown here.
          </p>
        </div>
        <div>
          <span>49</span>
          <b>Drip variants</b>
          <p>
            Rare Drip versions use the same lure or trigger and are tracked
            separately.
          </p>
        </div>
        <div>
          <span>5</span>
          <b>route locations</b>
          <p>Lighthouse → Forest → Desert → Rocks → Volcano.</p>
        </div>
      </section>
      <div className="creature-note">
        <b>VALUE NOTE</b>
        <span>
          Base values are identification references, not guaranteed sale prices.
          Weight, Killscore, cooking, Drip state, and later balance patches can
          change the final amount.
        </span>
      </div>
      <div className="progress">
        <span>
          <b>{caught.length}</b> / 49 logged
        </span>
        <div>
          <i style={{ width: `${(caught.length / 49) * 100}%` }} />
        </div>
      </div>
      <div className="filters creature-filters">
        <label>
          <span className="sr-only">Search creatures</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search creature name…"
          />
        </label>
        <div>
          {["All", "Creature", "Boss / Special"].map((value) => (
            <button
              type="button"
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Filter by location</span>
          <select
            value={island}
            onChange={(event) => setIsland(event.target.value)}
          >
            {[
              "All locations",
              "Lighthouse",
              "Forest",
              "Desert",
              "Rocks",
              "Volcano",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="creature-results">
        Showing <b>{visible.length}</b> of 49 entries
      </p>
      <div className="creature-grid illustrated">
        {visible.map((creature) => (
          <label
            className={`creature illustrated-card ${caught.includes(creature.name) ? "caught" : ""}`}
            key={creature.name}
          >
            <input
              type="checkbox"
              checked={caught.includes(creature.name)}
              onChange={() => toggle(creature.name)}
            />
            <CreatureThumb name={creature.name} />
            <span className="creature-card-copy">
              <span className="creature-card-top">
                <span className="check">✓</span>
                <span className="number">
                  {String(creatures.indexOf(creature) + 1).padStart(2, "0")}
                </span>
                <small>{creature.kind}</small>
              </span>
              <b>{creature.name}</b>
              <span className="creature-meta">
                <span>
                  <i>LOCATION</i>
                  {creature.island}
                </span>
                <span>
                  <i>VALUE</i>${creature.value.toLocaleString()}
                </span>
              </span>
              <span className="creature-lure">
                <i>ROD / LURE / SUMMON</i>
                {creature.lure}
              </span>
            </span>
          </label>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="creature-empty">No creature matches these filters.</p>
      )}
      <section className="hub-note creature-method">
        <h2>How to finish the encyclopedia</h2>
        <ol>
          <li>
            Open <b>Tab</b> in game and identify the exact blank slot.
          </li>
          <li>
            Filter this page by the route location, then equip the listed rod,
            lure, or unique summon.
          </li>
          <li>
            Land and defeat the creature so the normal encyclopedia entry
            registers.
          </li>
          <li>
            Repeat the same trigger for the rare Drip variant; it belongs to the
            separate 49-entry Drip set.
          </li>
          <li>
            Do not sell or cook a unique boss catch until the next quest
            objective is complete.
          </li>
        </ol>
        <p>
          Creature count and lure pools were checked against{" "}
          <a
            href="https://mobalytics.gg/gamebase/guides/how-to-fish-all-fish-creatures-lures"
            target="_blank"
            rel="noreferrer"
          >
            Mobalytics’ current 49-creature guide ↗
          </a>
          . Game scope, co-op support, and collection premise are also described
          on the{" "}
          <a
            href="https://store.steampowered.com/app/4001890/How_to_Fish/"
            target="_blank"
            rel="noreferrer"
          >
            official Steam page ↗
          </a>
          . The encyclopedia images on this page are owner-provided gameplay
          captures.
        </p>
      </section>
    </section>
  );
}
function BossProgression() {
  return (
    <section className="hub-note boss-progression">
      <h2>The verified story-boss chain</h2>
      <p>
        These encounters unlock the five-location route. Finish the NPC exchange
        after each fight; a defeated boss alone does not guarantee the next
        destination.
      </p>
      <ol className="steps compact">
        <li>
          <b>Forest — Giant Piranha.</b>
          <span>
            Follow the current lake NPC Leech counter, verify the received
            special bait, defeat Giant Piranha, and return its Skeleton for the
            yellow Desert marker. The three-Leech count is a Patch 1.0.8 lead,
            not a cross-version guarantee.
          </span>
        </li>
        <li>
          <b>Desert — Pufferfish.</b>
          <span>
            Complete the Tourist’s endangered-creature request, use the Carrot
            reward, and return the Pufferfish Fin for the red Rocks marker.
          </span>
        </li>
        <li>
          <b>Rocks — Albatross.</b>
          <span>
            Catch Tuna with the Professional Boss Lure, place it on land, defeat
            Albatross, and return its Head for the final coordinates.
          </span>
        </li>
        <li>
          <b>Volcano — whale finale.</b>
          <span>
            Catch five native creatures for the scientist, receive the Fish
            Bucket, catch Bowhead Whale, carry its body to the crater, defeat
            Mutated Bowhead Whale, and return the Whale Fin to the scientist for
            the military boat key.
          </span>
        </li>
      </ol>
      <p>
        Open the <a href="/locations">five-location route guide</a> for
        readiness checks at every stop, then use the{" "}
        <a href="/locations/volcano">
          full Volcano and Mutated Bowhead Whale walkthrough
        </a>{" "}
        for the final combat loop. The sequence is cross-checked against{" "}
        <a
          href="https://www.destructoid.com/complete-how-to-fish-game-walkthrough-100-completion/"
          target="_blank"
          rel="noreferrer"
        >
          Destructoid’s complete walkthrough ↗
        </a>{" "}
        and{" "}
        <a
          href="https://mobalytics.gg/gamebase/guides/how-to-fish-unlock-every-island"
          target="_blank"
          rel="noreferrer"
        >
          Mobalytics’ island guide ↗
        </a>
        .
      </p>
    </section>
  );
}
function Bosses() {
  return (
    <section className="hub">
      <Crumb>Boss Guides</Crumb>
      <p className="eyebrow">SPECIAL ENCOUNTERS</p>
      <h1>
        All How to Fish Game
        <br />
        <i>Bosses</i>
      </h1>
      <p className="standfirst">
        Every special encounter now includes the summon, a practical fight plan,
        the result you must protect, and a recovery step if the attempt fails or
        a quest item is lost.
      </p>
      <section className="hub-note">
        <h2>How to use this boss board</h2>
        <p>
          Separate ordinary fishing from progression attempts. Named summons are
          route-specific, so equip one only when you are ready to finish the
          encounter. Before casting, bank anything you cannot afford to lose,
          carry food, and leave open ground for the fight. After the kill,
          inspect every unique drop before selling or eating anything.
        </p>
        <p>
          The first fully illustrated route is{" "}
          <a href="/bosses/spider-crab">Spider Crab at Lighthouse</a>. It covers
          the Empty Beer Can trigger, the charge-and-stun combat loop, the shell
          hand-in, Boat Keys, and the Radar step. The final illustrated route is
          the <a href="/locations/volcano">Volcano whale finale</a>, including
          Bowhead carry, Mutated Bowhead, and the Whale Fin hand-in.
        </p>
      </section>
      <div className="boss-grid">
        {bosses.map((b, i) => (
          <article className="boss" key={b.name}>
            <span>0{i + 1}</span>
            <h2>{b.name}</h2>
            <p>{b.note}</p>
            <dl>
              <div>
                <dt>Summon</dt>
                <dd>{b.summon}</dd>
              </div>
              <div>
                <dt>Route</dt>
                <dd>{b.route}</dd>
              </div>
            </dl>
            <div className="boss-actions">
              <h3>Fight plan</h3>
              <p>{b.fight}</p>
              <h3>Reward / next step</h3>
              <p>{b.reward}</p>
              <h3>If it goes wrong</h3>
              <p>{b.recovery}</p>
            </div>
            {b.name === "Spider Crab" && (
              <a href="/bosses/spider-crab">Read full guide →</a>
            )}
            {b.name === "Giant Piranha" && (
              <a href="/locations/forest">Read Forest &amp; Giant Piranha guide →</a>
            )}
            {b.name === "Pufferfish" && (
              <a href="/locations/desert">Read Desert &amp; Pufferfish guide →</a>
            )}
            {b.name === "Albatross" && (
              <a href="/locations/rocks">Read Rocks &amp; Albatross guide →</a>
            )}
            {(b.name === "Bowhead Whale" ||
              b.name === "Mutated Bowhead Whale") && (
              <a href="/locations/volcano">Read Volcano whale guide →</a>
            )}
          </article>
        ))}
      </div>
      <BossProgression />
      <section className="hub-note" id="boss-run">
        <h2>Weapon planning and a normal-game five-stop boss run</h2>
        <p>
          Build the loadout around the next encounter rather than an unverified
          price table. Early ordinary catches call for a controllable close-range
          tool; Forest, Desert, Rocks, and Volcano reward dependable ranged
          damage, ammunition, recovery food, and an open inventory slot for the
          unique drop. Buy the core solution first, then add handling or magazine
          improvements only when they help the next fight. This guide deliberately
          does not publish patch-sensitive damage, attachment, or shop-price
          numbers that the current evidence cannot verify.
        </p>
        <ol>
          <li><b>Lighthouse:</b> prepare the Empty Beer Can, dodge Spider Crab’s charge, protect the Shell, and complete the Boat Keys hand-in.</li>
          <li><b>Forest:</b> verify the current Leech objective and special bait, keep moving during Giant Piranha, then secure the Skeleton hand-in.</li>
          <li><b>Desert:</b> use the Carrot route for Pufferfish, reset away from gas, and retain the Fin for the next marker.</li>
          <li><b>Rocks:</b> prepare the Tuna for Albatross, fight near hard cover, and return the Head for Volcano coordinates.</li>
          <li><b>Volcano:</b> finish the Scientist chain, protect the Bowhead body for the crater, and hand the Whale Fin back only after the mutated stage is complete.</li>
        </ol>
        <p>
          This is a normal-game preparation checklist, not a mod challenge or a
          speedrun rule set. If you time a personal route, decide whether the
          clock ends at the final boss defeat or the final NPC hand-in before
          starting, and record co-op help or reloads so later attempts remain
          comparable.
        </p>
      </section>
      <section className="hub-note">
        <h2>Progression safety checklist</h2>
        <ol>
          <li>Confirm the summon item and location before casting.</li>
          <li>Heal, save, and clear a safe combat lane.</li>
          <li>Watch one attack cycle before committing damage.</li>
          <li>Collect unique drops and complete the NPC hand-in.</li>
          <li>Confirm the next key, coordinate, or marker before leaving.</li>
        </ol>
        <p>
          Patch changes can alter health, damage, and save behavior. Detailed
          guides show a checked date and source boundary so you can distinguish
          verified instructions from a simple entity list.
        </p>
      </section>
    </section>
  );
}
function Locations() {
  return <LocationsGuide />;
}
function Lures() {
  const pools = [
    {
      name: "Beginner Lure",
      location: "Forest",
      targets: creatures
        .filter((c) => c.tier === "Beginner")
        .map((c) => c.name),
      use: "Build the Forest collection and cash pool after the early Free Lure catches. It does not replace the Modified Leech needed for Giant Piranha.",
    },
    {
      name: "Standard Lure",
      location: "Desert",
      targets: creatures
        .filter((c) => c.tier === "Standard")
        .map((c) => c.name),
      use: "Use this for the regular Desert set. Pufferfish remains a separate Carrot-triggered story encounter.",
    },
    {
      name: "Professional Lure",
      location: "Rocks",
      targets: creatures
        .filter((c) => c.tier === "Professional")
        .map((c) => c.name),
      use: "Use this for the Rocks collection. The Professional Boss Lure is a different item used to catch the Tuna required for Albatross.",
    },
    {
      name: "Scientific Lure",
      location: "Volcano",
      targets: creatures
        .filter((c) => c.tier === "Scientific")
        .map((c) => c.name),
      use: "Use this for the final ordinary collection pool. Scientific Boss Lure targets Goblin Shark; the whale finale uses a Fish Bucket instead.",
    },
  ];
  return (
    <section className="hub">
      <Crumb>Lures &amp; Bait</Crumb>
      <p className="eyebrow">COLLECTION SYSTEM</p>
      <h1>
        How to Fish Game
        <br />
        <i>Lures &amp; Bait</i>
      </h1>
      <p className="standfirst">
        Match each regular lure tier to its confirmed pool, then keep named
        quest bait separate. This field guide lists the target creatures,
        location, story exceptions, and safe casting routine.
      </p>
      <Trust />
      <figure className="field-capture">
        <img
          src="/images/creatures/encyclopedia-scientific.webp"
          alt="Owner-provided How to Fish encyclopedia capture showing late lure pools"
          width="1521"
          height="876"
          loading="eager"
          fetchPriority="high"
        />
        <figcaption>
          <span>OWNER-PROVIDED GAME CAPTURE</span>Use the Tab encyclopedia to
          identify a blank slot, then return here for its lure and route
          location.
        </figcaption>
      </figure>
      <section className="hub-note">
        <h2>Regular pools and special summons are different</h2>
        <p>
          Use the four regular lure tiers to expand the ordinary collection pool
          as your route advances. Named boss items are not generic upgrades:
          they target a specific encounter and can be wasted if you cast before
          preparing. Check the equipped item, destination, health, food, and
          inventory space before a special attempt.
        </p>
        <p>
          The assignments below come from the site’s 49-creature research table
          and are shown as practical pools, not as a promise that every shop
          price or item location will survive the next patch. Use the searchable{" "}
          <a href="/creatures">49-creature checklist</a> to inspect individual
          reported values.
        </p>
      </section>
      <div className="lure-layout">
        <div>
          {pools.map((pool, i) => (
            <article className="lure" key={pool.name}>
              <span>POOL 0{i + 1}</span>
              <h2>{pool.name}</h2>
              <p>
                <b>Route location:</b> {pool.location}
              </p>
              <p>{pool.use}</p>
              <h3>Confirmed targets</h3>
              <ul>
                {pool.targets.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <a href="/creatures">Browse creature log →</a>
            </article>
          ))}
        </div>
        <aside>
          <p className="eyebrow">SPECIAL SUMMONS</p>
          <h2>Boss items</h2>
          {bosses.map((b) => (
            <p key={b.name}>
              <b>{b.summon}</b>
              <span>{b.name}</span>
            </p>
          ))}
          <a href="/bosses">All 11 summons →</a>
        </aside>
      </div>
      <p className="fineprint">
        Base values, prices, damage, and shop placement are patch-sensitive.
        This page therefore prioritizes stable target-to-lure relationships and
        visible quest dependencies over unverified price claims.
      </p>
      <section className="hub-note">
        <h2>Named bait and story dependencies</h2>
        <div className="special-bait-table">
          {bosses.slice(6).map((b) => (
            <article key={b.name}>
              <b>{b.summon}</b>
              <span>{b.name}</span>
              <p>{b.reward}</p>
            </article>
          ))}
        </div>
        <p>
          A named item is not an upgraded regular lure. Empty Beer Can, Modified
          Leech, Carrot, defeated Tuna, Fish Bucket, and the Bowhead body each
          advance a specific route. Do not sell, cook, or eat them until the
          next NPC or encounter confirms the objective.
        </p>
      </section>
      <section className="hub-note">
        <h2>Safe casting routine</h2>
        <ol>
          <li>Choose the target before selecting a lure.</li>
          <li>
            Verify whether the item is a reusable pool lure or a named special
            summon.
          </li>
          <li>Move to the route location and clear a landing area.</li>
          <li>Equip food and the weapon needed for the catch.</li>
          <li>
            Cast, keep the lure moving, and secure the catch away from water.
          </li>
        </ol>
        <p>
          For the first verified special item chain, see{" "}
          <a href="/bosses/spider-crab">Empty Beer Can → Spider Crab</a>. The
          guide shows what happens before the cast, during the stun window, and
          after the shell drops.
        </p>
      </section>
    </section>
  );
}
function SpiderCrab() {
  return (
    <article className="article guide-article">
      <Crumb>
        <>
          <a href="/bosses">Boss Guides</a>
          <span>›</span>Spider Crab
        </>
      </Crumb>
      <p className="eyebrow">BOSS 01 · LIGHTHOUSE</p>
      <h1>
        How to Beat Spider Crab
        <br />
        <i>in How to Fish Game</i>
      </h1>
      <p className="standfirst">
        Spider Crab is the first Lighthouse boss. Summon it with the Empty Beer
        Can, fight the charge rather than the claws, then hand the shell to the
        fisherman for boat keys. This page separates the trigger, safe combat
        loop, and post-fight quest step so you do not lose an attempt to the
        wrong item.
      </p>
      <Trust />
      <div className="quick-nav" aria-label="On this page">
        <b>QUICK ROUTE</b>
        <a href="#summon">Summon it</a>
        <a href="#combat">Combat loop</a>
        <a href="#reward">Shell → keys</a>
        <a href="#coop-recovery">Co-op revive</a>
        <a href="#mistakes">Mistakes</a>
      </div>
      <div className="fact-row">
        <div>
          <span>SUMMON</span>
          <b>Empty Beer Can</b>
        </div>
        <div>
          <span>LOCATION</span>
          <b>Lighthouse shore</b>
        </div>
        <div>
          <span>PROGRESSION</span>
          <b>Shell → boat keys</b>
        </div>
      </div>
      <GuideVisual
        src="/images/guides/spider-crab-combat-loop.svg"
        alt="Original diagram of the Spider Crab combat loop"
        caption="The boss is a rhythm check: hold space, sidestep the lunge, hit only during the self-stun, then reset the lane."
      />
      <section id="summon">
        <h2>1. Summon Spider Crab correctly</h2>
        <p>
          PC Gamer and GamesRadar+ agree on the gate: complete the opening
          tutorial route, give the fisherman a full beer, then use the returned{" "}
          <strong>Empty Beer Can</strong> as bait. Standard bait is not the boss
          trigger.
        </p>
        <ol className="steps">
          <li>
            <b>Finish the opening tutorial.</b>
            <span>
              PC Gamer begins its route with the sailor tutorial and early clam
              / fishing-rod objectives.
            </span>
          </li>
          <li>
            <b>Prepare recovery.</b>
            <span>
              PC Gamer recommends eating seafood before the fight and keeping a
              clam or two available if needed.
            </span>
          </li>
          <li>
            <b>Trade beer for the empty can.</b>
            <span>
              The full can is not the summon. Give it to the fisherman; the
              returned empty can is the special lure.
            </span>
          </li>
          <li>
            <b>Equip and cast the empty can.</b>
            <span>
              GamesRadar+ and PC Gamer both identify it as the bait used to reel
              in Spider Crab.
            </span>
          </li>
        </ol>
        <div className="callout">
          <b>Source boundary:</b> cited written sources establish the item
          chain. Owner-supplied gameplay privately cross-checks the Empty Beer
          Can, Lighthouse, knife, and post-charge daze visuals; no source-video
          frame or account identifier is reproduced.
        </div>
      </section>
      <section id="combat">
        <h2>2. Use the charge → stun → punish loop</h2>
        <p>
          GamesRadar+ describes Spider Crab’s main attack as a straight charge.
          Move out of that line, then attack once stars show the crab is
          stunned; leave again as it recovers. PC Gamer independently describes
          the post-attack dazed window and recommends patient hit-and-run
          attempts.
        </p>
        <div className="combat-grid">
          <article>
            <span>WAIT</span>
            <b>Let the charge commit.</b>
            <p>
              Keep your focus on avoiding the incoming line rather than
              attempting a hit before the attack resolves.
            </p>
          </article>
          <article>
            <span>DODGE</span>
            <b>Move out of the charge.</b>
            <p>
              GamesRadar+ identifies this move as the boss’s primary attack and
              advises getting out of the way.
            </p>
          </article>
          <article>
            <span>PUNISH</span>
            <b>Attack while it is stunned.</b>
            <p>
              Use the short window marked by stars / the dazed state, as
              described by GamesRadar+ and PC Gamer.
            </p>
          </article>
          <article>
            <span>RESET</span>
            <b>Leave as it recovers.</b>
            <p>
              GamesRadar+ advises running away when it starts turning again,
              then waiting for the next charge.
            </p>
          </article>
        </div>
      </section>
      <section id="reward">
        <h2>3. The reward is a hand-in, not just a kill</h2>
        <p>
          When Spider Crab goes down, keep the{" "}
          <strong>Spider Crab shell</strong> for the fisherman. PC Gamer and
          GamesRadar+ identify the shell hand-in as the step that awards boat
          keys. GamesRadar+ separately describes the radar tablet as the
          follow-up purchase for navigation.
        </p>
        <GuideVisual
          src="/images/guides/spider-crab-handoff.svg"
          alt="Original diagram showing Spider Crab shell becoming boat keys and radar navigation"
          caption="Keep the shell separate until the fisherman has awarded the boat keys."
        />
        <ol className="steps compact">
          <li>
            <b>Pick up the shell.</b>
            <span>Inspect it and keep it out of the sell / food pile.</span>
          </li>
          <li>
            <b>Give the shell to the fisherman.</b>
            <span>Confirm the boat keys are awarded.</span>
          </li>
          <li>
            <b>Get the radar and follow its marker.</b>
            <span>
              The radar is a deliberate next step after keys, not a substitute
              for the quest hand-in.
            </span>
          </li>
          <li>
            <b>Save after the unlock.</b>
            <span>
              Official Patch 1.0.6 notes describe manual Save, Main Menu, Quit,
              and one-minute autosave behavior.
            </span>
          </li>
        </ol>
      </section>
      <section id="coop-recovery">
        <h2>Co-op recovery: create a revive window without losing the boss</h2>
        <p>
          When a teammate is downed, stop chasing damage and make space around
          the body. The visible white bar is{" "}
          <strong>Spider Crab’s escape timer</strong>, not a revive countdown.
          One player should keep the boss engaged and redirect its charge away
          from the body while the other revives; the team must create a safe
          interaction window without letting the escape timer expire.
        </p>
        <ol className="steps compact">
          <li>
            <b>Call the down immediately.</b>
            <span>
              The surviving player needs to know which side of the combat lane
              must be cleared.
            </span>
          </li>
          <li>
            <b>Keep Spider Crab engaged.</b>
            <span>
              Watch the white escape timer and stay close enough to prevent the
              encounter from ending.
            </span>
          </li>
          <li>
            <b>Redirect the charge, then revive.</b>
            <span>
              Pull the boss away from the body, start the revive only after the
              lane opens, and break off if the next charge threatens both
              players.
            </span>
          </li>
          <li>
            <b>Reset before attacking.</b>
            <span>
              Restore spacing and recovery rather than trading damage as soon as
              the teammate stands.
            </span>
          </li>
        </ol>
        <div className="callout">
          <b>No fixed hit-count promise:</b> weapon choice, difficulty, and
          patches change damage. Use the visible daze and Spider Crab escape
          timer as encounter signals instead of memorizing a number of attacks.
        </div>
      </section>
      <section id="mistakes">
        <h2>Common mistakes and quick recoveries</h2>
        <div className="troubleshoot">
          <article>
            <b>Using a normal lure</b>
            <span>
              Only the <strong>Empty Beer Can</strong> starts this boss. Redo
              the fisherman’s beer exchange if the lure in your rod is wrong.
            </span>
          </article>
          <article>
            <b>Attacking during the charge</b>
            <span>
              Stop trading hits. Create side room, dodge the lunge, and make
              your damage only while the crab is stunned.
            </span>
          </article>
          <article>
            <b>Selling the Shell</b>
            <span>
              Pick up the Spider Crab Shell, return it to the Lighthouse Keeper,
              and complete the hand-in for Boat Keys.
            </span>
          </article>
          <article>
            <b>Leaving without navigation</b>
            <span>
              Boat keys are not the last action. Acquire the radar and use the
              marker to leave Lighthouse cleanly.
            </span>
          </article>
          <article>
            <b>Re-attempting while underprepared</b>
            <span>
              Recover health and clear a lane first. If you are repeatedly
              dying, use Easy difficulty from the menu; Patch 1.0.9 documents
              its reduced creature health and damage.
            </span>
          </article>
          <article>
            <b>Progress loss after a crash</b>
            <span>
              Load and inspect before making more purchases. The official patch
              notes say crash-time writes were disabled while regular save
              points and a one-minute autosave remain.
            </span>
          </article>
        </div>
      </section>
      <Related
        links={[
          ["Beginner route: Lighthouse to Island 2", "/beginner-guide"],
          ["All boss & special creatures", "/bosses"],
          ["Lighthouse & main locations", "/locations"],
        ]}
      />
    </article>
  );
}
function Achievements() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [completed, setCompleted] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("htf-achievements-done") || "[]",
      );
      const validNames = new Set(achievements.map((item) => item.name));
      if (Array.isArray(stored))
        setCompleted([
          ...new Set(
            stored.filter(
              (item): item is string =>
                typeof item === "string" && validNames.has(item),
            ),
          ),
        ]);
    } catch {
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (hydrated)
      localStorage.setItem("htf-achievements-done", JSON.stringify(completed));
  }, [completed, hydrated]);
  const visible = useMemo(
    () =>
      achievements.filter((item) => {
        const matchesCategory =
          category === "All" || item.category === category;
        const haystack =
          `${item.name} ${item.official} ${item.route} ${item.location} ${item.difficulty}`.toLowerCase();
        return matchesCategory && haystack.includes(query.trim().toLowerCase());
      }),
    [category, query],
  );
  const toggleAchievement = (name: string) =>
    setCompleted((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  const categories = [
    "All",
    "Story",
    "Combat",
    "Collection",
    "Equipment",
    "Economy",
    "Stunt",
  ];
  return (
    <section className="hub achievement-page">
      <Crumb>Achievements</Crumb>
      <p className="eyebrow">COMPLETION BOARD</p>
      <h1>
        All 28 How to Fish
        <br />
        <i>Game Achievements</i>
      </h1>
      <p className="standfirst">
        An illustrated, searchable checklist for all 28 Steam achievements, with
        official conditions, global completion-rate context, practical routes,
        and current-build cautions.
      </p>
      <Trust />
      <section
        className="achievement-summary"
        aria-label="Achievement guide summary"
      >
        <div>
          <b>28</b>
          <span>OFFICIAL ACHIEVEMENTS</span>
        </div>
        <div>
          <b>{completed.length}</b>
          <span>MARKED COMPLETE</span>
        </div>
        <div>
          <b>
            {
              achievements.filter((item) => item.difficulty === "Extreme")
                .length
            }
          </b>
          <span>EXTREME CLEANUP TASKS</span>
        </div>
      </section>
      <section className="hub-note">
        <h2>Plan a 100% run without losing route progress</h2>
        <p>
          Finish the tutorial and location unlock chain first, then clean up
          collection, equipment, stunt, food, and economy achievements.
          Route-first play gives you access to later lure pools and bosses while
          reducing the chance that a risky side objective costs a unique
          progression item.
        </p>
        <p>
          The quoted condition under each card comes from Steam’s official
          global-achievements page. Global rates were refreshed from Steam on
          August 28, 2026 and will change as more players enter the game. The
          route text remains editorial guidance, so old prices, patched
          exploits, and disputed co-op behavior are not promoted as facts.
        </p>
      </section>
      <section
        className="achievement-tools"
        aria-label="Search and filter achievements"
      >
        <label>
          <span className="sr-only">Search achievements</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, condition, location, or route…"
          />
        </label>
        <div>
          {categories.map((value) => (
            <button
              type="button"
              key={value}
              className={category === value ? "active" : ""}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </section>
      <div className="achievement-progress">
        <span>
          <b>{completed.length}</b> / 28 complete
        </span>
        <div>
          <i
            style={{
              width: `${(completed.length / achievements.length) * 100}%`,
            }}
          />
        </div>
        {completed.length > 0 && (
          <button type="button" onClick={() => setCompleted([])}>
            Clear marks
          </button>
        )}
      </div>
      <p className="achievement-results">
        Showing <b>{visible.length}</b> of 28 achievements · progress is stored
        only in this browser
      </p>
      <ol className="achievement-guide">
        {visible.map((a) => (
          <li
            key={a.name}
            className={completed.includes(a.name) ? "complete" : ""}
          >
            <div className="achievement-icon">
              <img
                src={`/images/achievements/${a.icon}.webp`}
                alt={`${a.name} achievement icon`}
                width="256"
                height="256"
                loading="lazy"
                decoding="async"
              />
              <span>
                {String(achievements.indexOf(a) + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="achievement-card-copy">
              <div className="achievement-card-head">
                <div>
                  <em>{a.category}</em>
                  <h2>{a.name}</h2>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={completed.includes(a.name)}
                    onChange={() => toggleAchievement(a.name)}
                  />{" "}
                  Complete
                </label>
              </div>
              <p className="official-condition">
                <b>Official condition:</b> {a.official}.
              </p>
              <div className="achievement-meta">
                <span>
                  <i>GLOBAL RATE</i>
                  <b>{a.globalRate}%</b>
                </span>
                <span>
                  <i>LOCATION / STAGE</i>
                  <b>{a.location}</b>
                </span>
                <span className={`difficulty-${a.difficulty.toLowerCase()}`}>
                  <i>DIFFICULTY</i>
                  <b>{a.difficulty}</b>
                </span>
              </div>
              <p>
                <b>Practical route:</b> {a.route}
              </p>
              {a.caution && (
                <p className="achievement-caution">
                  <b>Current-build caution:</b> {a.caution}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {visible.length === 0 && (
        <p className="achievement-empty">
          No achievement matches this search and category.
        </p>
      )}
      <section className="hub-note">
        <h2>Recommended cleanup order</h2>
        <div className="editorial-grid">
          <article>
            <b>1. Story and bosses</b>
            <p>
              Complete every location hand-in and retain unique drops until the
              next route marker appears.
            </p>
          </article>
          <article>
            <b>2. Collection</b>
            <p>
              Use the local 49-creature checklist to mark confirmed catches
              without creating an account.
            </p>
          </article>
          <article>
            <b>3. Equipment and economy</b>
            <p>
              Buy missing upgrades after progression is safe, then work on money
              and gear milestones.
            </p>
          </article>
          <article>
            <b>4. Skill and novelty</b>
            <p>
              Leave speed, stunt, food, and unusual interaction achievements for
              a disposable cleanup save.
            </p>
          </article>
        </div>
        <p>
          Check the Steam overlay after each attempt; this website cannot read
          your save or confirm an unlock. If one achievement fails, restart the
          smallest relevant encounter before repeating the entire story.
        </p>
      </section>
    </section>
  );
}
function About() {
  return (
    <article className="article policy-page">
      <Crumb>About</Crumb>
      <p className="eyebrow">INDEPENDENT PLAYER GUIDE</p>
      <h1>
        About How to Fish
        <br />
        <i>Walkthrough</i>
      </h1>
      <p className="standfirst">
        How to Fish Walkthrough is an independent guide and checklist site for
        the 2026 Dazed Games title. It is not an official wiki and is not
        affiliated with Dazed Games, Steam, or the publishers cited in our
        research notes.
      </p>
      <section>
        <h2>What we publish</h2>
        <p>
          We focus on steps a player can execute: what to prepare, where to go,
          what starts an encounter, how to recover from common mistakes, and
          what confirms progression. The Beginner Guide, Lighthouse route, and
          Spider Crab guide are the current editorial core.
        </p>
      </section>
      <section>
        <h2>How guides are made</h2>
        <p>
          Instructions are checked against owner-provided gameplay footage,
          official patch notes, and independent written walkthroughs. Original
          diagrams and processed frames explain mechanics. A visible checked
          date and evidence boundary distinguish frame-verified instructions
          from concise reference lists.
        </p>
      </section>
      <section>
        <h2>Corrections and rights</h2>
        <p>
          Games change quickly. If a patch changes a route, or if you own
          material that you believe appears without appropriate permission, use
          the <a href="/contact">contact page</a>. We review specific reports
          and correct or remove material when warranted.
        </p>
      </section>
    </article>
  );
}
function Contact() {
  return (
    <article className="article policy-page">
      <Crumb>Contact</Crumb>
      <p className="eyebrow">CORRECTIONS &amp; RIGHTS</p>
      <h1>
        Contact the
        <br />
        <i>guide team</i>
      </h1>
      <p className="standfirst">
        Send a specific report for factual corrections, broken links,
        accessibility problems, privacy questions, or rights concerns.
      </p>
      <section>
        <h2>Private contact</h2>
        <p>
          Email{" "}
          <a href="mailto:likaichina1995@gmail.com?subject=How%20to%20Fish%20Walkthrough%20report">
            likaichina1995@gmail.com
          </a>{" "}
          for factual corrections, privacy requests, accessibility problems,
          or rights and takedown concerns. Email correspondence is not posted
          publicly. Include the affected page URL, the sentence or image at
          issue, your evidence, and the game version when relevant. Do not send
          passwords, payment information, government identifiers, or other
          unnecessary sensitive data.
        </p>
      </section>
      <section>
        <h2>Public technical reports</h2>
        <p>
          For non-sensitive broken links or technical errors, you may instead
          open a public issue in the project repository:{" "}
          <a
            href="https://github.com/ShallowSummertime/fish/issues"
            target="_blank"
            rel="noreferrer"
          >
            How to Fish Walkthrough issues ↗
          </a>
          . GitHub issues are public, so never post personal information,
          private correspondence, or confidential rights documentation there.
        </p>
      </section>
      <section>
        <h2>What to expect</h2>
        <p>
          Actionable corrections are checked against the current build and cited
          sources. Rights requests should identify the material and explain your
          relationship to it. Spam, paid-link requests, and requests to
          manipulate rankings or ad clicks are ignored.
        </p>
      </section>
    </article>
  );
}
function Privacy() {
  return (
    <article className="article policy-page">
      <Crumb>Privacy Policy</Crumb>
      <p className="eyebrow">LAST UPDATED AUGUST 29, 2026</p>
      <h1>
        Privacy
        <br />
        <i>Policy</i>
      </h1>
      <p className="standfirst">
        This policy explains what How to Fish Walkthrough stores, what third
        parties may receive, and the choices available to visitors.
      </p>
      <section>
        <h2>Information stored on your device</h2>
        <p>
          The creature checklist uses browser local storage to remember names
          you mark as caught. That data remains on your device, is not tied to
          an account, and can be cleared through your browser settings or by
          clearing site data.
        </p>
      </section>
      <section>
        <h2>Email communications</h2>
        <p>
          If you contact us by email, we receive the address you use, your
          message, and any information or attachments you choose to include.
          We use that information only to review and respond to your request,
          investigate corrections, or handle privacy and rights concerns. Email
          is processed by the sender&apos;s and recipient&apos;s email providers and
          retained only as reasonably needed for those purposes or legal and
          security obligations. Please do not send unnecessary sensitive data.
        </p>
      </section>
      <section>
        <h2>Server and hosting data</h2>
        <p>
          Our hosting provider may process standard request information such as
          IP address, device and browser details, requested URL, timestamp, and
          security logs to deliver and protect the site. We do not ask visitors
          to create an account or submit sensitive personal information.
        </p>
      </section>
      <section>
        <h2>Advertising and cookies</h2>
        <p>
          We may use Google AdSense to fund the site. Google and its partners
          may use cookies, web beacons, IP addresses, or similar technologies to
          serve, measure, and limit ads. Depending on your region and consent
          choices, ads may be personalized or non-personalized. Learn how Google
          uses information from sites that use its services at{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noreferrer"
          >
            Google’s partner-sites policy ↗
          </a>
          .
        </p>
        <p>
          Where required, visitors will be shown consent choices through a
          Google-certified consent management platform before advertising
          storage is used. You can manage ad personalization at{" "}
          <a
            href="https://myadcenter.google.com/"
            target="_blank"
            rel="noreferrer"
          >
            My Ad Center ↗
          </a>{" "}
          and browser cookies through browser settings.
        </p>
      </section>
      <section>
        <h2>External links and changes</h2>
        <p>
          Research references and contact links lead to third-party sites with
          their own privacy practices. We may update this policy when hosting,
          analytics, advertising, or legal requirements change. Material changes
          will be reflected by the date at the top of this page.
        </p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>
          Use the <a href="/contact">contact page</a> for privacy questions or
          requests.
        </p>
      </section>
    </article>
  );
}
function Terms() {
  return (
    <article className="article policy-page">
      <Crumb>Terms &amp; Disclaimer</Crumb>
      <p className="eyebrow">LAST UPDATED AUGUST 29, 2026</p>
      <h1>
        Terms &amp;
        <br />
        <i>Disclaimer</i>
      </h1>
      <p className="standfirst">
        By using this site, you agree to use its guides as informational
        player-made material and to verify important steps against your current
        game build.
      </p>
      <section>
        <h2>Independent status</h2>
        <p>
          How to Fish, Dazed Games, Steam, and related names, artwork, and
          trademarks belong to their respective owners. How to Fish Walkthrough
          is an unofficial fan resource and does not claim endorsement or
          partnership.
        </p>
      </section>
      <section>
        <h2>Accuracy and availability</h2>
        <p>
          We try to identify the checked version and source boundary for
          detailed guides, but patches can change mechanics, prices, saves,
          drops, and progression. The site is provided without a guarantee that
          every instruction will remain correct or that service will be
          uninterrupted.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          You may use the site for personal gameplay reference. Do not interfere
          with the site, attempt unauthorized access, scrape it in a way that
          degrades service, submit malicious reports, or reproduce original site
          text and illustrations as your own.
        </p>
      </section>
      <section>
        <h2>Rights and takedown requests</h2>
        <p>
          Links to other sites do not transfer ownership or imply endorsement.
          Rights holders can submit a specific removal or correction request
          privately by email through the <a href="/contact">contact page</a>.
        </p>
      </section>
    </article>
  );
}
function NotFound() {
  return (
    <section className="hub empty">
      <p className="eyebrow">OFF THE CHART</p>
      <h1>
        This page drifted
        <br />
        <i>out of view.</i>
      </h1>
      <a className="button primary" href="/">
        Return to chart room <b>→</b>
      </a>
    </section>
  );
}
export function App({ initialPath }: { initialPath?: string }) {
  const path =
    initialPath ??
    (typeof window === "undefined"
      ? "/"
      : window.location.pathname.replace(/\/$/, "") || "/");
  const Page =
    {
      "/": Home,
      "/beginner-guide": Beginner,
      "/creatures": Creatures,
      "/bosses": Bosses,
      "/locations": Locations,
      "/locations/lighthouse": LighthouseGuide,
      "/locations/forest": ForestGuide,
      "/locations/desert": DesertGuide,
      "/locations/rocks": RocksGuide,
      "/locations/volcano": VolcanoGuide,
      "/guides/reel-of-fortune": ReelOfFortuneGuide,
      "/guides/casino-money-route": CasinoMoneyRouteGuide,
      "/guides/mutated-whale-handyman": MutatedWhaleHandymanGuide,
      "/lures": Lures,
      "/bosses/spider-crab": SpiderCrab,
      "/achievements": Achievements,
      "/about": About,
      "/contact": Contact,
      "/privacy": Privacy,
      "/terms": Terms,
    }[path] || NotFound;
  return (
    <>
      <Meta path={path} />
      <Header />
      <main>
        <Page />
      </main>
      <Footer />
    </>
  );
}
