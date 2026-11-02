import { normalizeViewingReminderMinutes, VIEWING_REMINDER_DEFAULT_MINUTES } from './viewing-reminder.js';
import { applyTrainingEvent, freshTrainingState, normalizeTrainingActivityOrder, normalizeTrainingState } from './training-state.js';
import { freshFlashcardReview, normalizeFlashcardReview } from './flashcard-state.js';

export { applyTrainingEvent, freshTrainingState, normalizeTrainingState } from './training-state.js';

const KEY = 'wow-family-progress-v1';
export const PLAYBACK_MODES = ['auto-next', 'repeat-one', 'loop-list'];
export const normalizePlaybackMode = (value) => PLAYBACK_MODES.includes(value) ? value : 'auto-next';

export const freshState = () => ({
  watched: {}, completed: {}, favorites: [], review: [], lastStudyDate: null, streak: 0,
  settings: { captions: true, speed: 1, language: 'zh', playbackMode: 'auto-next', viewingReminderMinutes: VIEWING_REMINDER_DEFAULT_MINUTES },
  plans: { controlled: false, today: { key: null, lessonIds: [], reviewLessonIds: [] }, week: { key: null, lessonIds: [], reviewLessonIds: [] } },
  planProgress: {},
  sentencePractice: {},
  flashcardReview: freshFlashcardReview(),
  training: freshTrainingState(),
});

const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const strings = (value, validIds) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string' && item.trim() && (!validIds || validIds.has(item))))] : [];
const watched = (value) => Object.fromEntries(Object.entries(object(value)).filter(([key, seconds]) => key.trim() && Number.isFinite(seconds) && seconds >= 0).map(([key, seconds]) => [key, Math.floor(seconds)]));
const completed = (value) => Object.fromEntries(Object.entries(object(value)).filter(([key, entry]) => key.trim() && (entry === true || (typeof entry === 'string' && !Number.isNaN(Date.parse(entry))))));
const validDateKey = (key) => typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
const validPlanIdentity = (key) => typeof key === 'string' && /^(today|week):\d{4}-\d{2}-\d{2}$/.test(key);
const normalizePlanProgress = (value, validIds) => Object.fromEntries(Object.entries(object(value)).filter(([key]) => validPlanIdentity(key)).slice(-16).map(([key, ids]) => [key, strings(ids, validIds)]));
const cueIndices = (value, cueCount = 4096) => Array.isArray(value) ? [...new Set(value.filter((index) => Number.isSafeInteger(index) && index >= 0 && index < cueCount))] : [];
const cueProgress = (value, cueCount = 4096) => {
  const raw = object(value), practiced = cueIndices(raw.practiced, cueCount);
  const gotIt = cueIndices(raw.gotIt, cueCount).filter((index) => practiced.includes(index));
  return { lastCue: Number.isSafeInteger(raw.lastCue) && raw.lastCue >= 0 && raw.lastCue < cueCount ? raw.lastCue : 0, practiced, gotIt };
};
const normalizeSentencePractice = (value, validIds) => Object.fromEntries(Object.entries(object(value))
  .filter(([id]) => typeof id === 'string' && (!validIds || validIds.has(id))).slice(-256)
  .map(([id, progress]) => [id, cueProgress(progress)]));

export function dateKey(date = new Date()) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
// Monday is the stable key for a local calendar week, including on Sunday.
export function weekKey(date = new Date()) { const local = new Date(date.getFullYear(), date.getMonth(), date.getDate()); local.setDate(local.getDate() - ((local.getDay() + 6) % 7)); return dateKey(local); }
const normalizePlan = (value, validIds) => {
  const raw = object(value), lessonIds = strings(raw.lessonIds, validIds);
  // `reviewLessonIds` was added after plans were already in use. Missing data
  // is intentionally treated as an empty marker list, never as a new plan.
  return { key: validDateKey(raw.key), lessonIds, reviewLessonIds: strings(raw.reviewLessonIds, validIds).filter((id) => lessonIds.includes(id)) };
};

export function normalizeState(value, validIds) {
  const raw = object(value), settings = object(raw.settings), rawPlans = object(raw.plans), legacy = object(raw.schedule);
  // `schedule` was reserved by an early prototype; the fallback keeps an interrupted local upgrade harmless.
  const plans = { controlled: typeof rawPlans.controlled === 'boolean' ? rawPlans.controlled : Boolean(legacy.controlled), today: normalizePlan(rawPlans.today || legacy.today, validIds), week: normalizePlan(rawPlans.week || legacy.week, validIds) };
  return { watched: watched(raw.watched), completed: completed(raw.completed), favorites: strings(raw.favorites, validIds), review: strings(raw.review, validIds), lastStudyDate: typeof raw.lastStudyDate === 'string' ? raw.lastStudyDate : null, streak: Number.isSafeInteger(raw.streak) && raw.streak >= 0 ? raw.streak : 0, settings: { captions: typeof settings.captions === 'boolean' ? settings.captions : true, speed: [0.75,1,1.25].includes(settings.speed) ? settings.speed : 1, language: settings.language === 'en' ? 'en' : 'zh', playbackMode: normalizePlaybackMode(settings.playbackMode), viewingReminderMinutes: normalizeViewingReminderMinutes(settings.viewingReminderMinutes) }, plans, planProgress: normalizePlanProgress(raw.planProgress, validIds), sentencePractice: normalizeSentencePractice(raw.sentencePractice, validIds), flashcardReview: normalizeFlashcardReview(raw.flashcardReview, validIds), training: normalizeTrainingState(raw.training, validIds) };
}
export function loadState(validIds) { try { return normalizeState(JSON.parse(localStorage.getItem(KEY)), validIds); } catch { return freshState(); } }
export function saveState(state) { localStorage.setItem(KEY, JSON.stringify(state)); return state; }
export function setPlanLessons(state, scope, lessonIds, date = new Date(), validIds, reviewLessonIds) {
  if (!['today', 'week'].includes(scope)) return state;
  const nextLessonIds = strings(lessonIds, validIds);
  const existing = normalizePlan(object(state.plans)[scope], validIds);
  const nextKey = scope === 'today' ? dateKey(date) : weekKey(date);
  // Leave existing Review labels attached during a reorder, but only if the
  // lesson remains in the same plan instance. An expired day/week starts with
  // no labels; supplying markers is used only by Add review.
  const markers = reviewLessonIds === undefined ? (existing.key === nextKey ? existing.reviewLessonIds : []) : reviewLessonIds;
  state.plans[scope] = { key: nextKey, lessonIds: nextLessonIds, reviewLessonIds: strings(markers, validIds).filter((id) => nextLessonIds.includes(id)) };
  return state;
}
/**
 * Clear the two stored parent-plan scopes without touching the child\'s learning
 * history. Plan progress belongs to a date-scoped plan instance, so only the
 * identities currently stored in those two scopes are removed. This is pure so
 * the caller can defer persistence until the parent confirms the action.
 */
export function clearAllPlanContent(state) {
  const raw = object(state), plans = object(raw.plans);
  const identities = new Set(['today', 'week'].map((scope) => {
    const key = validDateKey(object(plans[scope]).key);
    return key ? `${scope}:${key}` : null;
  }).filter(Boolean));
  const clearScope = (scope) => ({ ...object(plans[scope]), lessonIds: [], reviewLessonIds: [] });
  return {
    ...raw,
    plans: { ...plans, today: clearScope('today'), week: clearScope('week') },
    planProgress: Object.fromEntries(Object.entries(object(raw.planProgress)).filter(([identity]) => !identities.has(identity))),
  };
}
export function appendPlanLessons(lessonIds, additions, validIds) {
  const ordered = strings(lessonIds, validIds), known = new Set(ordered);
  strings(additions, validIds).forEach((id) => {
    if (!known.has(id)) { ordered.push(id); known.add(id); }
  });
  return ordered;
}
export function effectivePlan(state, date = new Date(), validIds) {
  const plans = object(state.plans);
  if (!plans.controlled) return { controlled: false, source: null, key: null, identity: null, lessonIds: [], reviewLessonIds: [] };
  const today = normalizePlan(plans.today, validIds);
  if (today.key === dateKey(date) && today.lessonIds.length) return { controlled: true, source: 'today', key: today.key, identity: `today:${today.key}`, lessonIds: today.lessonIds, reviewLessonIds: today.reviewLessonIds };
  const week = normalizePlan(plans.week, validIds);
  if (week.key === weekKey(date) && week.lessonIds.length) return { controlled: true, source: 'week', key: week.key, identity: `week:${week.key}`, lessonIds: week.lessonIds, reviewLessonIds: week.reviewLessonIds };
  return { controlled: true, source: null, key: null, identity: null, lessonIds: [], reviewLessonIds: [] };
}
export function planDoneIds(state, activePlan) { return activePlan?.identity ? strings(object(state.planProgress)[activePlan.identity]).filter((id) => activePlan.lessonIds.includes(id)) : []; }
export function markPlanLessonDone(state, activePlan, id, validIds) { if (!activePlan?.identity || !activePlan.lessonIds.includes(id)) return state; const prior = object(state.planProgress); state.planProgress = Object.fromEntries(Object.entries(prior).filter(([key]) => validPlanIdentity(key) && key !== activePlan.identity).slice(-15)); state.planProgress[activePlan.identity] = strings([...(prior[activePlan.identity] || []), id], validIds).filter((lessonId) => activePlan.lessonIds.includes(lessonId)); return state; }
export function isPlanComplete(state, activePlan) { return Boolean(activePlan?.lessonIds.length) && planDoneIds(state, activePlan).length === activePlan.lessonIds.length; }
export function nextUnfinishedPlanLesson(activePlan, doneIds, currentId) { const ids = activePlan?.lessonIds || [], index = ids.indexOf(currentId); if (!ids.length || index < 0 || doneIds.length >= ids.length) return null; for (let offset = 1; offset <= ids.length; offset += 1) { const candidate = ids[(index + offset) % ids.length]; if (!doneIds.includes(candidate)) return candidate; } return null; }
export function playbackEndAction({ mode, lessonIds, currentId, controlled = false, doneIds = [] } = {}) {
  const playbackMode = normalizePlaybackMode(mode), ids = Array.isArray(lessonIds) ? lessonIds.filter((id) => typeof id === 'string' && id) : [];
  if (!ids.includes(currentId)) return { type: 'stop', nextId: null };
  if (playbackMode === 'repeat-one') return { type: 'repeat', nextId: currentId };
  if (controlled && playbackMode === 'auto-next') {
    const nextId = nextUnfinishedPlanLesson({ lessonIds: ids }, doneIds, currentId);
    return nextId ? { type: 'next', nextId } : { type: 'complete', nextId: null };
  }
  const index = ids.indexOf(currentId), nextId = ids[index + 1] || (playbackMode === 'loop-list' ? ids[0] : null);
  return nextId ? { type: 'next', nextId } : { type: 'stop', nextId: null };
}
export function displayLessonTitle(value) { return String(value || 'Untitled lesson').replace(/undefined/gi, '').replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim() || 'Untitled lesson'; }
export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]); }
export function markStudy(state, date = new Date()) { const today = dateKey(date); if (state.lastStudyDate === today) return state; const yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1); state.streak = state.lastStudyDate === dateKey(yesterday) ? state.streak + 1 : 1; state.lastStudyDate = today; return state; }
export function toggleFavorite(state, id) { state.favorites = state.favorites.includes(id) ? state.favorites.filter((value) => value !== id) : [...state.favorites, id]; return state; }
export function completeLesson(state, id) { state.completed[id] = true; state.review = [...state.review.filter((value) => value !== id), id]; return markStudy(state); }
export function recordProgress(state, id, seconds) { state.watched[id] = Math.max(state.watched[id] || 0, Math.floor(seconds)); return markStudy(state); }
/**
 * Store only a validated, local learning event. This is intentionally separate
 * from legacy playback progress: position changes and manual completion do not
 * become training counts without the activity-specific evidence required here.
 */
export function recordTrainingEvent(state, event, validIds) {
  const result = applyTrainingEvent(state.training, event, validIds);
  if (result.accepted) state.training = result.training;
  return result;
}
export function setTrainingActivityOrder(state, order) {
  state.training = { ...normalizeTrainingState(state.training), activityOrder: normalizeTrainingActivityOrder(order) };
  return state;
}
export function resumePosition(saved, duration, completed = false) { return !completed && Number.isFinite(saved) && saved > 0 && Number.isFinite(duration) && duration > 0 ? Math.min(saved, Math.max(0, duration - 0.25)) : 0; }
export function reviewIdsForToday(state, count = 3, date = new Date()) { const queue = state.review; if (!queue.length) return []; const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); const offset = Math.floor(localMidnight / 86400000) % queue.length; return Array.from({ length: Math.min(count, queue.length) }, (_, index) => queue[(offset + index) % queue.length]); }

/**
 * Produce explainable, local-only replay suggestions. This deliberately uses
 * activity and the child's sentence self-checks; it does not infer mastery.
 * `lessonsOrIds` accepts a Set of ids, ids, or lesson records for easy tests.
 */
export function reviewSuggestions(state, lessonsOrIds, date = new Date(), limit = 6, excludedLessonIds = []) {
  const records = lessonsOrIds instanceof Set ? [...lessonsOrIds] : Array.isArray(lessonsOrIds) ? lessonsOrIds : [];
  const validIds = new Set(records.map((entry) => typeof entry === 'string' ? entry : entry?.id).filter((id) => typeof id === 'string' && id));
  const max = Math.max(0, Math.min(6, Number.isSafeInteger(limit) ? limit : 6));
  const active = effectivePlan({ ...state, plans: { ...object(state.plans), controlled: true } }, date, validIds);
  const excluded = new Set([...active.lessonIds, ...strings(excludedLessonIds, validIds)]);
  const result = [], add = (id, reason, source) => {
    if (result.length >= max || !validIds.has(id) || excluded.has(id) || result.some((item) => item.id === id)) return;
    result.push({ id, reason, source });
  };
  Object.entries(object(state.sentencePractice)).forEach(([id, raw]) => {
    if (!validIds.has(id)) return;
    const progress = cueProgress(raw);
    const remaining = progress.practiced.filter((index) => !progress.gotIt.includes(index)).length;
    if (remaining) add(id, `${remaining} sentence${remaining === 1 ? ' needs' : 's need'} another try`, 'sentence-practice');
  });
  reviewIdsForToday(state, 3, date).forEach((id) => {
    if (object(state.completed)[id]) add(id, 'Ready for today’s replay', 'daily-queue');
  });
  strings(state.favorites, validIds).forEach((id) => {
    if (object(state.completed)[id]) add(id, 'Completed favourite', 'favourite');
  });
  return result;
}

/** Return a lesson's bounded sentence-practice state without trusting storage. */
export function sentenceProgress(state, id, cueCount) {
  return cueProgress(object(state.sentencePractice)[id], Math.max(0, Number.isSafeInteger(cueCount) ? cueCount : 0));
}

/** Persist a bounded cue position and the child's local self-assessment. */
export function updateSentenceProgress(state, id, cueCount, { lastCue, practiced, gotIt } = {}) {
  if (typeof id !== 'string' || !id || !Number.isSafeInteger(cueCount) || cueCount < 1) return state;
  const current = sentenceProgress(state, id, cueCount);
  const next = cueProgress({
    lastCue: lastCue === undefined ? current.lastCue : lastCue,
    practiced: practiced === undefined ? current.practiced : practiced,
    gotIt: gotIt === undefined ? current.gotIt : gotIt,
  }, cueCount);
  const entries = Object.entries(object(state.sentencePractice)).filter(([key]) => key !== id).slice(-255);
  state.sentencePractice = Object.fromEntries([...entries, [id, next]]);
  return state;
}
