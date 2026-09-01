# Practical tips recording — 2026-09-01

## Source and rights

- Source: `/Users/wanglu/Desktop/how to fish/什么都有/ScreenRecording_09-01-2026 18-06-27_1.MP4`
- Duration: `00:01:33.576`
- Display: `2622 × 1206` after rotation metadata is applied (`1206 × 2622` encoded), 60 fps HEVC with AAC audio.
- Size: `175225930` bytes.
- SHA-256: `6127ead387e6820d99c0bfa41eb1d5f267eff8d9c39be46a5e00f46a2e8f6f28`.
- Visible build: `1.0.10`.
- Rights decision: user-supplied screen recording. The raw video remains at its original path and is registered source-only. Saved frames retain Chinese creator captions and a player-control edge, so every direct derivative in this directory is research-only and must not be published without a separate clean reconstruction or clean owner-approved crop.

## Verified sequences in the recording

| Time | Topic | What the footage supports | Boundary |
|---|---|---|---|
| `00:02–00:18` | Close-shore fishing and release | Stand close enough to put the rod tip/lure directly into the water instead of making a normal long cast. When an unwanted catch bites, right-click releases it; the narration reports that this usually does not consume bait. | The clip does not measure catch-time improvement, bait-save rate, rarity odds, controller input, or behavior after Patch 1.0.10. |
| `00:19–00:30` | Cooked weapon recovery | A gun dropped on Volcano lava changes to a visibly cooked state. The sequence retrieves/puts it in water and shows the ordinary weapon appearance again, avoiding a replacement purchase in this run. | Persistence across saves, every weapon type, death, co-op ownership, and later patches are not established. |
| `00:32–00:36` | Sniper quick-switch | After firing, double-tapping the weapon's numbered slot is shown skipping the visible bolt-cycle animation and allowing a faster next shot. | This is a Patch 1.0.10 animation-cancel observation, not a guaranteed intended mechanic or stable fire-rate value. |
| `00:38–00:45` | BingBong and Carrot | On the third island, Coconut is used to catch the creature visibly labeled `Bing Bong`; giving the catch to the nearby islander is presented as the route to the Carrot used for Pufferfish. | The NPC's official English name, exact dialogue, Coconut price, and whether the body must be alive/dead are not readable. Live objective text remains authoritative. |
| `00:46–01:07` | Boat pushing | When a boat is beached or wedged, punches visibly move it toward open water. The recording also demonstrates propelling/steering a boat by punching it and describes reaching the second island without a key. | Treat no-key travel and route skipping as patch-sensitive behavior. It does not prove the skipped save will retain correct quest state, Radar markers, or co-op progression. |
| `01:08–01:22` | Shotgun recoil jump | Firing a shotgun downward after jumping creates a much higher recoil-assisted jump, including access to the top of a Coconut tree. | The recording explicitly shows that height does not make the Pufferfish encounter damage-free; the boss can still reach the player. Exact gun, ammo, timing window, and fall risk are not measured. |
| `01:23–01:31` | Charged throw | Holding `Q` displays a central charge circle and increases throwing distance before release. | Maximum distance, charge time, object weight limits, controller input, and combat damage are not established. |

## Entity classification

- **Island/location:** Desert / Island 3 (Coconut, BingBong, islander, Pufferfish setup); Volcano / Island 5 (lava weapon state); open-water and boat routes.
- **Fish/creature:** Bing Bong / BingBong; Pufferfish appears during the shotgun-jump caveat.
- **NPC:** an unidentified Desert islander accepts BingBong and is presented as awarding Carrot.
- **Weapon:** sniper rifle quick-switch; shotgun recoil jump; a firearm changing state on lava and recovering in water.
- **Bait/item:** Coconut for BingBong; Carrot for Pufferfish; ordinary bait involved in the close-shore release test.
- **Vehicle:** a normal boat can be pushed off sand or rocks with fists; no-key propulsion is visible but route safety is unverified.
- **Controls:** right-click releases an unwanted hooked catch in the captured keyboard setup; hold `Q` to charge a longer throw.
- **Prices/values:** none are established by this recording.
- **Attack behavior:** Pufferfish can still reach a player on top of a Coconut tree; no exact move name, damage, radius, or safe threshold is established.

## Content architecture decision

Use a hybrid placement, led by one standalone article rather than placing the whole clip inside the Beginner Guide.

1. Create `/guides/tips-and-tricks` with the distinct intent **How to Fish Tips and Tricks**. It can support six cross-system sections: faster fishing/release, weapon recovery, sniper quick-switch, boat recovery, shotgun jump, and charged throws. Label all Patch 1.0.10 shortcuts as version-sensitive and exclude a progression-skip recommendation.
2. Update `/locations/desert` with the materially stronger `Coconut → BingBong → islander → Carrot → Pufferfish` sequence. This closes a known evidence gap in the existing Desert quest section.
3. Add only the beginner-safe subset—close-shore fishing, right-click release, and charged throws—to `/beginner-guide`, followed by a link to the standalone tips page.
4. Cross-link the sniper and cooked-weapon notes from the weapons/Rocks/Volcano contexts, but do not duplicate full instructions on every page.

This avoids forcing advanced movement and patch-sensitive animation cancels into the beginner route while still giving the broad `tips and tricks` query a focused page. A search-result check on 2026-09-01 found a directly competing “15 Tips” article, which supports a distinct tips intent; the existing Beginner Guide should continue to target first-hour and five-location progression.

## Missing publishable material

- Clean English, watermark-free captures for each technique.
- A current-build repeat test for bait consumption after right-click release.
- Clean UI proof of Coconut, BingBong, Carrot, and accepted islander hand-in.
- A second run testing cooked-weapon recovery, save persistence, and several weapon types.
- Current-build repeat tests for sniper quick-switch, punch-driven no-key travel, shotgun jump timing, and throw-charge distance.
- Controller bindings for release and charged throw.
