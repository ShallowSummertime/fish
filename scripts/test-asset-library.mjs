import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { assertKnowledgeReferences, assertNoSymlinksInExistingPath, assertNoVideosInArchivedTree, collectHistoricalRecords, safeSourceOnlyFile, validateKnowledgeSchema } from './build-asset-library.mjs';

const fixtureRoot = await fs.mkdtemp('/private/tmp/fish-asset-library-test-');

function entity(overrides = {}) {
  return {
    id: 'entity:fixture', category: 'item', canonicalName: 'Fixture', aliases: [],
    imageAssetIds: ['asset:fixture-image'], evidenceAssetIds: [], sourceVideo: null, sourceVideoAssetId: null,
    timestamp: null, attackPattern: null, salePrice: null, buyPrice: null, currency: null, priceContext: null,
    unlockUse: null, verificationStatus: 'verified', verificationDate: '2026-08-28', notes: null, pageUsage: ['research-only'],
    ...overrides,
  };
}

try {
  const videoPath = path.join(fixtureRoot, 'unexpected.mp4');
  await fs.writeFile(videoPath, 'fixture');
  await assert.rejects(
    () => assertNoVideosInArchivedTree(fixtureRoot, [videoPath]),
    /Video media cannot be archived/,
  );

  const targetPath = path.join(fixtureRoot, 'target');
  const linkPath = path.join(fixtureRoot, 'link');
  await fs.mkdir(targetPath);
  await fs.symlink(targetPath, linkPath);
  await assert.rejects(() => assertNoSymlinksInExistingPath(linkPath, 'fixture'), /contains a symlink/);
  const desktopFixture = path.join(fixtureRoot, 'desktop');
  const externalVideo = path.join(fixtureRoot, 'outside.mp4');
  const linkedVideo = path.join(desktopFixture, 'linked.mp4');
  await fs.mkdir(desktopFixture);
  await fs.writeFile(externalVideo, 'fixture');
  await fs.symlink(externalVideo, linkedVideo);
  await assert.rejects(() => safeSourceOnlyFile(linkedVideo, desktopFixture), /contains a symlink/);
  await assert.rejects(() => safeSourceOnlyFile(externalVideo, desktopFixture), /escapes Desktop how to fish root/);

  assert.throws(
    () => validateKnowledgeSchema({ entities: [entity({ imageAssetIds: [], verificationStatus: 'verified' })], coverageGaps: [] }),
    /requires a durable image/,
  );
  assert.throws(
    () => assertKnowledgeReferences({ entities: [entity({ sourceVideoAssetId: 'asset:missing' })], coverageGaps: [] }, [{ id: 'asset:fixture-image' }]),
    /unknown asset ID/,
  );
  assert.throws(
    () => validateKnowledgeSchema({ entities: [entity({ verificationStatus: 'unverified', verificationDate: null, attackPattern: 'not allowed' })], coverageGaps: [] }),
    /must set attackPattern to null/,
  );
  assert.throws(
    () => validateKnowledgeSchema({ entities: [entity({ verificationStatus: 'unverified', verificationDate: null, pageUsage: ['/public'] })], coverageGaps: [] }),
    /must use only research-only pageUsage/,
  );
  assert.doesNotThrow(() => assertKnowledgeReferences({ entities: [entity()], coverageGaps: [] }, [{ id: 'asset:fixture-image' }]));

  const archiveRoot = path.join(fixtureRoot, 'archive');
  const logicalArchivePath = '04-project/knowledge-seed/first-island.seed.json';
  const previousPath = path.join(archiveRoot, logicalArchivePath);
  const currentArchivePath = '04-project/knowledge-seed/versions/currenthash1234567/first-island.seed.json';
  const currentPath = path.join(archiveRoot, currentArchivePath);
  await fs.mkdir(path.dirname(previousPath), { recursive: true });
  await fs.mkdir(path.dirname(currentPath), { recursive: true });
  await fs.writeFile(previousPath, 'old seed');
  await fs.writeFile(currentPath, 'new seed');
  const currentHash = createHash('sha256').update('new seed').digest('hex');
  const currentRecord = {
    sourcePath: '/honest/current/source.json', archivePath: currentArchivePath, logicalArchivePath,
    mediaType: 'document', role: 'analysis', status: 'archived', rights: 'fixture', publishability: false,
    pageUsage: ['research-only'], derivedFrom: null, bytes: 8, sha256: currentHash, fingerprint: `sha256:${currentHash}`,
  };
  const historical = await collectHistoricalRecords([currentRecord], archiveRoot);
  const catalogLikeRecords = [currentRecord, ...historical];
  assert.equal(historical.length, 1);
  assert.equal(historical[0].archivePath, logicalArchivePath);
  assert.equal(historical[0].status, 'archived/superseded');
  assert.equal(historical[0].sourcePath, null);
  assert.equal(historical[0].supersededBy, `asset:${currentArchivePath}`);
  const checksumPaths = catalogLikeRecords.filter((record) => record.archivePath).map((record) => record.archivePath).sort();
  assert.deepEqual(checksumPaths, [logicalArchivePath, currentArchivePath].sort());
  console.log('asset-library targeted checks passed');
} finally {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
}
