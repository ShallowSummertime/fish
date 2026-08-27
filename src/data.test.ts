import { describe, expect, it } from 'vitest';
import { achievements, bosses, creatures, locations, pageMeta } from './data';
describe('How to Fish content baseline', () => {
  it('contains exactly 49 creatures with 11 boss or special entities', () => {
    expect(creatures).toHaveLength(49);
    expect(creatures.filter(c => c.kind === 'Boss / Special')).toHaveLength(11);
    expect(bosses).toHaveLength(11);
  });
  it('models the five main locations correctly', () => {
    expect(locations).toHaveLength(5);
    expect(locations[0].name).toBe('Lighthouse');
    expect(locations.filter(l => l.type === 'Island')).toHaveLength(4);
  });
  it('has metadata for every required core route', () => {
    ['/','/beginner-guide','/creatures','/bosses','/locations','/lures','/bosses/spider-crab','/achievements'].forEach(path => expect(pageMeta[path]).toBeDefined());
    expect(pageMeta['/'].title).toContain('How to Fish Walkthrough');
    expect(achievements).toHaveLength(28);
  });
});
