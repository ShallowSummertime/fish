#!/usr/bin/env node

import { createHash } from "node:crypto";
import { constants, createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const desktopRoot = "/Users/wanglu/Desktop/how to fish";
const weaponReferenceRoot =
  "/Users/wanglu/Documents/Codex/2026-08-28/ho/outputs/how-to-fish-weapons";
const creatureGalleryRoot =
  "/Users/wanglu/Documents/Codex/2026-08-28/ho/outputs/how-to-fish-gallery";
const achievementGalleryRoot =
  "/Users/wanglu/Documents/Codex/2026-08-28/ho/outputs/how-to-fish-achievements";
const maxFullCopyBytes = 100 * 1024 * 1024;
const knowledgeSeedPaths = [
  path.join(repoRoot, "research/asset-knowledge/first-island.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/weapons.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/guide-4-5.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/guide-2.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/forest-full.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/guide-3.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/rocks-full.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/mixed-video-guides.seed.json"),
  path.join(repoRoot, "research/asset-knowledge/practical-tips.seed.json"),
];

function usage() {
  return "Usage: node scripts/build-asset-library.mjs --archive-root <absolute-path> [--verify]";
}

function parseArgs(args) {
  let archiveRoot;
  let verify = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--archive-root") {
      archiveRoot = args[index + 1];
      index += 1;
    } else if (arg === "--verify") {
      verify = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!archiveRoot) throw new Error(`Missing --archive-root. ${usage()}`);
  if (!path.isAbsolute(archiveRoot))
    throw new Error("--archive-root must be an absolute path.");
  return { archiveRoot: path.resolve(archiveRoot), verify };
}

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function assertSafeArchiveRoot(archiveRoot) {
  if (isWithin(archiveRoot, repoRoot)) {
    throw new Error(
      "The asset archive must be outside this repository, so it cannot archive itself.",
    );
  }
  const sourceRoots = [
    path.join(desktopRoot, "新手指南"),
    path.join(desktopRoot, "第一座岛"),
    path.join(desktopRoot, "攻略1"),
    path.join(desktopRoot, "攻略2"),
    path.join(desktopRoot, "攻略3"),
    weaponReferenceRoot,
    creatureGalleryRoot,
    achievementGalleryRoot,
  ];
  for (const sourceRoot of sourceRoots) {
    if (isWithin(archiveRoot, sourceRoot)) {
      throw new Error(
        `The asset archive cannot be inside a source directory: ${sourceRoot}`,
      );
    }
  }
}

async function assertNoSymlinksInExistingPath(targetPath, label) {
  const parsed = path.parse(targetPath);
  let cursor = parsed.root;
  const segments = targetPath
    .slice(parsed.root.length)
    .split(path.sep)
    .filter(Boolean);
  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    try {
      const stat = await fs.lstat(cursor);
      if (stat.isSymbolicLink())
        throw new Error(`${label} contains a symlink: ${cursor}`);
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
  }
}

async function nearestExistingAncestor(targetPath, label) {
  let cursor = targetPath;
  while (true) {
    try {
      const stat = await fs.lstat(cursor);
      if (stat.isSymbolicLink())
        throw new Error(`${label} contains a symlink: ${cursor}`);
      if (!stat.isDirectory())
        throw new Error(`${label} ancestor is not a directory: ${cursor}`);
      return cursor;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const parent = path.dirname(cursor);
      if (parent === cursor)
        throw new Error(
          `No existing ancestor found for ${label}: ${targetPath}`,
        );
      cursor = parent;
    }
  }
}

async function existingRealDirectory(directoryPath, label) {
  await assertNoSymlinksInExistingPath(directoryPath, label);
  const stat = await fs.lstat(directoryPath);
  if (stat.isSymbolicLink())
    throw new Error(`${label} is a symlink: ${directoryPath}`);
  if (!stat.isDirectory())
    throw new Error(`${label} is not a directory: ${directoryPath}`);
  return fs.realpath(directoryPath);
}

async function prepareArchiveRoot(archiveRoot) {
  await assertNoSymlinksInExistingPath(archiveRoot, "archive root");
  const ancestor = await nearestExistingAncestor(archiveRoot, "archive root");
  const actualAncestor = await fs.realpath(ancestor);
  const remainingPath = path.relative(ancestor, archiveRoot);
  const prospectiveRoot = path.resolve(actualAncestor, remainingPath);
  if (!isWithin(prospectiveRoot, actualAncestor))
    throw new Error("Archive root escapes its nearest existing ancestor.");
  await fs.mkdir(archiveRoot, { recursive: true });
  return existingRealDirectory(archiveRoot, "archive root");
}

async function safeArchiveDestination(archiveRoot, archivePath) {
  if (
    !archivePath ||
    path.posix.isAbsolute(archivePath) ||
    archivePath.split("/").includes("..")
  ) {
    throw new Error(`Invalid archive-relative path: ${archivePath}`);
  }
  const destinationPath = path.resolve(archiveRoot, ...archivePath.split("/"));
  if (!isWithin(destinationPath, archiveRoot))
    throw new Error(`Archive path escapes archive root: ${archivePath}`);
  const destinationParent = path.dirname(destinationPath);
  await assertNoSymlinksInExistingPath(
    destinationParent,
    "archive destination parent",
  );
  await fs.mkdir(destinationParent, { recursive: true });
  const actualParent = await existingRealDirectory(
    destinationParent,
    "archive destination parent",
  );
  if (!isWithin(actualParent, archiveRoot))
    throw new Error(
      `Archive destination parent escapes archive root: ${destinationParent}`,
    );
  try {
    const destinationStat = await fs.lstat(destinationPath);
    if (destinationStat.isSymbolicLink())
      throw new Error(`Archive destination is a symlink: ${destinationPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return destinationPath;
}

async function safeArchiveDirectory(archiveRoot, relativeDirectory) {
  if (
    !relativeDirectory ||
    path.posix.isAbsolute(relativeDirectory) ||
    relativeDirectory.split("/").includes("..")
  ) {
    throw new Error(`Invalid archive-relative directory: ${relativeDirectory}`);
  }
  const directoryPath = path.resolve(
    archiveRoot,
    ...relativeDirectory.split("/"),
  );
  if (!isWithin(directoryPath, archiveRoot))
    throw new Error(
      `Archive directory escapes archive root: ${relativeDirectory}`,
    );
  await assertNoSymlinksInExistingPath(directoryPath, "archive directory");
  await fs.mkdir(directoryPath, { recursive: true });
  const actualDirectory = await existingRealDirectory(
    directoryPath,
    "archive directory",
  );
  if (!isWithin(actualDirectory, archiveRoot))
    throw new Error(
      `Archive directory escapes archive root: ${relativeDirectory}`,
    );
  return actualDirectory;
}

async function safeExistingArchiveFile(archiveRoot, archivePath) {
  if (
    !archivePath ||
    path.posix.isAbsolute(archivePath) ||
    archivePath.split("/").includes("..")
  ) {
    throw new Error(`Invalid archive-relative path: ${archivePath}`);
  }
  const targetPath = path.resolve(archiveRoot, ...archivePath.split("/"));
  if (!isWithin(targetPath, archiveRoot))
    throw new Error(`Archive path escapes archive root: ${archivePath}`);
  await assertNoSymlinksInExistingPath(targetPath, "archive file");
  const stat = await fs.lstat(targetPath);
  if (stat.isSymbolicLink())
    throw new Error(`Archive file is a symlink: ${targetPath}`);
  if (!stat.isFile())
    throw new Error(`Archive path is not a file: ${targetPath}`);
  const actualFile = await fs.realpath(targetPath);
  if (!isWithin(actualFile, archiveRoot))
    throw new Error(`Archive file escapes archive root: ${targetPath}`);
  return { targetPath, stat };
}

async function safeSourceOnlyFile(
  sourcePath,
  desktopRoot = currentDesktopRoot,
) {
  const actualDesktopRoot = await existingRealDirectory(
    desktopRoot,
    "Desktop how to fish root",
  );
  await assertNoSymlinksInExistingPath(sourcePath, "source-only video");
  const stat = await fs.lstat(sourcePath);
  if (stat.isSymbolicLink())
    throw new Error(`source-only video is a symlink: ${sourcePath}`);
  if (!stat.isFile())
    throw new Error(`source-only video is not a file: ${sourcePath}`);
  const actualSource = await fs.realpath(sourcePath);
  if (!isWithin(actualSource, actualDesktopRoot))
    throw new Error(
      `source-only video escapes Desktop how to fish root: ${sourcePath}`,
    );
  return { sourcePath: actualSource, stat };
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function filesUnder(root, label = "archived source tree") {
  await existingRealDirectory(root, label);
  const entries = await fs.readdir(root);
  const nested = await Promise.all(
    entries.map(async (name) => {
      const absolutePath = path.join(root, name);
      const stat = await fs.lstat(absolutePath);
      if (stat.isSymbolicLink())
        throw new Error(`${label} contains a symlink: ${absolutePath}`);
      if (stat.isDirectory()) return filesUnder(absolutePath, label);
      if (stat.isFile()) return [absolutePath];
      return [];
    }),
  );
  return nested.flat().sort(compareStrings);
}

async function assertNoVideosInArchivedTree(sourceRoot, sourceFiles) {
  const videoPath = sourceFiles.find(
    (sourcePath) => mediaType(sourcePath) === "video",
  );
  if (videoPath) {
    throw new Error(
      `Video media cannot be archived from ${sourceRoot}: ${videoPath}. Register it explicitly as source-only and archive only derived analysis images.`,
    );
  }
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

function mediaType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if ([".mp4", ".mov", ".webm"].includes(extension)) return "video";
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(extension))
    return "image";
  if ([".md", ".txt", ".csv", ".json", ".html", ".js"].includes(extension))
    return "document";
  return "file";
}

function assetId(record) {
  if (record.status === "archived/superseded")
    return `asset-history:${record.archivePath}`;
  const identity =
    record.logicalArchivePath ?? record.archivePath ?? record.sourcePath;
  return `asset:${identity.replaceAll(path.sep, "/")}`;
}

function sourceGroups() {
  const islandVideoPath = path.join(
    desktopRoot,
    "第一座岛/2b54bef3933da8bc3cd5923961fa883c.mp4",
  );
  const guideVideoPaths = [
    path.join(desktopRoot, "攻略1/ScreenRecording_08-27-2026 19-48-42_1.MP4"),
    path.join(desktopRoot, "攻略1/d6d1b952eed288e80723f00a0e3473c6.mp4"),
  ];
  const guide45VideoPath = path.join(
    desktopRoot,
    "攻略4-5/ScreenRecording_08-28-2026 10-48-09_1.MP4",
  );
  const guide2VideoPath = path.join(
    desktopRoot,
    "攻略2/ScreenRecording_08-28-2026 10-03-30_1.MP4",
  );
  const guide3VideoPath = path.join(
    desktopRoot,
    "攻略3/ScreenRecording_08-28-2026 10-09-46_1.MP4",
  );
  const forestFullVideoPath = path.join(
    desktopRoot,
    "ScreenRecording_08-29-2026 07-54-44_1.MP4",
  );
  const rocksFullVideoPath = path.join(
    desktopRoot,
    "第四/ScreenRecording_08-31-2026 08-08-38_1.MP4",
  );
  const mixedGuideVideoPaths = [
    "ScreenRecording_08-28-2026 10-22-35_1.MP4",
    "ScreenRecording_08-28-2026 10-35-54_1.MP4",
    "ScreenRecording_08-31-2026 08-47-11_1.MP4",
    "ScreenRecording_08-31-2026 08-53-37_1.MP4",
    "ScreenRecording_08-31-2026 08-59-21_1.MP4",
    "ScreenRecording_08-31-2026 09-00-49_1.MP4",
    "ScreenRecording_08-31-2026 09-06-05_1.MP4",
  ].map((name) => path.join(desktopRoot, "什么都有", name));
  const practicalTipsVideoPath = path.join(
    desktopRoot,
    "什么都有/ScreenRecording_09-01-2026 18-06-27_1.MP4",
  );
  const islandRawAssetId = assetId({
    sourcePath: islandVideoPath,
    archivePath: null,
  });
  const guideRawAssetIds = guideVideoPaths.map((sourcePath) =>
    assetId({ sourcePath, archivePath: null }),
  );
  const guide45RawAssetId = assetId({
    sourcePath: guide45VideoPath,
    archivePath: null,
  });
  const guide2RawAssetId = assetId({ sourcePath: guide2VideoPath, archivePath: null });
  const guide3RawAssetId = assetId({ sourcePath: guide3VideoPath, archivePath: null });
  const forestFullRawAssetId = assetId({
    sourcePath: forestFullVideoPath,
    archivePath: null,
  });
  const rocksFullRawAssetId = assetId({
    sourcePath: rocksFullVideoPath,
    archivePath: null,
  });
  const mixedGuideRawAssetIds = mixedGuideVideoPaths.map((sourcePath) =>
    assetId({ sourcePath, archivePath: null }),
  );
  const practicalTipsRawAssetId = assetId({
    sourcePath: practicalTipsVideoPath,
    archivePath: null,
  });
  const entityFrames = {
    "clam.jpg": {
      entity: "Clam",
      sourceFrame: "frame-006.jpg",
      pageUsage: ["/locations/lighthouse", "/beginner-guide"],
    },
    "keeper-npc.jpg": {
      entity: "Lighthouse Keeper NPC",
      sourceFrame: "frame-009.jpg",
      pageUsage: ["/locations/lighthouse", "/bosses/spider-crab"],
    },
    "first-rod.jpg": {
      entity: "Fishing rod",
      sourceFrame: "frame-013.jpg",
      pageUsage: ["/locations/lighthouse", "/beginner-guide"],
    },
    "catch-value.jpg": {
      entity: "Unidentified catch inspection",
      sourceFrame: "frame-019.jpg",
      pageUsage: ["research-only"],
    },
    "reel-of-fortune.jpg": {
      entity: "Reel of Fortune",
      sourceFrame: "frame-021.jpg",
      pageUsage: ["/guides/reel-of-fortune"],
    },
    "early-shop-weapons.jpg": {
      entity: "Brass Knuckles shop listing",
      sourceFrame: "frame-023.jpg",
      pageUsage: ["research-only"],
    },
    "knife-shop.jpg": {
      entity: "Knife shop listing",
      sourceFrame: "frame-024.jpg",
      pageUsage: ["research-only"],
    },
    "hot-dog-shop.jpg": {
      entity: "Hot Dog shop listing",
      sourceFrame: "frame-026.jpg",
      pageUsage: ["research-only"],
    },
    "empty-beer-can.jpg": {
      entity: "Beer exchange / Empty Beer Can evidence",
      sourceFrame: "frame-027.jpg",
      pageUsage: ["/locations/lighthouse", "/bosses/spider-crab"],
    },
    "boss-lure-cast.jpg": {
      entity: "Spider Crab boss-lure cast",
      sourceFrame: "frame-028.jpg",
      pageUsage: ["/locations/lighthouse", "/bosses/spider-crab"],
    },
    "spider-crab.jpg": {
      entity: "Spider Crab",
      sourceFrame: "frame-003.jpg",
      pageUsage: ["/bosses/spider-crab", "/locations/lighthouse"],
    },
    "spider-crab-attack-window.jpg": {
      entity: "Spider Crab attack-window evidence",
      sourceFrame: "frame-032.jpg",
      pageUsage: ["/bosses/spider-crab"],
    },
    "shell-handoff.jpg": {
      entity: "Spider Crab Shell handoff evidence",
      sourceFrame: "frame-035.jpg",
      pageUsage: ["/bosses/spider-crab", "/locations/lighthouse"],
    },
    "radar-forest-route.jpg": {
      entity: "Radar / Forest route evidence",
      sourceFrame: "frame-036.jpg",
      pageUsage: ["/locations/lighthouse", "/beginner-guide"],
    },
  };
  return {
    archivedTrees: [
      {
        sourceRoot: achievementGalleryRoot,
        archiveRoot: "01-raw/user-provided/achievement-gallery",
        role: "raw",
        status: "archived",
        rights:
          "user-supplied achievement gallery bundle; official game achievement icons may be used editorially for identification, while bundle text and rates require independent verification",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
        metadataForRelative(relativePath) {
          const normalizedPath = relativePath.split(path.sep).join("/");
          if (
            normalizedPath.startsWith("assets/icons/") &&
            mediaType(relativePath) === "image"
          ) {
            return {
              rights:
                "official How to Fish achievement icon supplied in the user-provided gallery bundle; editorial identification use",
              publishability: true,
              pageUsage: ["/achievements"],
            };
          }
          return {};
        },
      },
      {
        sourceRoot: creatureGalleryRoot,
        archiveRoot: "01-raw/user-provided/creature-gallery",
        role: "raw",
        status: "archived",
        rights:
          "user-owned creature encyclopedia captures and offline layout source",
        publishability: true,
        pageUsage: ["/creatures", "/locations/rocks"],
        derivedFrom: null,
      },
      {
        sourceRoot: path.join(desktopRoot, "新手指南"),
        archiveRoot: "01-raw/user-provided/beginner-guide",
        role: "raw",
        status: "archived",
        rights: "user-provided; ownership unconfirmed",
        publishability: false,
        pageUsage: ["guides/beginner"],
        derivedFrom: null,
      },
      {
        sourceRoot: path.join(repoRoot, "research/reference-images/game8"),
        archiveRoot: "03-reference/game8",
        role: "reference",
        status: "archived",
        rights: "third-party Game8 reference-only media",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      {
        sourceRoot: weaponReferenceRoot,
        archiveRoot: "03-reference/how-to-fish-weapons",
        role: "reference",
        status: "archived",
        rights:
          "mixed third-party gameplay captures, community research, and images labeled as official Steam screenshots; reference-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
        metadataForRelative(relativePath) {
          const steamReferences = new Set([
            "assets/assault-rifle-official.jpg",
            "assets/shotgun-official.jpg",
            "assets/steam-weapon-wall.jpg",
          ]);
          const normalizedPath = relativePath.split(path.sep).join("/");
          if (steamReferences.has(normalizedPath)) {
            return {
              rights:
                "supplied as an official Dazed Games / Steam screenshot; provenance not independently established; reference-only",
              publishability: false,
            };
          }
          if (
            normalizedPath.startsWith("assets/") &&
            mediaType(relativePath) === "image"
          ) {
            return {
              rights:
                "third-party gameplay capture; reference-only and not cleared for publication",
              publishability: false,
            };
          }
          return {
            rights:
              "offline community reference compilation containing third-party claims; research-only",
            publishability: false,
          };
        },
      },
      {
        sourceRoot: path.join(repoRoot, "research/video-analysis"),
        archiveRoot: "02-analysis",
        role: "analysis",
        status: "archived",
        rights: "analysis material; review required",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
        metadataForRelative(relativePath) {
          const firstDirectory = relativePath.split(path.sep)[0];
          if (firstDirectory === "island-1") {
            const entity =
              entityFrames[relativePath.slice("island-1/entities/".length)];
            if (entity && relativePath.startsWith("island-1/entities/")) {
              return {
                rights: "clean crop from the user-owned Island 1 recording",
                publishability: true,
                pageUsage: entity.pageUsage,
                derivedFrom: [
                  `asset:02-analysis/island-1/frames/${entity.sourceFrame}`,
                  islandRawAssetId,
                ],
                entity: entity.entity,
                crop: "900x500 at x=250 y=100",
              };
            }
            return {
              rights: "analysis derivative of user-owned Island 1 recording",
              publishability: true,
              pageUsage: ["guides/island-1"],
              derivedFrom: [islandRawAssetId],
            };
          }
          if (firstDirectory === "guide-1") {
            return {
              rights:
                "analysis derivative of uncertain Guide 1 media; research-only",
              publishability: false,
              pageUsage: ["research-only"],
              derivedFrom: guideRawAssetIds,
            };
          }
          if (firstDirectory === "guide-4-5") {
            return {
              rights:
                "analysis derivative of uncertain Guide 4-5 social/player media; research-only",
              publishability: false,
              pageUsage: ["research-only"],
              derivedFrom: [guide45RawAssetId],
            };
          }
          if (firstDirectory === "guide-2") {
            return {
              rights:
                "analysis derivative of third-party Douyin Guide 2 media; watermark, platform UI, and creator subtitles make every frame research-only",
              publishability: false,
              pageUsage: ["research-only"],
              derivedFrom: [guide2RawAssetId],
            };
          }
          if (firstDirectory === "guide-3") {
            return {
              rights:
                "analysis derivative of third-party Douyin Guide 3 media; watermark, platform UI, and creator subtitles make every frame research-only",
              publishability: false,
              pageUsage: ["research-only"],
              derivedFrom: [guide3RawAssetId],
            };
          }
          if (firstDirectory === "forest-full-2026-08-29") {
            return {
              rights:
                "analysis derivative of third-party social Forest full-route media; platform UI and creator subtitles make every frame research-only",
              publishability: false,
              pageUsage: ["research-only"],
              derivedFrom: [forestFullRawAssetId],
            };
          }
          if (firstDirectory === "rocks-full-2026-08-31") {
            return {
              rights:
                "analysis derivative of third-party social Rocks full-route media; creator subtitles and player UI make every frame research-only",
              publishability: false,
              pageUsage: ["research-only"],
              derivedFrom: [rocksFullRawAssetId],
            };
          }
          return {
            rights:
              "new analysis material; rights and publishability require review",
            publishability: false,
            pageUsage: ["research-only"],
            derivedFrom: null,
          };
        },
      },
      {
        sourceRoot: path.join(repoRoot, "public/images"),
        archiveRoot: "05-published/public-images",
        role: "published",
        status: "archived",
        rights: "project-owned original or generated site asset",
        publishability: true,
        pageUsage: ["site-public-assets"],
        derivedFrom: null,
        metadataForRelative(relativePath) {
          const creatureSources = {
            "creatures/encyclopedia-overview.webp":
              "mobalytics-01-overview.png",
            "creatures/encyclopedia-early.webp": "mobalytics-02-early.png",
            "creatures/encyclopedia-standard.webp":
              "mobalytics-03-standard.png",
            "creatures/encyclopedia-professional.webp":
              "mobalytics-04-professional.png",
            "creatures/encyclopedia-scientific.webp":
              "mobalytics-05-scientific.png",
            "creatures/encyclopedia-bosses.webp": "mobalytics-06-bosses.png",
          };
          const normalizedPath = relativePath.split(path.sep).join("/");
          const fieldDiagrams = {
            "guides/forest/forest-route.svg": {
              pageUsage: ["/locations/forest", "/bosses/giant-piranha"],
              seed: "guide-2.seed.json",
              notes: "guide-2",
            },
            "guides/forest/giant-piranha-loop.svg": {
              pageUsage: ["/locations/forest", "/bosses/giant-piranha"],
              seed: "guide-2.seed.json",
              notes: "guide-2",
            },
            "guides/forest/forest-recovery.svg": {
              pageUsage: ["/locations/forest", "/bosses/giant-piranha"],
              seed: "guide-2.seed.json",
              notes: "guide-2",
            },
            "guides/desert/desert-route.svg": {
              pageUsage: ["/locations/desert", "/bosses/pufferfish"],
              seed: "guide-3.seed.json",
              notes: "guide-3",
            },
            "guides/desert/pufferfish-loop.svg": {
              pageUsage: ["/locations/desert", "/bosses/pufferfish"],
              seed: "guide-3.seed.json",
              notes: "guide-3",
            },
            "guides/desert/desert-recovery.svg": {
              pageUsage: ["/locations/desert", "/bosses/pufferfish"],
              seed: "guide-3.seed.json",
              notes: "guide-3",
            },
            "guides/rocks/rocks-field-layout.svg": {
              pageUsage: ["/locations/rocks", "/bosses/albatross"],
              seed: "rocks-full.seed.json",
              notes: "rocks-full-2026-08-31",
            },
            "guides/rocks/rocks-two-boss-loop.svg": {
              pageUsage: ["/locations/rocks", "/bosses/albatross"],
              seed: "rocks-full.seed.json",
              notes: "rocks-full-2026-08-31",
            },
          };
          const fieldDiagram = fieldDiagrams[normalizedPath];
          if (fieldDiagram) {
            return {
              rights:
                "project-owned original editorial field diagram; independently composed from research notes and structured knowledge, not copied from or cropped out of any source frame",
              publishability: true,
              pageUsage: fieldDiagram.pageUsage,
              derivedFrom: [
                `asset:02-analysis/${fieldDiagram.notes}/analysis-notes.md`,
                `asset:04-project/knowledge-seed/${fieldDiagram.seed}`,
              ],
            };
          }
          if (
            normalizedPath.startsWith("achievements/") &&
            normalizedPath.endsWith(".webp")
          ) {
            const sourceName = `${path.basename(normalizedPath, ".webp")}.jpg`;
            return {
              rights:
                "optimized derivative of an official How to Fish achievement icon supplied by the user for editorial identification",
              publishability: true,
              pageUsage: normalizedPath === "achievements/9f978a5ee40c390d66605ee42333628186ccd337.webp"
                ? ["/achievements", "/guides/mutated-whale-handyman", "/bosses/mutated-bowhead-whale"]
                : ["/achievements"],
              derivedFrom: [
                `asset:01-raw/user-provided/achievement-gallery/assets/icons/${sourceName}`,
              ],
            };
          }
          if (normalizedPath.startsWith("guides/rocks/albatross-cover-guide"))
            return { pageUsage: ["/locations/rocks", "/bosses/albatross"] };
          if (normalizedPath.startsWith("guides/volcano/"))
            return {
              pageUsage: [
                "/locations/volcano",
                "/bosses/mutated-bowhead-whale",
                "/guides/mutated-whale-handyman",
              ],
            };
          const sourceName = creatureSources[normalizedPath];
          if (!sourceName) return {};
          return {
            rights:
              "optimized derivative of user-owned creature encyclopedia capture",
            publishability: true,
            pageUsage:
              normalizedPath === "creatures/encyclopedia-professional.webp" ||
              normalizedPath === "creatures/encyclopedia-scientific.webp" ||
              normalizedPath === "creatures/encyclopedia-bosses.webp"
                ? normalizedPath === "creatures/encyclopedia-bosses.webp"
                  ? ["/creatures", "/locations/rocks", "/bosses/giant-piranha", "/bosses/pufferfish", "/bosses/albatross"]
                  : ["/creatures", "/locations/rocks"]
                : ["/creatures"],
            derivedFrom: [
              `asset:01-raw/user-provided/creature-gallery/assets/${sourceName}`,
            ],
          };
        },
      },
    ],
    archivedFiles: [
      {
        sourcePath: path.join(repoRoot, "research/reference-images/README.md"),
        archivePath: "03-reference/game8/README.md",
        role: "reference",
        status: "archived",
        rights: "third-party Game8 reference-only documentation",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      {
        sourcePath: path.join(
          repoRoot,
          "research/source-packets/how-to-fish-p0.md",
        ),
        archivePath: "04-project/source-packets/how-to-fish-p0.md",
        role: "analysis",
        status: "archived",
        rights: "project-owned research source packet",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      ...knowledgeSeedPaths.map((sourcePath) => ({
        sourcePath,
        archivePath: `04-project/knowledge-seed/${path.basename(sourcePath)}`,
        role: "analysis",
        status: "archived",
        rights: "project-owned structured knowledge seed",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom:
          path.basename(sourcePath) === "weapons.seed.json"
            ? ["asset:03-reference/how-to-fish-weapons/assets/weapons.js"]
            : path.basename(sourcePath) === "guide-4-5.seed.json"
              ? [
                  "asset:02-analysis/guide-4-5/analysis-notes.md",
                  guide45RawAssetId,
                ]
              : path.basename(sourcePath) === "guide-2.seed.json"
                ? [
                    "asset:02-analysis/guide-2/analysis-notes.md",
                    guide2RawAssetId,
                  ]
                : path.basename(sourcePath) === "guide-3.seed.json"
                  ? [
                      "asset:02-analysis/guide-3/analysis-notes.md",
                      guide3RawAssetId,
                    ]
                  : path.basename(sourcePath) === "forest-full.seed.json"
                    ? [
                        "asset:02-analysis/forest-full-2026-08-29/analysis-notes.md",
                        forestFullRawAssetId,
                      ]
                    : path.basename(sourcePath) === "rocks-full.seed.json"
                      ? [
                          "asset:02-analysis/rocks-full-2026-08-31/analysis-notes.md",
                          rocksFullRawAssetId,
                        ]
                      : path.basename(sourcePath) === "mixed-video-guides.seed.json"
                        ? [
                            "asset:02-analysis/mixed-guides-2026-08-31/analysis-notes.md",
                            ...mixedGuideRawAssetIds,
                          ]
                        : path.basename(sourcePath) === "practical-tips.seed.json"
                          ? [
                              "asset:02-analysis/practical-tips-2026-09-01/analysis-notes.md",
                              practicalTipsRawAssetId,
                            ]
              : ["asset:04-project/source-packets/how-to-fish-p0.md"],
      })),
    ],
    sourceOnlyFiles: [
      {
        sourcePath: islandVideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights: "user-owned recording retained only at original path",
        publishability: false,
        pageUsage: ["guides/island-1"],
        derivedFrom: null,
      },
      ...guideVideoPaths.map((sourcePath) => ({
        sourcePath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "uncertain social or phone UI media; retained only at original path",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      })),
      {
        sourcePath: guide45VideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "uncertain social or phone UI media; retained only at original path; Guide 4-5 frames are research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      {
        sourcePath: guide2VideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "third-party Douyin screen recording retained only at original path; every derivative is research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      {
        sourcePath: guide3VideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "third-party Douyin screen recording retained only at original path; every derivative is research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      {
        sourcePath: forestFullVideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "third-party social screen recording retained only at original path; every derivative is research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      {
        sourcePath: rocksFullVideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "third-party social screen recording retained only at original path; every derivative is research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
      ...mixedGuideVideoPaths.map((sourcePath) => ({
        sourcePath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "third-party social or player screen recording retained only at original path; every direct frame is research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      })),
      {
        sourcePath: practicalTipsVideoPath,
        mediaType: "video",
        role: "raw",
        status: "analyzed/source-only",
        rights:
          "user-supplied screen recording retained only at original path; direct frames contain creator captions/player UI and remain research-only",
        publishability: false,
        pageUsage: ["research-only"],
        derivedFrom: null,
      },
    ],
    pendingFiles: [],
  };
}

async function buildRecords() {
  const groups = sourceGroups();
  const records = [];
  for (const group of groups.archivedTrees) {
    const sourceRoot = await existingRealDirectory(
      group.sourceRoot,
      "archived source tree",
    );
    const sourceFiles = await filesUnder(sourceRoot, "archived source tree");
    await assertNoVideosInArchivedTree(sourceRoot, sourceFiles);
    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(sourceRoot, sourcePath);
      const metadata = group.metadataForRelative?.(relativePath) ?? {};
      records.push({
        sourcePath,
        archivePath: path.posix.join(
          group.archiveRoot,
          ...relativePath.split(path.sep),
        ),
        mediaType: mediaType(sourcePath),
        role: group.role,
        status: group.status,
        rights: group.rights,
        publishability: group.publishability,
        pageUsage: group.pageUsage,
        derivedFrom: group.derivedFrom,
        ...metadata,
      });
    }
  }
  records.push(
    ...groups.archivedFiles.map((file) => ({
      ...file,
      mediaType: mediaType(file.sourcePath),
    })),
  );
  for (const file of groups.archivedFiles) {
    if (mediaType(file.sourcePath) === "video") {
      throw new Error(
        `Video media must be explicitly registered as source-only, not archived: ${file.sourcePath}`,
      );
    }
  }
  for (const file of groups.sourceOnlyFiles) {
    if (mediaType(file.sourcePath) !== "video")
      throw new Error(
        `Source-only registration must be a video: ${file.sourcePath}`,
      );
    records.push({ ...file, archivePath: null });
  }
  for (const sourcePath of groups.pendingFiles) {
    if (mediaType(sourcePath) !== "video")
      throw new Error(`Pending registration must be a video: ${sourcePath}`);
    records.push({
      sourcePath,
      archivePath: null,
      mediaType: mediaType(sourcePath),
      role: "pending",
      status: "pending/unreviewed",
      rights: "unreviewed; rights and publishability not established",
      publishability: false,
      pageUsage: ["none"],
      derivedFrom: null,
    });
  }
  return records.sort((left, right) =>
    compareStrings(left.sourcePath, right.sourcePath),
  );
}

async function copyWithCloneOrSmallFallback(
  sourcePath,
  destinationPath,
  sourceBytes,
) {
  try {
    await fs.copyFile(
      sourcePath,
      destinationPath,
      constants.COPYFILE_FICLONE_FORCE,
    );
  } catch (cloneError) {
    if (sourceBytes > maxFullCopyBytes) {
      throw new Error(
        `Copy-on-write cloning is required for files larger than 100 MB: ${sourcePath}. ${cloneError.message}`,
      );
    }
    try {
      const destinationStat = await fs.lstat(destinationPath);
      if (destinationStat.isSymbolicLink())
        throw new Error(`Archive destination is a symlink: ${destinationPath}`);
      await fs.rm(destinationPath, { force: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await fs.copyFile(sourcePath, destinationPath);
  }
}

function versionedArchivePath(archivePath, sha256Value) {
  const parsed = path.posix.parse(archivePath);
  return path.posix.join(
    parsed.dir,
    "versions",
    sha256Value.slice(0, 16),
    parsed.base,
  );
}

async function archiveDestinationState(destinationPath, record) {
  try {
    const destinationStat = await fs.lstat(destinationPath);
    if (destinationStat.isSymbolicLink())
      throw new Error(`Archive destination is a symlink: ${destinationPath}`);
    if (!destinationStat.isFile())
      throw new Error(`Archive collision is not a file: ${destinationPath}`);
    const destinationHash = await sha256(destinationPath);
    return destinationStat.size === record.bytes &&
      destinationHash === record.sha256
      ? "matching"
      : "different";
  } catch (error) {
    if (error.code === "ENOENT") return "missing";
    throw error;
  }
}

async function archiveRecord(record) {
  const sourceStat = record.archivePath
    ? await fs.lstat(record.sourcePath)
    : (await safeSourceOnlyFile(record.sourcePath)).stat;
  if (sourceStat.isSymbolicLink())
    throw new Error(
      `Source is a symlink and cannot be archived: ${record.sourcePath}`,
    );
  if (!sourceStat.isFile())
    throw new Error(`Source is not a file: ${record.sourcePath}`);
  record.bytes = sourceStat.size;
  record.sha256 = await sha256(record.sourcePath);
  record.fingerprint = `sha256:${record.sha256}`;
  if (!record.archivePath) return record;
  record.logicalArchivePath ??= record.archivePath;
  if (record.mediaType === "video")
    throw new Error(
      `Video media cannot be copied into the asset archive: ${record.sourcePath}`,
    );

  let destinationPath = await safeArchiveDestination(
    currentArchiveRoot,
    record.archivePath,
  );
  if (isWithin(destinationPath, path.join(currentArchiveRoot, "00-catalog"))) {
    throw new Error(
      `Refusing to archive into catalog space: ${record.archivePath}`,
    );
  }
  let destinationState = await archiveDestinationState(destinationPath, record);
  if (destinationState === "different") {
    record.archivePath = versionedArchivePath(
      record.archivePath,
      record.sha256,
    );
    destinationPath = await safeArchiveDestination(
      currentArchiveRoot,
      record.archivePath,
    );
    destinationState = await archiveDestinationState(destinationPath, record);
  }
  if (destinationState === "missing") {
    await copyWithCloneOrSmallFallback(
      record.sourcePath,
      destinationPath,
      record.bytes,
    );
    const destinationHash = await sha256(destinationPath);
    if (destinationHash !== record.sha256)
      throw new Error(
        `Checksum mismatch immediately after archival: ${destinationPath}`,
      );
  }
  return record;
}

async function collectHistoricalRecords(
  currentRecords,
  archiveRoot = currentArchiveRoot,
) {
  const historicalRecords = [];
  for (const currentRecord of currentRecords.filter(
    (record) => record.archivePath,
  )) {
    const logicalArchivePath =
      currentRecord.logicalArchivePath ?? currentRecord.archivePath;
    const parsed = path.posix.parse(logicalArchivePath);
    const candidates = [logicalArchivePath];
    const versionsDirectory = path.resolve(
      archiveRoot,
      ...path.posix.join(parsed.dir, "versions").split("/"),
    );
    try {
      await assertNoSymlinksInExistingPath(
        versionsDirectory,
        "archive history directory",
      );
      const entries = await fs.readdir(versionsDirectory);
      for (const entry of entries.sort(compareStrings)) {
        const versionDirectory = path.join(versionsDirectory, entry);
        const versionStat = await fs.lstat(versionDirectory);
        if (versionStat.isSymbolicLink())
          throw new Error(
            `archive history directory contains a symlink: ${versionDirectory}`,
          );
        if (!versionStat.isDirectory()) continue;
        const candidatePath = path.join(versionDirectory, parsed.base);
        try {
          const candidateStat = await fs.lstat(candidatePath);
          if (candidateStat.isSymbolicLink())
            throw new Error(
              `archive history file is a symlink: ${candidatePath}`,
            );
          if (candidateStat.isFile())
            candidates.push(
              path.posix.join(parsed.dir, "versions", entry, parsed.base),
            );
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    for (const archivePath of [...new Set(candidates)].sort(compareStrings)) {
      if (archivePath === currentRecord.archivePath) continue;
      try {
        const { targetPath, stat } = await safeExistingArchiveFile(
          archiveRoot,
          archivePath,
        );
        const hash = await sha256(targetPath);
        historicalRecords.push({
          id: `asset-history:${archivePath}`,
          sourcePath: null,
          archivePath,
          logicalArchivePath,
          mediaType: currentRecord.mediaType,
          role: currentRecord.role,
          status: "archived/superseded",
          rights: currentRecord.rights,
          publishability: currentRecord.publishability,
          pageUsage: currentRecord.pageUsage,
          sha256: hash,
          fingerprint: `sha256:${hash}`,
          bytes: stat.size,
          derivedFrom: currentRecord.derivedFrom,
          entity: currentRecord.entity,
          crop: currentRecord.crop,
          historicalProvenance: {
            sourcePath: currentRecord.sourcePath,
            logicalArchivePath,
          },
          supersededBy: assetId(currentRecord),
        });
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  return historicalRecords.sort((left, right) =>
    compareStrings(left.archivePath, right.archivePath),
  );
}

function csvEscape(value) {
  const string = Array.isArray(value)
    ? JSON.stringify(value)
    : value == null
      ? ""
      : String(value);
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

async function writeTextAtomically(targetPath, contents) {
  const relativeTarget = path
    .relative(currentArchiveRoot, targetPath)
    .split(path.sep)
    .join("/");
  const safeTarget = await safeArchiveDestination(
    currentArchiveRoot,
    relativeTarget,
  );
  const temporaryPath = `${safeTarget}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, contents, "utf8");
  await fs.rename(temporaryPath, safeTarget);
}

function catalogReadme() {
  return `# Asset library catalog\n\nThis directory is generated by \`scripts/build-asset-library.mjs\`. Do not edit manifest or checksum files by hand. Originals remain at the absolute \`sourcePath\` recorded in the manifest; the library is a copy-only archive. Changed-source history is retained as \`archived/superseded\` records and included in checksums. \`knowledge-manifest.json\` is the evidence-bound entity layer, sourced from the archived knowledge seed. Run the tool with \`--verify\` to validate current and historical archived checksums, source-only video fingerprints, and knowledge asset references.\n`;
}

const requiredFieldDiagrams = new Map([
  ["asset:05-published/public-images/guides/forest/forest-route.svg", ["/locations/forest", "/bosses/giant-piranha"]],
  ["asset:05-published/public-images/guides/forest/giant-piranha-loop.svg", ["/locations/forest", "/bosses/giant-piranha"]],
  ["asset:05-published/public-images/guides/forest/forest-recovery.svg", ["/locations/forest", "/bosses/giant-piranha"]],
  ["asset:05-published/public-images/guides/desert/desert-route.svg", ["/locations/desert", "/bosses/pufferfish"]],
  ["asset:05-published/public-images/guides/desert/pufferfish-loop.svg", ["/locations/desert", "/bosses/pufferfish"]],
  ["asset:05-published/public-images/guides/desert/desert-recovery.svg", ["/locations/desert", "/bosses/pufferfish"]],
]);

function assertFieldDiagramPublicationMetadata(records) {
  const byId = new Map(records.map((record) => [record.id, record]));
  for (const [id, requiredPages] of requiredFieldDiagrams) {
    const record = byId.get(id);
    if (!record) throw new Error(`Missing required published field diagram: ${id}`);
    if (record.publishability !== true)
      throw new Error(`Field diagram must be publishable: ${id}`);
    if (
      !Array.isArray(record.pageUsage) ||
      requiredPages.some((page) => !record.pageUsage.includes(page))
    )
      throw new Error(`Field diagram has incorrect pageUsage: ${id}`);
    if (!Array.isArray(record.derivedFrom) || record.derivedFrom.length === 0)
      throw new Error(`Field diagram requires honest non-null lineage: ${id}`);
    if (
      !record.rights?.includes("project-owned original editorial field diagram") ||
      !record.rights?.includes("not copied from or cropped out of any source frame")
    )
      throw new Error(`Field diagram requires explicit original-art rights: ${id}`);
  }
}

function knowledgeColumns() {
  return [
    "id",
    "category",
    "canonicalName",
    "aliases",
    "imageAssetIds",
    "evidenceAssetIds",
    "sourceVideo",
    "sourceVideoAssetId",
    "timestamp",
    "attackPattern",
    "salePrice",
    "buyPrice",
    "currency",
    "priceContext",
    "unlockUse",
    "verificationStatus",
    "verificationDate",
    "observations",
    "notes",
    "pageUsage",
  ];
}

const knowledgeCategories = new Set([
  "island/location",
  "weapon",
  "NPC",
  "fish/creature",
  "boss",
  "weapon_attachment",
  "bait",
  "item",
  "shop",
]);
const knowledgeStatuses = new Set(["verified", "unverified"]);
const observationStatuses = new Set(["verified", "reference-only"]);
const requiredKnowledgeFields = [
  "id",
  "category",
  "canonicalName",
  "aliases",
  "imageAssetIds",
  "evidenceAssetIds",
  "sourceVideo",
  "sourceVideoAssetId",
  "timestamp",
  "attackPattern",
  "salePrice",
  "buyPrice",
  "currency",
  "priceContext",
  "unlockUse",
  "verificationStatus",
  "verificationDate",
  "notes",
  "pageUsage",
];

function assertNullableString(value, field, entityId) {
  if (value !== null && typeof value !== "string")
    throw new Error(
      `Knowledge entity ${entityId} has invalid ${field}; use a string or null.`,
    );
}

function validateKnowledgeSchema(knowledge) {
  if (
    !knowledge ||
    typeof knowledge !== "object" ||
    !Array.isArray(knowledge.entities)
  ) {
    throw new Error("Knowledge seed must contain an entities array.");
  }
  const ids = new Set();
  for (const entity of knowledge.entities) {
    if (!entity || typeof entity !== "object")
      throw new Error("Knowledge entities must be objects.");
    for (const field of requiredKnowledgeFields) {
      if (!Object.hasOwn(entity, field))
        throw new Error(`Knowledge entity is missing required field: ${field}`);
    }
    if (
      typeof entity.id !== "string" ||
      entity.id.length === 0 ||
      ids.has(entity.id)
    )
      throw new Error(
        `Knowledge entity has an invalid or duplicate id: ${entity.id}`,
      );
    ids.add(entity.id);
    if (!knowledgeCategories.has(entity.category))
      throw new Error(
        `Knowledge entity ${entity.id} has unsupported category: ${entity.category}`,
      );
    if (!knowledgeStatuses.has(entity.verificationStatus))
      throw new Error(
        `Knowledge entity ${entity.id} has unsupported verificationStatus: ${entity.verificationStatus}`,
      );
    if (
      typeof entity.canonicalName !== "string" ||
      entity.canonicalName.length === 0
    )
      throw new Error(
        `Knowledge entity ${entity.id} requires a canonicalName.`,
      );
    for (const field of [
      "aliases",
      "imageAssetIds",
      "evidenceAssetIds",
      "pageUsage",
    ]) {
      if (
        !Array.isArray(entity[field]) ||
        entity[field].some(
          (value) => typeof value !== "string" || value.length === 0,
        )
      ) {
        throw new Error(`Knowledge entity ${entity.id} has invalid ${field}.`);
      }
    }
    for (const field of [
      "sourceVideo",
      "sourceVideoAssetId",
      "timestamp",
      "attackPattern",
      "currency",
      "priceContext",
      "unlockUse",
      "verificationDate",
      "notes",
    ]) {
      assertNullableString(entity[field], field, entity.id);
    }
    for (const field of ["salePrice", "buyPrice"]) {
      if (entity[field] !== null && typeof entity[field] !== "number")
        throw new Error(
          `Knowledge entity ${entity.id} has invalid ${field}; use a number or null.`,
        );
    }
    if (entity.observations !== undefined) {
      if (!Array.isArray(entity.observations))
        throw new Error(
          `Knowledge entity ${entity.id} has invalid observations.`,
        );
      for (const observation of entity.observations) {
        if (!observation || typeof observation !== "object")
          throw new Error(
            `Knowledge entity ${entity.id} has a non-object observation.`,
          );
        for (const field of [
          "field",
          "value",
          "sourceAssetIds",
          "sourceUrls",
          "status",
          "observedAt",
          "context",
        ]) {
          if (!Object.hasOwn(observation, field))
            throw new Error(
              `Knowledge entity ${entity.id} observation is missing ${field}.`,
            );
        }
        if (
          typeof observation.field !== "string" ||
          observation.field.length === 0 ||
          observation.value === null ||
          observation.value === undefined
        ) {
          throw new Error(
            `Knowledge entity ${entity.id} observation requires a field and value.`,
          );
        }
        for (const field of ["sourceAssetIds", "sourceUrls"]) {
          if (
            !Array.isArray(observation[field]) ||
            observation[field].some(
              (value) => typeof value !== "string" || value.length === 0,
            )
          ) {
            throw new Error(
              `Knowledge entity ${entity.id} observation has invalid ${field}.`,
            );
          }
        }
        if (!observationStatuses.has(observation.status))
          throw new Error(
            `Knowledge entity ${entity.id} observation has unsupported status: ${observation.status}`,
          );
        if (
          typeof observation.observedAt !== "string" ||
          observation.observedAt.length === 0 ||
          typeof observation.context !== "string" ||
          observation.context.length === 0
        ) {
          throw new Error(
            `Knowledge entity ${entity.id} observation requires observedAt and context strings.`,
          );
        }
        if (
          observation.sourceAssetIds.length === 0 &&
          observation.sourceUrls.length === 0
        ) {
          throw new Error(
            `Knowledge entity ${entity.id} observation requires a durable asset or source URL.`,
          );
        }
      }
    }
    if (entity.verificationStatus === "verified") {
      const hasDurableEvidence =
        entity.imageAssetIds.length > 0 ||
        entity.evidenceAssetIds.length > 0 ||
        entity.sourceVideoAssetId !== null;
      if (!hasDurableEvidence)
        throw new Error(
          `Verified knowledge entity ${entity.id} requires a durable image, evidence, or sourceVideoAssetId.`,
        );
    }
    if (entity.verificationStatus === "unverified") {
      for (const field of [
        "attackPattern",
        "salePrice",
        "buyPrice",
        "currency",
        "priceContext",
        "unlockUse",
        "verificationDate",
      ]) {
        if (entity[field] !== null)
          throw new Error(
            `Unverified knowledge entity ${entity.id} must set ${field} to null.`,
          );
      }
      if (
        entity.pageUsage.length === 0 ||
        entity.pageUsage.some((usage) => usage !== "research-only")
      ) {
        throw new Error(
          `Unverified knowledge entity ${entity.id} must use only research-only pageUsage.`,
        );
      }
    }
  }
  if (!Array.isArray(knowledge.coverageGaps ?? []))
    throw new Error("Knowledge coverageGaps must be an array.");
  for (const gap of knowledge.coverageGaps ?? []) {
    if (
      !gap ||
      gap.status !== "unverified" ||
      typeof gap.area !== "string" ||
      typeof gap.details !== "string"
    ) {
      throw new Error(
        "Knowledge coverage gaps must have area, details, and status: unverified.",
      );
    }
  }
}

function assertKnowledgeReferences(knowledge, assets) {
  validateKnowledgeSchema(knowledge);
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  for (const entity of knowledge.entities) {
    const observationAssetIds = (entity.observations ?? []).flatMap(
      (observation) => observation.sourceAssetIds ?? [],
    );
    for (const referencedId of [
      ...(entity.imageAssetIds ?? []),
      ...(entity.evidenceAssetIds ?? []),
      ...(entity.sourceVideoAssetId ? [entity.sourceVideoAssetId] : []),
      ...observationAssetIds,
    ]) {
      const referencedAsset = assetsById.get(referencedId);
      if (!referencedAsset)
        throw new Error(
          `Knowledge entity ${entity.id} references an unknown asset ID: ${referencedId}`,
        );
      if (referencedAsset.status === "archived/superseded") {
        throw new Error(
          `Knowledge entity ${entity.id} references a superseded asset ID: ${referencedId}`,
        );
      }
    }
  }
}

async function writeKnowledgeCatalog(archiveRoot, assets) {
  const seeds = await Promise.all(
    knowledgeSeedPaths.map(async (seedPath) => ({
      seedPath,
      seed: JSON.parse(await fs.readFile(seedPath, "utf8")),
    })),
  );
  const entities = seeds
    .flatMap(({ seed }) => seed.entities)
    .sort((left, right) => compareStrings(left.id, right.id));
  const knowledge = {
    schemaVersion: Math.max(...seeds.map(({ seed }) => seed.schemaVersion)),
    sourceSeedArchivePaths: seeds.map(
      ({ seedPath }) =>
        assets.find((asset) => asset.sourcePath === seedPath)?.archivePath ??
        null,
    ),
    scopes: seeds.map(({ seed }) => seed.scope),
    entities,
    coverageGaps: seeds.flatMap(({ seed }) => seed.coverageGaps ?? []),
  };
  assertKnowledgeReferences(knowledge, assets);
  const columns = knowledgeColumns();
  const csv =
    [
      columns.join(","),
      ...entities.map((entity) =>
        columns.map((column) => csvEscape(entity[column])).join(","),
      ),
    ].join("\n") + "\n";
  await Promise.all([
    writeTextAtomically(
      path.join(archiveRoot, "00-catalog/knowledge-manifest.json"),
      `${JSON.stringify(knowledge, null, 2)}\n`,
    ),
    writeTextAtomically(
      path.join(archiveRoot, "00-catalog/knowledge-manifest.csv"),
      csv,
    ),
  ]);
}

async function writeCatalog(archiveRoot, records) {
  const sorted = records
    .map((record) => ({ id: assetId(record), ...record }))
    .sort((left, right) =>
      compareStrings(
        left.archivePath ?? left.sourcePath,
        right.archivePath ?? right.sourcePath,
      ),
    );
  assertFieldDiagramPublicationMetadata(sorted);
  const manifest = {
    schemaVersion: 1,
    run: { generatedAt: new Date().toISOString(), archiveRoot },
    assets: sorted,
  };
  const columns = [
    "id",
    "sourcePath",
    "archivePath",
    "logicalArchivePath",
    "mediaType",
    "role",
    "status",
    "rights",
    "publishability",
    "pageUsage",
    "sha256",
    "fingerprint",
    "bytes",
    "derivedFrom",
    "entity",
    "crop",
    "historicalProvenance",
    "supersededBy",
  ];
  const csv =
    [
      columns.join(","),
      ...sorted.map((record) =>
        columns.map((column) => csvEscape(record[column])).join(","),
      ),
    ].join("\n") + "\n";
  const checksums =
    sorted
      .filter((record) => record.archivePath)
      .map((record) => `${record.sha256}  ${record.archivePath}`)
      .join("\n") + "\n";
  await Promise.all([
    writeTextAtomically(
      path.join(archiveRoot, "00-catalog/asset-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
    writeTextAtomically(
      path.join(archiveRoot, "00-catalog/asset-manifest.csv"),
      csv,
    ),
    writeTextAtomically(
      path.join(archiveRoot, "00-catalog/checksums.sha256"),
      checksums,
    ),
    writeTextAtomically(
      path.join(archiveRoot, "00-catalog/README.md"),
      catalogReadme(),
    ),
  ]);
  return sorted;
}

function summarize(records) {
  const roles = {};
  const statuses = {};
  for (const record of records) {
    roles[record.role] = (roles[record.role] ?? 0) + 1;
    statuses[record.status] = (statuses[record.status] ?? 0) + 1;
  }
  return {
    total: records.length,
    archived: records.filter((record) => record.archivePath).length,
    pending: records.filter((record) => !record.archivePath).length,
    roles,
    statuses,
  };
}

async function verifyArchive(archiveRoot) {
  const manifestPath = path.join(archiveRoot, "00-catalog/asset-manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest.assets))
    throw new Error(`Invalid manifest assets array: ${manifestPath}`);
  const failures = [];
  for (const record of manifest.assets) {
    try {
      if (record.archivePath) {
        const { targetPath: archivePath, stat } = await safeExistingArchiveFile(
          archiveRoot,
          record.archivePath,
        );
        if (stat.size !== record.bytes)
          throw new Error(
            `byte count differs (${stat.size} != ${record.bytes})`,
          );
        if ((await sha256(archivePath)) !== record.sha256)
          throw new Error("checksum differs");
      } else {
        const { stat } = await safeSourceOnlyFile(record.sourcePath);
        if (stat.size !== record.bytes)
          throw new Error(
            `source byte count differs (${stat.size} != ${record.bytes})`,
          );
        if ((await sha256(record.sourcePath)) !== record.sha256)
          throw new Error("source checksum differs");
        if (
          record.fingerprint &&
          record.fingerprint !== `sha256:${record.sha256}`
        )
          throw new Error("source fingerprint differs");
      }
    } catch (error) {
      failures.push({ id: record.id, error: error.message });
    }
  }
  try {
    const knowledge = JSON.parse(
      await fs.readFile(
        path.join(archiveRoot, "00-catalog/knowledge-manifest.json"),
        "utf8",
      ),
    );
    assertKnowledgeReferences(knowledge, manifest.assets);
  } catch (error) {
    failures.push({ id: "knowledge-manifest", error: error.message });
  }
  const summary = {
    ok: failures.length === 0,
    ...summarize(manifest.assets),
    failures,
  };
  console.log(JSON.stringify(summary));
  if (failures.length) process.exitCode = 1;
}

let currentArchiveRoot;
let currentDesktopRoot;

async function main() {
  const { archiveRoot, verify } = parseArgs(process.argv.slice(2));
  assertSafeArchiveRoot(archiveRoot);
  currentDesktopRoot = await existingRealDirectory(
    desktopRoot,
    "Desktop how to fish root",
  );
  currentArchiveRoot = verify
    ? await existingRealDirectory(archiveRoot, "archive root")
    : await prepareArchiveRoot(archiveRoot);
  if (verify) return verifyArchive(currentArchiveRoot);
  await Promise.all([
    safeArchiveDirectory(currentArchiveRoot, "00-catalog"),
    safeArchiveDirectory(
      currentArchiveRoot,
      "01-raw/user-provided/beginner-guide",
    ),
    safeArchiveDirectory(
      currentArchiveRoot,
      "01-raw/user-provided/creature-gallery",
    ),
    safeArchiveDirectory(currentArchiveRoot, "02-analysis/island-1"),
    safeArchiveDirectory(currentArchiveRoot, "02-analysis/guide-1"),
    safeArchiveDirectory(currentArchiveRoot, "03-reference/game8"),
    safeArchiveDirectory(
      currentArchiveRoot,
      "03-reference/how-to-fish-weapons",
    ),
    safeArchiveDirectory(currentArchiveRoot, "04-project/source-packets"),
    safeArchiveDirectory(currentArchiveRoot, "04-project/knowledge-seed"),
    safeArchiveDirectory(currentArchiveRoot, "05-published/public-images"),
  ]);
  const records = await buildRecords();
  for (const record of records) await archiveRecord(record);
  const historicalRecords = await collectHistoricalRecords(records);
  const catalogRecords = await writeCatalog(currentArchiveRoot, [
    ...records,
    ...historicalRecords,
  ]);
  await writeKnowledgeCatalog(currentArchiveRoot, catalogRecords);
  console.log(JSON.stringify({ ok: true, ...summarize(catalogRecords) }));
}

export {
  assertFieldDiagramPublicationMetadata,
  assertKnowledgeReferences,
  assertNoVideosInArchivedTree,
  assertNoSymlinksInExistingPath,
  collectHistoricalRecords,
  safeArchiveDestination,
  safeSourceOnlyFile,
  validateKnowledgeSchema,
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
