import { playbackEndAction } from './state.js';

export function endDecision(mode, allIds, planIds, currentId) {
  if (mode === 'repeat-one') return playbackEndAction({ mode, lessonIds: [currentId], currentId });
  if (mode === 'loop-list') return playbackEndAction({ mode, lessonIds: planIds, currentId });
  return playbackEndAction({ mode: 'auto-next', lessonIds: allIds, currentId });
}
export function restartIfEnded(video, didEnd) {
  if (didEnd || video.ended) { video.currentTime = 0; return true; }
  return false;
}
