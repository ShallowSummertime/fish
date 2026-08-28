import { describe, expect, it } from "vitest";
import { achievements, bosses, creatures, locations, pageMeta } from "./data";
describe("How to Fish content baseline", () => {
  it("contains exactly 49 creatures with 11 boss or special entities", () => {
    expect(creatures).toHaveLength(49);
    expect(creatures.filter((c) => c.kind === "Boss / Special")).toHaveLength(
      11,
    );
    expect(
      creatures.every((c) => c.island && c.lure && c.value > 0 && c.tier),
    ).toBe(true);
    expect(creatures.find((c) => c.name === "Voxelfish")).toMatchObject({
      island: "Rocks",
      lure: "Professional Lure",
      value: 340,
    });
    expect(
      creatures.find((c) => c.name === "Mutated Bowhead Whale"),
    ).toMatchObject({ island: "Volcano", value: 15000 });
    expect(bosses).toHaveLength(11);
    expect(
      bosses.every(
        (b) =>
          b.fight.length > 40 && b.reward.length > 35 && b.recovery.length > 35,
      ),
    ).toBe(true);
  });
  it("models the five main locations correctly", () => {
    expect(locations).toHaveLength(5);
    expect(locations[0].name).toBe("Lighthouse");
    expect(locations.filter((l) => l.type === "Island")).toHaveLength(4);
  });
  it("has metadata for every required core route", () => {
    [
      "/",
      "/beginner-guide",
      "/creatures",
      "/bosses",
      "/locations",
      "/locations/lighthouse",
      "/locations/rocks",
      "/locations/volcano",
      "/guides/reel-of-fortune",
      "/lures",
      "/bosses/spider-crab",
      "/achievements",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
    ].forEach((path) => expect(pageMeta[path]).toBeDefined());
    expect(pageMeta["/"].title).toContain("How to Fish Walkthrough");
    for (const [path, meta] of Object.entries(pageMeta))
      expect(meta.title.length, `${path} title`).toBeLessThanOrEqual(60);
    expect(pageMeta["/locations/volcano"].image).toBe(
      "/images/guides/volcano/01-volcano-arrival.png",
    );
    expect(
      pageMeta["/guides/reel-of-fortune"].title.length,
    ).toBeLessThanOrEqual(60);
    expect(pageMeta["/bosses"].image).toBe(
      "/images/guides/island-1/08-spider-crab.jpg",
    );
    expect(pageMeta["/bosses/spider-crab"].image).toBe(
      "/images/guides/island-1/08-spider-crab.jpg",
    );
    expect(pageMeta["/creatures"].image).toBe(
      "/images/creatures/encyclopedia-early.webp",
    );
    expect(achievements).toHaveLength(28);
    expect(new Set(achievements.map((a) => a.name)).size).toBe(28);
    expect(
      achievements.every(
        (a) => a.official && a.category && a.route.length > 45,
      ),
    ).toBe(true);
    expect(
      achievements.every(
        (a) => a.icon && a.globalRate > 0 && a.location && a.difficulty,
      ),
    ).toBe(true);
    expect(new Set(achievements.map((a) => a.icon)).size).toBe(28);
    expect(achievements[0].globalRate).toBe(98.7);
    expect(achievements.at(-1)?.globalRate).toBe(1.6);
    expect(achievements.find((a) => a.name === "Bean")?.caution).toContain(
      "patched",
    );
    expect(pageMeta["/achievements"].image).toContain("/images/achievements/");
  });
});
