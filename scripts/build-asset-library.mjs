#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { constants, createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktopRoot = '/Users/wanglu/Desktop/how to fish';
const weaponReferenceRoot = '/Users/wanglu/Documents/Codex/2026-08-28/ho/outputs/how-to-fish-weapons';
const maxFullCopyBytes = 100 * 1024 * 1024;
const knowledgeSeedPaths = [
  path.join(repoRoot, 'research/asset-knowledge/first-island.seed.json'),
  path.join(repoRoot, 'research/asset-knowledge/weapons.seed.json'),
];

function usage() {
  return 'Usage: node scripts/build-asset-library.mjs --archive-root <absolute-path> [--verify]';
}

function parseArgs(args) {
  let archiveRoot;
  let verify = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--archive-root') {
      archiveRoot = args[index + 1];
      index += 1;
    } else if (arg === '--verify') {
      verify = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!archiveRoot) throw new Error(`Missing --archive-root. ${usage()}`);
  if (!path.isAbsolute(archiveRoot)) throw new Error('--archive-root must be an absolute path.');
  return { archiveRoot: path.resolve(archiveRoot), verify };
}

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function assertSafeArchiveRoot(archiveRoot) {
  if (isWithin(archiveRoot, repoRoot)) {
    throw new Error('The asset archive must be outside this repository, so it cannot archive itself.');
  }
  const sourceRoots = [
    path.join(desktopRoot, '新手指南'),
    path.join(desktopRoot, '第一座岛'),
    path.join(desktopRoot, '攻略1'),
    weaponReferenceRoot,
  ];
  for (const sourceRoot of sourceRoots) {
    if (isWithin(archiveRoot, sourceRoot)) {
      throw new Error(`The asset archive cannot be inside a source directory: ${sourceRoot}`);
    }
  }
}

async function assertNoSymlinksInExistingPath(targetPath, label) {
  const parsed = path.parse(targetPath);
  let cursor = parsed.root;
  const segments = targetPath.slice(parsed.root.length).split(path.sep).filter(Boolean);
  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    try {
      const stat = await fs.lstat(cursor);
      if (stat.isSymbolicLink()) throw new Error(`${label} contains a symlink: ${cursor}`);
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
  }
}

async function nearestExistingAncestor(targetPath, label) {
  let cursor = targetPath;
  while (true) {
    try {
      const stat = await fs.lstat(cursor);
      if (stat.isSymbolicLink()) throw new Error(`${label} contains a symlink: ${cursor}`);
      if (!stat.isDirectory()) throw new Error(`${label} ancestor is not a directory: ${cursor}`);
      return cursor;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(cursor);
      if (parent === cursor) throw new Error(`No existing ancestor found for ${label}: ${targetPath}`);
      cursor = parent;
    }
  }
}

async function existingRealDirectory(directoryPath, label) {
  await assertNoSymlinksInExistingPath(directoryPath, label);
  const stat = await fs.lstat(directoryPath);
  if (stat.isSymbolicLink()) throw new Error(`${label} is a symlink: ${directoryPath}`);
  if (!stat.isDirectory()) throw new Error(`${label} is not a directory: ${directoryPath}`);
  return fs.realpath(directoryPath);
}

async function prepareArchiveRoot(archiveRoot) {
  await assertNoSymlinksInExistingPath(archiveRoot, 'archive root');
  const ancestor = await nearestExistingAncestor(archiveRoot, 'archive root');
  const actualAncestor = await fs.realpath(ancestor);
  const remainingPath = path.relative(ancestor, archiveRoot);
  const prospectiveRoot = path.resolve(actualAncestor, remainingPath);
  if (!isWithin(prospectiveRoot, actualAncestor)) throw new Error('Archive root escapes its nearest existing ancestor.');
  await fs.mkdir(archiveRoot, { recursive: true });
  return existingRealDirectory(archiveRoot, 'archive root');
}

async function safeArchiveDestination(archiveRoot, archivePath) {
  if (!archivePath || path.posix.isAbsolute(archivePath) || archivePath.split('/').includes('..')) {
    throw new Error(`Invalid archive-relative path: ${archivePath}`);
  }
  const destinationPath = path.resolve(archiveRoot, ...archivePath.split('/'));
  if (!isWithin(destinationPath, archiveRoot)) throw new Error(`Archive path escapes archive root: ${archivePath}`);
  const destinationParent = path.dirname(destinationPath);
  await assertNoSymlinksInExistingPath(destinationParent, 'archive destination parent');
  await fs.mkdir(destinationParent, { recursive: true });
  const actualParent = await existingRealDirectory(destinationParent, 'archive destination parent');
  if (!isWithin(actualParent, archiveRoot)) throw new Error(`Archive destination parent escapes archive root: ${destinationParent}`);
  try {
    const destinationStat = await fs.lstat(destinationPath);
    if (destinationStat.isSymbolicLink()) throw new Error(`Archive destination is a symlink: ${destinationPath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return destinationPath;
}

async function safeArchiveDirectory(archiveRoot, relativeDirectory) {
  if (!relativeDirectory || path.posix.isAbsolute(relativeDirectory) || relativeDirectory.split('/').includes('..')) {
    throw new Error(`Invalid archive-relative directory: ${relativeDirectory}`);
  }
  const directoryPath = path.resolve(archiveRoot, ...relativeDirectory.split('/'));
  if (!isWithin(directoryPath, archiveRoot)) throw new Error(`Archive directory escapes archive root: ${relativeDirectory}`);
  await assertNoSymlinksInExistingPath(directoryPath, 'archive directory');
  await fs.mkdir(directoryPath, { recursive: true });
  const actualDirectory = await existingRealDirectory(directoryPath, 'archive directory');
  if (!isWithin(actualDirectory, archiveRoot)) throw new Error(`Archive directory escapes archive root: ${relativeDirectory}`);
  return actualDirectory;
}

async function safeExistingArchiveFile(archiveRoot, archivePath) {
  if (!archivePath || path.posix.isAbsolute(archivePath) || archivePath.split('/').includes('..')) {
    throw new Error(`Invalid archive-relative path: ${archivePath}`);
  }
  const targetPath = path.resolve(archiveRoot, ...archivePath.split('/'));
  if (!isWithin(targetPath, archiveRoot)) throw new Error(`Archive path escapes archive root: ${archivePath}`);
  await assertNoSymlinksInExistingPath(targetPath, 'archive file');
  const stat = await fs.lstat(targetPath);
  if (stat.isSymbolicLink()) throw new Error(`Archive file is a symlink: ${targetPath}`);
  if (!stat.isFile()) throw new Error(`Archive path is not a file: ${targetPath}`);
  const actualFile = await fs.realpath(targetPath);
  if (!isWithin(actualFile, archiveRoot)) throw new Error(`Archive file escapes archive root: ${targetPath}`);
  return { targetPath, stat };
}

async function safeSourceOnlyFile(sourcePath, desktopRoot = currentDesktopRoot) {
  const actualDesktopRoot = await existingRealDirectory(desktopRoot, 'Desktop how to fish root');
  await assertNoSymlinksInExistingPath(sourcePath, 'source-only video');
  const stat = await fs.lstat(sourcePath);
  if (stat.isSymbolicLink()) throw new Error(`source-only video is a symlink: ${sourcePath}`);
  if (!stat.isFile()) throw new Error(`source-only video is not a file: ${sourcePath}`);
  const actualSource = await fs.realpath(sourcePath);
  if (!isWithin(actualSource, actualDesktopRoot)) throw new Error(`source-only video escapes Desktop how to fish root: ${sourcePath}`);
  return { sourcePath: actualSource, stat };
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function filesUnder(root, label = 'archived source tree') {
  await existingRealDirectory(root, label);
  const entries = await fs.readdir(root);
  const nested = await Promise.all(entries.map(async (name) => {
    const absolutePath = path.join(root, name);
    const stat = await fs.lstat(absolutePath);
    if (stat.isSymbolicLink()) throw new Error(`${label} contains a symlink: ${absolutePath}`);
    if (stat.isDirectory()) return filesUnder(absolutePath, label);
    if (stat.isFile()) return [absolutePath];
    return [];
  }));
  return nested.flat().sort(compareStrings);
}

async function assertNoVideosInArchivedTree(sourceRoot, sourceFiles) {
  const videoPath = sourceFiles.find((sourcePath) => mediaType(sourcePath) === 'video');
  if (videoPath) {
    throw new Error(`Video media cannot be archived from ${sourceRoot}: ${videoPath}. Register it explicitly as source-only and archive only derived analysis images.`);
  }
}

async function sha256(filePath) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function mediaType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (['.mp4', '.mov', '.webm'].includes(extension)) return 'video';
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(extension)) return 'image';
  if (['.md', '.txt', '.csv', '.json', '.html', '.js'].includes(extension)) return 'document';
  return 'file';
}

function assetId(record) {
  if (record.status === 'archived/superseded') return `asset-history:${record.archivePath}`;
  const identity = record.logicalArchivePath ?? record.archivePath ?? record.sourcePath;
  return `asset:${identity.replaceAll(path.sep, '/')}`;
}

function sourceGroups() {
  const islandVideoPath = path.join(desktopRoot, '第一座岛/2b54bef3933da8bc3cd5923961fa883c.mp4');
  const guideVideoPaths = [
    path.join(desktopRoot, '攻略1/ScreenRecording_08-27-2026 19-48-42_1.MP4'),
    path.join(desktopRoot, '攻略1/d6d1b952eed288e80723f00a0e3473c6.mp4'),
  ];
  const islandRawAssetId = assetId({ sourcePath: islandVideoPath, archivePath: null });
  const guideRawAssetIds = guideVideoPaths.map((sourcePath) => assetId({ sourcePath, archivePath: null }));
  const entityFrames = {
    'clam.jpg': { entity: 'Clam', sourceFrame: 'frame-006.jpg', pageUsage: ['/locations/lighthouse', '/beginner-guide'] },
    'keeper-npc.jpg': { entity: 'Lighthouse Keeper NPC', sourceFrame: 'frame-009.jpg', pageUsage: ['/locations/lighthouse', '/bosses/spider-crab'] },
    'first-rod.jpg': { entity: 'Fishing rod', sourceFrame: 'frame-013.jpg', pageUsage: ['/locations/lighthouse', '/beginner-guide'] },
    'catch-value.jpg': { entity: 'Unidentified catch inspection', sourceFrame: 'frame-019.jpg', pageUsage: ['research-only'] },
    'reel-of-fortune.jpg': { entity: 'Reel of Fortune', sourceFrame: 'frame-021.jpg', pageUsage: ['/guides/reel-of-fortune'] },
    'early-shop-weapons.jpg': { entity: 'Brass Knuckles shop listing', sourceFrame: 'frame-023.jpg', pageUsage: ['research-only'] },
    'knife-shop.jpg': { entity: 'Knife shop listing', sourceFrame: 'frame-024.jpg', pageUsage: ['research-only'] },
    'hot-dog-shop.jpg': { entity: 'Hot Dog shop listing', sourceFrame: 'frame-026.jpg', pageUsage: ['research-only'] },
    'empty-beer-can.jpg': { entity: 'Beer exchange / Empty Beer Can evidence', sourceFrame: 'frame-027.jpg', pageUsage: ['/locations/lighthouse', '/bosses/spider-crab'] },
    'boss-lure-cast.jpg': { entity: 'Spider Crab boss-lure cast', sourceFrame: 'frame-028.jpg', pageUsage: ['/locations/lighthouse', '/bosses/spider-crab'] },
    'spider-crab.jpg': { entity: 'Spider Crab', sourceFrame: 'frame-003.jpg', pageUsage: ['/bosses/spider-crab', '/locations/lighthouse'] },
    'spider-crab-attack-window.jpg': { entity: 'Spider Crab attack-window evidence', sourceFrame: 'frame-032.jpg', pageUsage: ['/bosses/spider-crab'] },
    'shell-handoff.jpg': { entity: 'Spider Crab Shell handoff evidence', sourceFrame: 'frame-035.jpg', pageUsage: ['/bosses/spider-crab', '/locations/lighthouse'] },
    'radar-forest-route.jpg': { entity: 'Radar / Forest route evidence', sourceFrame: 'frame-036.jpg', pageUsage: ['/locations/lighthouse', '/beginner-guide'] },
  };
  return {
    archivedTrees: [
      {
        sourceRoot: path.join(desktopRoot, '新手指南'),
        archiveRoot: '01-raw/user-provided/beginner-guide',
        role: 'raw', status: 'archived', rights: 'user-provided; ownership unconfirmed', publishability: false,
        pageUsage: ['guides/beginner'], derivedFrom: null,
      },
      {
        sourceRoot: path.join(repoRoot, 'research/reference-images/game8'),
        archiveRoot: '03-reference/game8',
        role: 'reference', status: 'archived', rights: 'third-party Game8 reference-only media', publishability: false,
        pageUsage: ['research-only'], derivedFrom: null,
      },
      {
        sourceRoot: weaponReferenceRoot,
        archiveRoot: '03-reference/how-to-fish-weapons',
        role: 'reference', status: 'archived',
        rights: 'mixed third-party gameplay captures, community research, and images labeled as official Steam screenshots; reference-only',
        publishability: false, pageUsage: ['research-only'], derivedFrom: null,
        metadataForRelative(relativePath) {
          const steamReferences = new Set([
            'assets/assault-rifle-official.jpg',
            'assets/shotgun-official.jpg',
            'assets/steam-weapon-wall.jpg',
          ]);
          const normalizedPath = relativePath.split(path.sep).join('/');
          if (steamReferences.has(normalizedPath)) {
            return { rights: 'supplied as an official Dazed Games / Steam screenshot; provenance not independently established; reference-only', publishability: false };
          }
          if (normalizedPath.startsWith('assets/') && mediaType(relativePath) === 'image') {
            return { rights: 'third-party gameplay capture; reference-only and not cleared for publication', publishability: false };
          }
          return {
            rights: 'offline community reference compilation containing third-party claims; research-only',
            publishability: false,
          };
        },
      },
      {
        sourceRoot: path.join(repoRoot, 'research/video-analysis'),
        archiveRoot: '02-analysis',
        role: 'analysis', status: 'archived', rights: 'analysis material; review required', publishability: false,
        pageUsage: ['research-only'], derivedFrom: null,
        metadataForRelative(relativePath) {
          const firstDirectory = relativePath.split(path.sep)[0];
          if (firstDirectory === 'island-1') {
            const entity = entityFrames[relativePath.slice('island-1/entities/'.length)];
            if (entity && relativePath.startsWith('island-1/entities/')) {
              return {
                rights: 'clean crop from the user-owned Island 1 recording', publishability: true,
                pageUsage: entity.pageUsage,
                derivedFrom: [`asset:02-analysis/island-1/frames/${entity.sourceFrame}`, islandRawAssetId],
                entity: entity.entity, crop: '900x500 at x=250 y=100',
              };
            }
            return {
              rights: 'analysis derivative of user-owned Island 1 recording', publishability: true,
              pageUsage: ['guides/island-1'], derivedFrom: [islandRawAssetId],
            };
          }
          if (firstDirectory === 'guide-1') {
            return {
              rights: 'analysis derivative of uncertain Guide 1 media; research-only', publishability: false,
              pageUsage: ['research-only'], derivedFrom: guideRawAssetIds,
            };
          }
          return {
            rights: 'new analysis material; rights and publishability require review', publishability: false,
            pageUsage: ['research-only'], derivedFrom: null,
          };
        },
      },
      {
        sourceRoot: path.join(repoRoot, 'public/images'),
        archiveRoot: '05-published/public-images',
        role: 'published', status: 'archived', rights: 'project-owned original or generated site asset', publishability: true,
        pageUsage: ['site-public-assets'], derivedFrom: null,
      },
    ],
    archivedFiles: [
      {
        sourcePath: path.join(repoRoot, 'research/reference-images/README.md'),
        archivePath: '03-reference/game8/README.md',
        role: 'reference', status: 'archived', rights: 'third-party Game8 reference-only documentation', publishability: false,
        pageUsage: ['research-only'], derivedFrom: null,
      },
      {
        sourcePath: path.join(repoRoot, 'research/source-packets/how-to-fish-p0.md'),
        archivePath: '04-project/source-packets/how-to-fish-p0.md',
        role: 'analysis', status: 'archived', rights: 'project-owned research source packet', publishability: false,
        pageUsage: ['research-only'], derivedFrom: null,
      },
      ...knowledgeSeedPaths.map((sourcePath) => ({
        sourcePath,
        archivePath: `04-project/knowledge-seed/${path.basename(sourcePath)}`,
        role: 'analysis', status: 'archived', rights: 'project-owned structured knowledge seed', publishability: false,
        pageUsage: ['research-only'], derivedFrom: path.basename(sourcePath) === 'weapons.seed.json'
          ? ['asset:03-reference/how-to-fish-weapons/assets/weapons.js']
          : ['asset:04-project/source-packets/how-to-fish-p0.md'],
      })),
    ],
    sourceOnlyFiles: [
      {
        sourcePath: islandVideoPath, mediaType: 'video', role: 'raw', status: 'analyzed/source-only',
        rights: 'user-owned recording retained only at original path', publishability: false,
        pageUsage: ['guides/island-1'], derivedFrom: null,
      },
      ...guideVideoPaths.map((sourcePath) => ({
        sourcePath, mediaType: 'video', role: 'raw', status: 'analyzed/source-only',
        rights: 'uncertain social or phone UI media; retained only at original path', publishability: false,
        pageUsage: ['research-only'], derivedFrom: null,
      })),
    ],
    pendingFiles: [
      path.join(desktopRoot, '攻略2/ScreenRecording_08-28-2026 10-03-30_1.MP4'),
      path.join(desktopRoot, '攻略3/ScreenRecording_08-28-2026 10-09-46_1.MP4'),
      path.join(desktopRoot, '什么都有/ScreenRecording_08-28-2026 10-22-35_1.MP4'),
      path.join(desktopRoot, '什么都有/ScreenRecording_08-28-2026 10-35-54_1.MP4'),
    ],
  };
}

async function buildRecords() {
  const groups = sourceGroups();
  const records = [];
  for (const group of groups.archivedTrees) {
    const sourceRoot = await existingRealDirectory(group.sourceRoot, 'archived source tree');
    const sourceFiles = await filesUnder(sourceRoot, 'archived source tree');
    await assertNoVideosInArchivedTree(sourceRoot, sourceFiles);
    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(sourceRoot, sourcePath);
      const metadata = group.metadataForRelative?.(relativePath) ?? {};
      records.push({
        sourcePath,
        archivePath: path.posix.join(group.archiveRoot, ...relativePath.split(path.sep)),
        mediaType: mediaType(sourcePath),
        role: group.role, status: group.status, rights: group.rights,
        publishability: group.publishability, pageUsage: group.pageUsage, derivedFrom: group.derivedFrom,
        ...metadata,
      });
    }
  }
  records.push(...groups.archivedFiles.map((file) => ({ ...file, mediaType: mediaType(file.sourcePath) })));
  for (const file of groups.archivedFiles) {
    if (mediaType(file.sourcePath) === 'video') {
      throw new Error(`Video media must be explicitly registered as source-only, not archived: ${file.sourcePath}`);
    }
  }
  for (const file of groups.sourceOnlyFiles) {
    if (mediaType(file.sourcePath) !== 'video') throw new Error(`Source-only registration must be a video: ${file.sourcePath}`);
    records.push({ ...file, archivePath: null });
  }
  for (const sourcePath of groups.pendingFiles) {
    if (mediaType(sourcePath) !== 'video') throw new Error(`Pending registration must be a video: ${sourcePath}`);
    records.push({
      sourcePath, archivePath: null, mediaType: mediaType(sourcePath), role: 'pending', status: 'pending/unreviewed',
      rights: 'unreviewed; rights and publishability not established', publishability: false,
      pageUsage: ['none'], derivedFrom: null,
    });
  }
  return records.sort((left, right) => compareStrings(left.sourcePath, right.sourcePath));
}

async function copyWithCloneOrSmallFallback(sourcePath, destinationPath, sourceBytes) {
  try {
    await fs.copyFile(sourcePath, destinationPath, constants.COPYFILE_FICLONE_FORCE);
  } catch (cloneError) {
    if (sourceBytes > maxFullCopyBytes) {
      throw new Error(`Copy-on-write cloning is required for files larger than 100 MB: ${sourcePath}. ${cloneError.message}`);
    }
    try {
      const destinationStat = await fs.lstat(destinationPath);
      if (destinationStat.isSymbolicLink()) throw new Error(`Archive destination is a symlink: ${destinationPath}`);
      await fs.rm(destinationPath, { force: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await fs.copyFile(sourcePath, destinationPath);
  }
}

function versionedArchivePath(archivePath, sha256Value) {
  const parsed = path.posix.parse(archivePath);
  return path.posix.join(parsed.dir, 'versions', sha256Value.slice(0, 16), parsed.base);
}

async function archiveDestinationState(destinationPath, record) {
  try {
    const destinationStat = await fs.lstat(destinationPath);
    if (destinationStat.isSymbolicLink()) throw new Error(`Archive destination is a symlink: ${destinationPath}`);
    if (!destinationStat.isFile()) throw new Error(`Archive collision is not a file: ${destinationPath}`);
    const destinationHash = await sha256(destinationPath);
    return destinationStat.size === record.bytes && destinationHash === record.sha256 ? 'matching' : 'different';
  } catch (error) {
    if (error.code === 'ENOENT') return 'missing';
    throw error;
  }
}

async function archiveRecord(record) {
  const sourceStat = record.archivePath
    ? await fs.lstat(record.sourcePath)
    : (await safeSourceOnlyFile(record.sourcePath)).stat;
  if (sourceStat.isSymbolicLink()) throw new Error(`Source is a symlink and cannot be archived: ${record.sourcePath}`);
  if (!sourceStat.isFile()) throw new Error(`Source is not a file: ${record.sourcePath}`);
  record.bytes = sourceStat.size;
  record.sha256 = await sha256(record.sourcePath);
  record.fingerprint = `sha256:${record.sha256}`;
  if (!record.archivePath) return record;
  record.logicalArchivePath ??= record.archivePath;
  if (record.mediaType === 'video') throw new Error(`Video media cannot be copied into the asset archive: ${record.sourcePath}`);

  let destinationPath = await safeArchiveDestination(currentArchiveRoot, record.archivePath);
  if (isWithin(destinationPath, path.join(currentArchiveRoot, '00-catalog'))) {
    throw new Error(`Refusing to archive into catalog space: ${record.archivePath}`);
  }
  let destinationState = await archiveDestinationState(destinationPath, record);
  if (destinationState === 'different') {
    record.archivePath = versionedArchivePath(record.archivePath, record.sha256);
    destinationPath = await safeArchiveDestination(currentArchiveRoot, record.archivePath);
    destinationState = await archiveDestinationState(destinationPath, record);
  }
  if (destinationState === 'missing') {
    await copyWithCloneOrSmallFallback(record.sourcePath, destinationPath, record.bytes);
    const destinationHash = await sha256(destinationPath);
    if (destinationHash !== record.sha256) throw new Error(`Checksum mismatch immediately after archival: ${destinationPath}`);
  }
  return record;
}

async function collectHistoricalRecords(currentRecords, archiveRoot = currentArchiveRoot) {
  const historicalRecords = [];
  for (const currentRecord of currentRecords.filter((record) => record.archivePath)) {
    const logicalArchivePath = currentRecord.logicalArchivePath ?? currentRecord.archivePath;
    const parsed = path.posix.parse(logicalArchivePath);
    const candidates = [logicalArchivePath];
    const versionsDirectory = path.resolve(archiveRoot, ...path.posix.join(parsed.dir, 'versions').split('/'));
    try {
      await assertNoSymlinksInExistingPath(versionsDirectory, 'archive history directory');
      const entries = await fs.readdir(versionsDirectory);
      for (const entry of entries.sort(compareStrings)) {
        const versionDirectory = path.join(versionsDirectory, entry);
        const versionStat = await fs.lstat(versionDirectory);
        if (versionStat.isSymbolicLink()) throw new Error(`archive history directory contains a symlink: ${versionDirectory}`);
        if (!versionStat.isDirectory()) continue;
        const candidatePath = path.join(versionDirectory, parsed.base);
        try {
          const candidateStat = await fs.lstat(candidatePath);
          if (candidateStat.isSymbolicLink()) throw new Error(`archive history file is a symlink: ${candidatePath}`);
          if (candidateStat.isFile()) candidates.push(path.posix.join(parsed.dir, 'versions', entry, parsed.base));
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    for (const archivePath of [...new Set(candidates)].sort(compareStrings)) {
      if (archivePath === currentRecord.archivePath) continue;
      try {
        const { targetPath, stat } = await safeExistingArchiveFile(archiveRoot, archivePath);
        const hash = await sha256(targetPath);
        historicalRecords.push({
          id: `asset-history:${archivePath}`,
          sourcePath: null,
          archivePath,
          logicalArchivePath,
          mediaType: currentRecord.mediaType,
          role: currentRecord.role,
          status: 'archived/superseded',
          rights: currentRecord.rights,
          publishability: currentRecord.publishability,
          pageUsage: currentRecord.pageUsage,
          sha256: hash,
          fingerprint: `sha256:${hash}`,
          bytes: stat.size,
          derivedFrom: currentRecord.derivedFrom,
          entity: currentRecord.entity,
          crop: currentRecord.crop,
          historicalProvenance: { sourcePath: currentRecord.sourcePath, logicalArchivePath },
          supersededBy: assetId(currentRecord),
        });
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  }
  return historicalRecords.sort((left, right) => compareStrings(left.archivePath, right.archivePath));
}

function csvEscape(value) {
  const string = Array.isArray(value) ? JSON.stringify(value) : value == null ? '' : String(value);
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

async function writeTextAtomically(targetPath, contents) {
  const relativeTarget = path.relative(currentArchiveRoot, targetPath).split(path.sep).join('/');
  const safeTarget = await safeArchiveDestination(currentArchiveRoot, relativeTarget);
  const temporaryPath = `${safeTarget}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, contents, 'utf8');
  await fs.rename(temporaryPath, safeTarget);
}

function catalogReadme() {
  return `# Asset library catalog\n\nThis directory is generated by \`scripts/build-asset-library.mjs\`. Do not edit manifest or checksum files by hand. Originals remain at the absolute \`sourcePath\` recorded in the manifest; the library is a copy-only archive. Changed-source history is retained as \`archived/superseded\` records and included in checksums. \`knowledge-manifest.json\` is the evidence-bound entity layer, sourced from the archived knowledge seed. Run the tool with \`--verify\` to validate current and historical archived checksums, source-only video fingerprints, and knowledge asset references.\n`;
}

function knowledgeColumns() {
  return ['id', 'category', 'canonicalName', 'aliases', 'imageAssetIds', 'evidenceAssetIds', 'sourceVideo', 'sourceVideoAssetId', 'timestamp', 'attackPattern', 'salePrice', 'buyPrice', 'currency', 'priceContext', 'unlockUse', 'verificationStatus', 'verificationDate', 'observations', 'notes', 'pageUsage'];
}

const knowledgeCategories = new Set(['island/location', 'weapon', 'NPC', 'fish/creature', 'boss', 'weapon_attachment', 'bait', 'item', 'shop']);
const knowledgeStatuses = new Set(['verified', 'unverified']);
const observationStatuses = new Set(['verified', 'reference-only']);
const requiredKnowledgeFields = [
  'id', 'category', 'canonicalName', 'aliases', 'imageAssetIds', 'evidenceAssetIds', 'sourceVideo', 'sourceVideoAssetId',
  'timestamp', 'attackPattern', 'salePrice', 'buyPrice', 'currency', 'priceContext', 'unlockUse', 'verificationStatus',
  'verificationDate', 'notes', 'pageUsage',
];

function assertNullableString(value, field, entityId) {
  if (value !== null && typeof value !== 'string') throw new Error(`Knowledge entity ${entityId} has invalid ${field}; use a string or null.`);
}

function validateKnowledgeSchema(knowledge) {
  if (!knowledge || typeof knowledge !== 'object' || !Array.isArray(knowledge.entities)) {
    throw new Error('Knowledge seed must contain an entities array.');
  }
  const ids = new Set();
  for (const entity of knowledge.entities) {
    if (!entity || typeof entity !== 'object') throw new Error('Knowledge entities must be objects.');
    for (const field of requiredKnowledgeFields) {
      if (!Object.hasOwn(entity, field)) throw new Error(`Knowledge entity is missing required field: ${field}`);
    }
    if (typeof entity.id !== 'string' || entity.id.length === 0 || ids.has(entity.id)) throw new Error(`Knowledge entity has an invalid or duplicate id: ${entity.id}`);
    ids.add(entity.id);
    if (!knowledgeCategories.has(entity.category)) throw new Error(`Knowledge entity ${entity.id} has unsupported category: ${entity.category}`);
    if (!knowledgeStatuses.has(entity.verificationStatus)) throw new Error(`Knowledge entity ${entity.id} has unsupported verificationStatus: ${entity.verificationStatus}`);
    if (typeof entity.canonicalName !== 'string' || entity.canonicalName.length === 0) throw new Error(`Knowledge entity ${entity.id} requires a canonicalName.`);
    for (const field of ['aliases', 'imageAssetIds', 'evidenceAssetIds', 'pageUsage']) {
      if (!Array.isArray(entity[field]) || entity[field].some((value) => typeof value !== 'string' || value.length === 0)) {
        throw new Error(`Knowledge entity ${entity.id} has invalid ${field}.`);
      }
    }
    for (const field of ['sourceVideo', 'sourceVideoAssetId', 'timestamp', 'attackPattern', 'currency', 'priceContext', 'unlockUse', 'verificationDate', 'notes']) {
      assertNullableString(entity[field], field, entity.id);
    }
    for (const field of ['salePrice', 'buyPrice']) {
      if (entity[field] !== null && typeof entity[field] !== 'number') throw new Error(`Knowledge entity ${entity.id} has invalid ${field}; use a number or null.`);
    }
    if (entity.observations !== undefined) {
      if (!Array.isArray(entity.observations)) throw new Error(`Knowledge entity ${entity.id} has invalid observations.`);
      for (const observation of entity.observations) {
        if (!observation || typeof observation !== 'object') throw new Error(`Knowledge entity ${entity.id} has a non-object observation.`);
        for (const field of ['field', 'value', 'sourceAssetIds', 'sourceUrls', 'status', 'observedAt', 'context']) {
          if (!Object.hasOwn(observation, field)) throw new Error(`Knowledge entity ${entity.id} observation is missing ${field}.`);
        }
        if (typeof observation.field !== 'string' || observation.field.length === 0 || observation.value === null || observation.value === undefined) {
          throw new Error(`Knowledge entity ${entity.id} observation requires a field and value.`);
        }
        for (const field of ['sourceAssetIds', 'sourceUrls']) {
          if (!Array.isArray(observation[field]) || observation[field].some((value) => typeof value !== 'string' || value.length === 0)) {
            throw new Error(`Knowledge entity ${entity.id} observation has invalid ${field}.`);
          }
        }
        if (!observationStatuses.has(observation.status)) throw new Error(`Knowledge entity ${entity.id} observation has unsupported status: ${observation.status}`);
        if (typeof observation.observedAt !== 'string' || observation.observedAt.length === 0 || typeof observation.context !== 'string' || observation.context.length === 0) {
          throw new Error(`Knowledge entity ${entity.id} observation requires observedAt and context strings.`);
        }
        if (observation.sourceAssetIds.length === 0 && observation.sourceUrls.length === 0) {
          throw new Error(`Knowledge entity ${entity.id} observation requires a durable asset or source URL.`);
        }
      }
    }
    if (entity.verificationStatus === 'verified') {
      const hasDurableEvidence = entity.imageAssetIds.length > 0 || entity.evidenceAssetIds.length > 0 || entity.sourceVideoAssetId !== null;
      if (!hasDurableEvidence) throw new Error(`Verified knowledge entity ${entity.id} requires a durable image, evidence, or sourceVideoAssetId.`);
    }
    if (entity.verificationStatus === 'unverified') {
      for (const field of ['attackPattern', 'salePrice', 'buyPrice', 'currency', 'priceContext', 'unlockUse', 'verificationDate']) {
        if (entity[field] !== null) throw new Error(`Unverified knowledge entity ${entity.id} must set ${field} to null.`);
      }
      if (entity.pageUsage.length === 0 || entity.pageUsage.some((usage) => usage !== 'research-only')) {
        throw new Error(`Unverified knowledge entity ${entity.id} must use only research-only pageUsage.`);
      }
    }
  }
  if (!Array.isArray(knowledge.coverageGaps ?? [])) throw new Error('Knowledge coverageGaps must be an array.');
  for (const gap of knowledge.coverageGaps ?? []) {
    if (!gap || gap.status !== 'unverified' || typeof gap.area !== 'string' || typeof gap.details !== 'string') {
      throw new Error('Knowledge coverage gaps must have area, details, and status: unverified.');
    }
  }
}

function assertKnowledgeReferences(knowledge, assets) {
  validateKnowledgeSchema(knowledge);
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  for (const entity of knowledge.entities) {
    const observationAssetIds = (entity.observations ?? []).flatMap((observation) => observation.sourceAssetIds ?? []);
    for (const referencedId of [...(entity.imageAssetIds ?? []), ...(entity.evidenceAssetIds ?? []), ...(entity.sourceVideoAssetId ? [entity.sourceVideoAssetId] : []), ...observationAssetIds]) {
      const referencedAsset = assetsById.get(referencedId);
      if (!referencedAsset) throw new Error(`Knowledge entity ${entity.id} references an unknown asset ID: ${referencedId}`);
      if (referencedAsset.status === 'archived/superseded') {
        throw new Error(`Knowledge entity ${entity.id} references a superseded asset ID: ${referencedId}`);
      }
    }
  }
}

async function writeKnowledgeCatalog(archiveRoot, assets) {
  const seeds = await Promise.all(knowledgeSeedPaths.map(async (seedPath) => ({
    seedPath,
    seed: JSON.parse(await fs.readFile(seedPath, 'utf8')),
  })));
  const entities = seeds.flatMap(({ seed }) => seed.entities).sort((left, right) => compareStrings(left.id, right.id));
  const knowledge = {
    schemaVersion: Math.max(...seeds.map(({ seed }) => seed.schemaVersion)),
    sourceSeedArchivePaths: seeds.map(({ seedPath }) => assets.find((asset) => asset.sourcePath === seedPath)?.archivePath ?? null),
    scopes: seeds.map(({ seed }) => seed.scope),
    entities,
    coverageGaps: seeds.flatMap(({ seed }) => seed.coverageGaps ?? []),
  };
  assertKnowledgeReferences(knowledge, assets);
  const columns = knowledgeColumns();
  const csv = [columns.join(','), ...entities.map((entity) => columns.map((column) => csvEscape(entity[column])).join(','))].join('\n') + '\n';
  await Promise.all([
    writeTextAtomically(path.join(archiveRoot, '00-catalog/knowledge-manifest.json'), `${JSON.stringify(knowledge, null, 2)}\n`),
    writeTextAtomically(path.join(archiveRoot, '00-catalog/knowledge-manifest.csv'), csv),
  ]);
}

async function writeCatalog(archiveRoot, records) {
  const sorted = records.map((record) => ({ id: assetId(record), ...record }))
    .sort((left, right) => compareStrings(left.archivePath ?? left.sourcePath, right.archivePath ?? right.sourcePath));
  const manifest = {
    schemaVersion: 1,
    run: { generatedAt: new Date().toISOString(), archiveRoot },
    assets: sorted,
  };
  const columns = ['id', 'sourcePath', 'archivePath', 'logicalArchivePath', 'mediaType', 'role', 'status', 'rights', 'publishability', 'pageUsage', 'sha256', 'fingerprint', 'bytes', 'derivedFrom', 'entity', 'crop', 'historicalProvenance', 'supersededBy'];
  const csv = [columns.join(','), ...sorted.map((record) => columns.map((column) => csvEscape(record[column])).join(','))].join('\n') + '\n';
  const checksums = sorted.filter((record) => record.archivePath)
    .map((record) => `${record.sha256}  ${record.archivePath}`).join('\n') + '\n';
  await Promise.all([
    writeTextAtomically(path.join(archiveRoot, '00-catalog/asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`),
    writeTextAtomically(path.join(archiveRoot, '00-catalog/asset-manifest.csv'), csv),
    writeTextAtomically(path.join(archiveRoot, '00-catalog/checksums.sha256'), checksums),
    writeTextAtomically(path.join(archiveRoot, '00-catalog/README.md'), catalogReadme()),
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
  return { total: records.length, archived: records.filter((record) => record.archivePath).length, pending: records.filter((record) => !record.archivePath).length, roles, statuses };
}

async function verifyArchive(archiveRoot) {
  const manifestPath = path.join(archiveRoot, '00-catalog/asset-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.assets)) throw new Error(`Invalid manifest assets array: ${manifestPath}`);
  const failures = [];
  for (const record of manifest.assets) {
    try {
      if (record.archivePath) {
        const { targetPath: archivePath, stat } = await safeExistingArchiveFile(archiveRoot, record.archivePath);
        if (stat.size !== record.bytes) throw new Error(`byte count differs (${stat.size} != ${record.bytes})`);
        if (await sha256(archivePath) !== record.sha256) throw new Error('checksum differs');
      } else {
        const { stat } = await safeSourceOnlyFile(record.sourcePath);
        if (stat.size !== record.bytes) throw new Error(`source byte count differs (${stat.size} != ${record.bytes})`);
        if (await sha256(record.sourcePath) !== record.sha256) throw new Error('source checksum differs');
        if (record.fingerprint && record.fingerprint !== `sha256:${record.sha256}`) throw new Error('source fingerprint differs');
      }
    } catch (error) {
      failures.push({ id: record.id, error: error.message });
    }
  }
  try {
    const knowledge = JSON.parse(await fs.readFile(path.join(archiveRoot, '00-catalog/knowledge-manifest.json'), 'utf8'));
    assertKnowledgeReferences(knowledge, manifest.assets);
  } catch (error) {
    failures.push({ id: 'knowledge-manifest', error: error.message });
  }
  const summary = { ok: failures.length === 0, ...summarize(manifest.assets), failures };
  console.log(JSON.stringify(summary));
  if (failures.length) process.exitCode = 1;
}

let currentArchiveRoot;
let currentDesktopRoot;

async function main() {
  const { archiveRoot, verify } = parseArgs(process.argv.slice(2));
  assertSafeArchiveRoot(archiveRoot);
  currentDesktopRoot = await existingRealDirectory(desktopRoot, 'Desktop how to fish root');
  currentArchiveRoot = verify
    ? await existingRealDirectory(archiveRoot, 'archive root')
    : await prepareArchiveRoot(archiveRoot);
  if (verify) return verifyArchive(currentArchiveRoot);
  await Promise.all([
    safeArchiveDirectory(currentArchiveRoot, '00-catalog'),
    safeArchiveDirectory(currentArchiveRoot, '01-raw/user-provided/beginner-guide'),
    safeArchiveDirectory(currentArchiveRoot, '02-analysis/island-1'),
    safeArchiveDirectory(currentArchiveRoot, '02-analysis/guide-1'),
    safeArchiveDirectory(currentArchiveRoot, '03-reference/game8'),
    safeArchiveDirectory(currentArchiveRoot, '03-reference/how-to-fish-weapons'),
    safeArchiveDirectory(currentArchiveRoot, '04-project/source-packets'),
    safeArchiveDirectory(currentArchiveRoot, '04-project/knowledge-seed'),
    safeArchiveDirectory(currentArchiveRoot, '05-published/public-images'),
  ]);
  const records = await buildRecords();
  for (const record of records) await archiveRecord(record);
  const historicalRecords = await collectHistoricalRecords(records);
  const catalogRecords = await writeCatalog(currentArchiveRoot, [...records, ...historicalRecords]);
  await writeKnowledgeCatalog(currentArchiveRoot, catalogRecords);
  console.log(JSON.stringify({ ok: true, ...summarize(catalogRecords) }));
}

export { assertKnowledgeReferences, assertNoVideosInArchivedTree, assertNoSymlinksInExistingPath, collectHistoricalRecords, safeArchiveDestination, safeSourceOnlyFile, validateKnowledgeSchema };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
