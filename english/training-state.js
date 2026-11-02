/**
 * Local-only, behaviour-only learning records.
 *
 * These helpers deliberately store compact summaries, not recordings,
 * transcripts, inferred attention, pronunciation scores, or mastery labels.
 * Callers must provide a validated, opaque event id from the activity that
 * actually occurred; duplicate ids are ignored.
 */
export const TRAINING_SCHEMA_VERSION = 5;
export const TRAINING_ACTIVITY_TYPES = ['watch', 'follow-read', 'speak', 'listen', 'answer'];
export const TRAINING_EXECUTABLE_ACTIVITIES = ['watch', 'listen', 'follow-read', 'speak'];

const MAX_LESSONS = 256;
const MAX_EVENT_IDS = 128;
const MAX_WATCH_RUN_IDS = 64;
const MAX_FOLLOW_RUN_IDS = 64;
const MAX_LISTEN_RUN_IDS = 64;
const MAX_COUNT = 999999;
const MAX_SECONDS = 31536000;
const MAX_POSITION_SECONDS = 21600;
const MAX_ATTEMPTS = 10;
const MAX_LESSON_ID_LENGTH = 512;
const SOURCE_BY_ACTIVITY = {
  watch: 'video-playback',
  'follow-read': 'follow-read-playback',
  speak: 'microphone-recording',
  listen: 'audio-playback',
  answer: 'verified-exercise',
};

const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const finiteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const validLessonId = (value, validIds) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,511}$/.test(value) && value.length <= MAX_LESSON_ID_LENGTH && (!validIds || validIds.has(value));
const boundedInteger = (value, max = MAX_COUNT) => Number.isFinite(value) && value >= 0 ? Math.min(max, Math.floor(value)) : 0;
const boundedSeconds = (value, max = MAX_SECONDS) => boundedInteger(value, max);
const validEventId = (value) => typeof value === 'string' && /^[A-Za-z0-9._:-]{1,96}$/.test(value);
const add = (left, right, max = MAX_COUNT) => Math.min(max, left + right);
const sameNumber = (left, right) => Math.abs(left - right) < 0.26;
const PLAYBACK_EPSILON_SECONDS = 0.000001;
const withinPlaybackPrecision = (covered, played) => covered <= played + PLAYBACK_EPSILON_SECONDS;

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? value : null;
}

function lastMeta(raw, source) {
  const value = object(raw);
  return {
    lastDate: validDate(value.lastDate),
    lastSource: value.lastSource === source ? source : null,
  };
}

function activeFollowRun(raw) {
  const value = object(raw);
  if (!validEventId(value.runId) || !finiteNumber(value.durationSeconds) || value.durationSeconds <= 0 || value.durationSeconds > MAX_POSITION_SECONDS
    || !finiteNumber(value.positionSeconds) || value.positionSeconds <= 0 || value.positionSeconds >= value.durationSeconds) return null;
  return { runId: value.runId, durationSeconds: value.durationSeconds, positionSeconds: value.positionSeconds };
}

function activeWatchRun(raw) {
  const value = object(raw);
  if (!validEventId(value.runId) || !validDate(value.date) || !finiteNumber(value.durationSeconds) || value.durationSeconds <= 0 || value.durationSeconds > MAX_POSITION_SECONDS
    || !finiteNumber(value.positionSeconds) || value.positionSeconds <= 0 || value.positionSeconds >= value.durationSeconds) return null;
  return { runId: value.runId, date: value.date, durationSeconds: value.durationSeconds, positionSeconds: value.positionSeconds };
}

function playbackSummary(raw, source) {
  const value = object(raw);
  return {
    qualifiedCount: boundedInteger(value.qualifiedCount),
    seconds: boundedSeconds(value.seconds),
    positionSeconds: boundedSeconds(value.positionSeconds, MAX_POSITION_SECONDS),
    ...lastMeta(value, source),
    ...(source === SOURCE_BY_ACTIVITY.watch ? { lastQualifiedDate: validDate(value.lastQualifiedDate), activeRun: activeWatchRun(value.activeRun) } : {}),
    ...(source === SOURCE_BY_ACTIVITY['follow-read'] ? { activeRun: activeFollowRun(value.activeRun) } : {}),
  };
}

function speakSummary(raw) {
  const value = object(raw);
  return { attempts: boundedInteger(value.attempts), seconds: boundedSeconds(value.seconds), ...lastMeta(value, SOURCE_BY_ACTIVITY.speak) };
}

function listenSummary(raw) {
  const value = object(raw), seconds = boundedSeconds(value.seconds);
  const active = object(value.activeRun);
  const activeRun = validEventId(active.runId) && validDate(active.date) && finiteNumber(active.durationSeconds) && active.durationSeconds > 0 && active.durationSeconds <= MAX_POSITION_SECONDS && finiteNumber(active.positionSeconds) && active.positionSeconds > 0 && active.positionSeconds < active.durationSeconds
    ? { runId: active.runId, date: active.date, durationSeconds: active.durationSeconds, positionSeconds: active.positionSeconds } : null;
  return { seconds, qualifiedMinutes: Math.floor(seconds / 60), positionSeconds: boundedSeconds(value.positionSeconds, MAX_POSITION_SECONDS), dailyDate: validDate(value.dailyDate), dailySeconds: boundedSeconds(value.dailySeconds), dailyCompletedDate: validDate(value.dailyCompletedDate), activeRun, ...lastMeta(value, SOURCE_BY_ACTIVITY.listen) };
}

function answerSummary(raw) {
  const value = object(raw), answers = boundedInteger(value.answers), correct = Math.min(answers, boundedInteger(value.correct));
  const incorrect = Math.min(Math.max(0, answers - correct), boundedInteger(value.incorrect));
  return {
    answers,
    correct,
    incorrect,
    hints: boundedInteger(value.hints),
    attempts: Math.max(answers, boundedInteger(value.attempts)),
    ...lastMeta(value, SOURCE_BY_ACTIVITY.answer),
  };
}

function lessonSummary(raw) {
  const value = object(raw);
  return {
    watch: playbackSummary(value.watch, SOURCE_BY_ACTIVITY.watch),
    'follow-read': playbackSummary(value['follow-read'], SOURCE_BY_ACTIVITY['follow-read']),
    speak: speakSummary(value.speak),
    listen: listenSummary(value.listen),
    answer: answerSummary(value.answer),
  };
}

export function freshTrainingState() {
  return { version: TRAINING_SCHEMA_VERSION, lessons: {}, recentEventIds: [], recentWatchRunIds: [], recentFollowRunIds: [], recentListenRunIds: [], activityOrder: [...TRAINING_EXECUTABLE_ACTIVITIES] };
}

export function normalizeTrainingActivityOrder(value) {
  const selected = [...new Set(Array.isArray(value) ? value.filter((activity) => TRAINING_EXECUTABLE_ACTIVITIES.includes(activity)) : [])];
  // v2 stored [watch, follow-read, speak]. Listening is an intentional next
  // step after watching, so migration inserts it there rather than appending.
  if (!selected.includes('watch')) selected.unshift('watch');
  if (!selected.includes('listen')) selected.splice(selected.indexOf('watch') + 1, 0, 'listen');
  return [...selected, ...TRAINING_EXECUTABLE_ACTIVITIES.filter((activity) => !selected.includes(activity))];
}

export function normalizeTrainingState(value, validIds) {
  const raw = object(value);
  const lessons = Object.entries(object(raw.lessons))
    .filter(([id]) => validLessonId(id, validIds))
    .slice(-MAX_LESSONS)
    .map(([id, entry]) => [id, lessonSummary(entry)]);
  const recentEventIds = [...new Set(Array.isArray(raw.recentEventIds) ? raw.recentEventIds.filter(validEventId) : [])].slice(-MAX_EVENT_IDS);
  const recentWatchRunIds = [...new Set(Array.isArray(raw.recentWatchRunIds) ? raw.recentWatchRunIds.filter(validEventId) : [])].slice(-MAX_WATCH_RUN_IDS);
  const recentFollowRunIds = [...new Set(Array.isArray(raw.recentFollowRunIds) ? raw.recentFollowRunIds.filter(validEventId) : [])].slice(-MAX_FOLLOW_RUN_IDS);
  const recentListenRunIds = [...new Set(Array.isArray(raw.recentListenRunIds) ? raw.recentListenRunIds.filter(validEventId) : [])].slice(-MAX_LISTEN_RUN_IDS);
  return { version: TRAINING_SCHEMA_VERSION, lessons: Object.fromEntries(lessons), recentEventIds, recentWatchRunIds, recentFollowRunIds, recentListenRunIds, activityOrder: normalizeTrainingActivityOrder(raw.activityOrder) };
}

function validPlayback(event, activity) {
  const { durationSeconds, observedSeconds, coveredSeconds, positionSeconds } = event;
  if (event.actualPlayback !== true || event.source !== SOURCE_BY_ACTIVITY[activity]
    || !finiteNumber(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_POSITION_SECONDS
    || !finiteNumber(observedSeconds) || observedSeconds <= 0 || observedSeconds > MAX_POSITION_SECONDS
    || !finiteNumber(coveredSeconds) || coveredSeconds <= 0 || coveredSeconds > durationSeconds || !withinPlaybackPrecision(coveredSeconds, observedSeconds)
    || !finiteNumber(positionSeconds) || positionSeconds < 0 || positionSeconds > durationSeconds) return null;
  // Completion is intentionally conservative: 90% *observed coverage* is
  // required, so a position change or a seek-to-end can never make a pass.
  return {
    durationSeconds,
    seconds: Math.max(1, Math.floor(observedSeconds)),
    coveredSeconds,
    positionSeconds,
    qualified: coveredSeconds + PLAYBACK_EPSILON_SECONDS >= durationSeconds * 0.9
      && observedSeconds + PLAYBACK_EPSILON_SECONDS >= durationSeconds * 0.9
      && event.interrupted !== true,
  };
}

function applyPlayback(summary, event, activity) {
  const playback = validPlayback(event, activity);
  if (!playback) return null;
  if (activity === 'watch') return applyWatch(summary, event, playback);
  if (activity === 'follow-read') return applyFollowRead(summary, event, playback);
}

function applyWatch(summary, event, playback) {
  const { runId, runStartSeconds, runEndSeconds } = event;
  if (!validEventId(runId) || !finiteNumber(runStartSeconds) || !finiteNumber(runEndSeconds)
    || runStartSeconds < 0 || runEndSeconds <= runStartSeconds || runEndSeconds > playback.durationSeconds
    || !sameNumber(runEndSeconds - runStartSeconds, playback.coveredSeconds)
    || !sameNumber(runEndSeconds, playback.positionSeconds)) return null;
  const broken = event.interrupted === true;
  const prior = summary.activeRun;
  if (!broken && prior && prior.date === event.date) {
    if (prior.runId !== runId || !sameNumber(prior.durationSeconds, playback.durationSeconds) || !sameNumber(prior.positionSeconds, runStartSeconds)) return null;
  } else if (!broken && !sameNumber(runStartSeconds, 0)) return null;
  const qualified = !broken && runEndSeconds >= playback.durationSeconds * 0.9;
  return {
    ...summary,
    seconds: add(summary.seconds, playback.seconds, MAX_SECONDS),
    positionSeconds: Math.floor(runEndSeconds),
    qualifiedCount: qualified ? add(summary.qualifiedCount, 1) : summary.qualifiedCount,
    lastQualifiedDate: qualified ? event.date : summary.lastQualifiedDate,
    lastDate: event.date,
    lastSource: event.source,
    activeRun: broken || qualified ? null : { runId, date: event.date, durationSeconds: playback.durationSeconds, positionSeconds: runEndSeconds },
  };
}

function applyFollowRead(summary, event, playback) {
  const { runId, runStartSeconds, runEndSeconds } = event;
  if (event.interrupted === true || !validEventId(runId) || !finiteNumber(runStartSeconds) || !finiteNumber(runEndSeconds)
    || runStartSeconds < 0 || runEndSeconds <= runStartSeconds || runEndSeconds > playback.durationSeconds
    || !sameNumber(runEndSeconds - runStartSeconds, playback.coveredSeconds)
    || !sameNumber(runEndSeconds, playback.positionSeconds)) return null;
  const prior = summary.activeRun;
  if (prior) {
    if (prior.runId !== runId || !sameNumber(prior.durationSeconds, playback.durationSeconds) || !sameNumber(prior.positionSeconds, runStartSeconds)) return null;
  } else if (!sameNumber(runStartSeconds, 0)) return null;
  const qualified = runEndSeconds >= playback.durationSeconds * 0.9;
  return {
    ...summary,
    seconds: add(summary.seconds, playback.seconds, MAX_SECONDS),
    positionSeconds: Math.floor(runEndSeconds),
    qualifiedCount: qualified ? add(summary.qualifiedCount, 1) : summary.qualifiedCount,
    lastDate: event.date,
    lastSource: event.source,
    // A completed pass clears its trusted resume point. The next pass must
    // begin at zero and cannot reuse the old run id or coverage.
    activeRun: qualified ? null : { runId, durationSeconds: playback.durationSeconds, positionSeconds: runEndSeconds },
  };
}

function applySpeak(summary, event) {
  const { durationSeconds } = event;
  if (event.source !== SOURCE_BY_ACTIVITY.speak || event.recordingCaptured !== true || !finiteNumber(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_POSITION_SECONDS) return null;
  return { ...summary, attempts: add(summary.attempts, 1), seconds: add(summary.seconds, Math.max(1, Math.floor(durationSeconds)), MAX_SECONDS), lastDate: event.date, lastSource: event.source };
}

function applyListen(summary, event) {
  const { durationSeconds, playedSeconds, coveredSeconds, positionSeconds, runId, runStartSeconds, runEndSeconds } = event;
  if (event.source !== SOURCE_BY_ACTIVITY.listen || event.actualPlayback !== true || !validEventId(runId)
    || !finiteNumber(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_POSITION_SECONDS
    || !finiteNumber(playedSeconds) || playedSeconds <= 0 || playedSeconds > MAX_POSITION_SECONDS
    || !finiteNumber(coveredSeconds) || coveredSeconds <= 0 || !withinPlaybackPrecision(coveredSeconds, playedSeconds) || coveredSeconds > durationSeconds
    || !finiteNumber(positionSeconds) || positionSeconds < 0 || positionSeconds > durationSeconds
    || !finiteNumber(runStartSeconds) || !finiteNumber(runEndSeconds) || runStartSeconds < 0 || runEndSeconds <= runStartSeconds || runEndSeconds > durationSeconds
    || !sameNumber(runEndSeconds - runStartSeconds, coveredSeconds) || !sameNumber(runEndSeconds, positionSeconds)) return null;
  const broken = event.continuityBroken === true;
  const prior = summary.activeRun;
  if (!broken && prior && prior.date === event.date) {
    if (prior.runId !== runId || !sameNumber(prior.durationSeconds, durationSeconds) || !sameNumber(prior.positionSeconds, runStartSeconds)) return null;
  } else if (!broken && !sameNumber(runStartSeconds, 0)) return null;
  const seconds = add(summary.seconds, Math.max(1, Math.floor(playedSeconds)), MAX_SECONDS);
  const dailySeconds = summary.dailyDate === event.date ? add(summary.dailySeconds, Math.max(1, Math.floor(playedSeconds)), MAX_SECONDS) : Math.max(1, Math.floor(playedSeconds));
  // `runEndSeconds` is the cumulative trusted position across same-run
  // segments; `playedSeconds` is only this event's increment.
  const completed = !broken && runEndSeconds + PLAYBACK_EPSILON_SECONDS >= durationSeconds * 0.9;
  return { ...summary, seconds, qualifiedMinutes: Math.floor(seconds / 60), positionSeconds: Math.floor(positionSeconds), dailyDate: event.date, dailySeconds, dailyCompletedDate: completed ? event.date : summary.dailyCompletedDate, activeRun: broken || completed ? null : { runId, date: event.date, durationSeconds, positionSeconds: runEndSeconds }, lastDate: event.date, lastSource: event.source };
}

function applyAnswer(summary, event) {
  const { attempts } = event, hints = event.hints === undefined ? 0 : event.hints;
  if (event.source !== SOURCE_BY_ACTIVITY.answer || event.verifiedAnswer !== true || typeof event.correct !== 'boolean'
    || !Number.isSafeInteger(attempts) || attempts < 1 || attempts > MAX_ATTEMPTS
    || !Number.isSafeInteger(hints) || hints < 0 || hints > MAX_ATTEMPTS) return null;
  const answers = add(summary.answers, 1);
  const correct = event.correct ? Math.min(answers, add(summary.correct, 1)) : summary.correct;
  const incorrect = event.correct ? summary.incorrect : Math.min(Math.max(0, answers - correct), add(summary.incorrect, 1));
  return {
    ...summary,
    answers,
    correct,
    incorrect,
    hints: add(summary.hints, hints),
    attempts: Math.max(answers, add(summary.attempts, attempts)),
    lastDate: event.date,
    lastSource: event.source,
  };
}

/**
 * Return a new, bounded training state after one verified local activity.
 * A rejection leaves the supplied state untouched. Accepted events describe
 * behaviour only and never claim correctness, attention, or language mastery.
 */
export function applyTrainingEvent(training, event, validIds) {
  const normalized = normalizeTrainingState(training, validIds);
  const raw = object(event), activity = raw.activity;
  if (!TRAINING_ACTIVITY_TYPES.includes(activity)) return { accepted: false, reason: 'unknown-activity', training: normalized };
  if (!validLessonId(raw.lessonId, validIds)) return { accepted: false, reason: 'unknown-lesson', training: normalized };
  if (!validEventId(raw.eventId)) return { accepted: false, reason: 'invalid-event-id', training: normalized };
  if (!validDate(raw.date)) return { accepted: false, reason: 'invalid-date', training: normalized };
  if (normalized.recentEventIds.includes(raw.eventId)) return { accepted: false, reason: 'duplicate-event', training: normalized };
  if (activity === 'watch' && normalized.recentWatchRunIds.includes(raw.runId)) return { accepted: false, reason: 'duplicate-watch-run', training: normalized };
  if (activity === 'follow-read' && normalized.recentFollowRunIds.includes(raw.runId)) return { accepted: false, reason: 'duplicate-follow-run', training: normalized };
  if (activity === 'listen' && normalized.recentListenRunIds.includes(raw.runId)) return { accepted: false, reason: 'duplicate-listen-run', training: normalized };

  const lessons = { ...normalized.lessons };
  const current = lessonSummary(lessons[raw.lessonId]);
  let updated = null;
  if (activity === 'watch' || activity === 'follow-read') updated = applyPlayback(current[activity], raw, activity);
  if (activity === 'speak') updated = applySpeak(current.speak, raw);
  if (activity === 'listen') updated = applyListen(current.listen, raw);
  if (activity === 'answer') updated = applyAnswer(current.answer, raw);
  if (!updated) return { accepted: false, reason: 'unqualified-event', training: normalized };

  const nextLesson = { ...current, [activity]: updated };
  const entries = Object.entries(lessons).filter(([id]) => id !== raw.lessonId).slice(-(MAX_LESSONS - 1));
  const recentEventIds = [...normalized.recentEventIds, raw.eventId].slice(-MAX_EVENT_IDS);
  const completedWatchRun = activity === 'watch' && updated.activeRun === null ? raw.runId : null;
  const recentWatchRunIds = completedWatchRun ? [...normalized.recentWatchRunIds, completedWatchRun].slice(-MAX_WATCH_RUN_IDS) : normalized.recentWatchRunIds;
  const completedFollowRun = activity === 'follow-read' && updated.activeRun === null ? raw.runId : null;
  const recentFollowRunIds = completedFollowRun ? [...normalized.recentFollowRunIds, completedFollowRun].slice(-MAX_FOLLOW_RUN_IDS) : normalized.recentFollowRunIds;
  const completedListenRun = activity === 'listen' && updated.activeRun === null ? raw.runId : null;
  const recentListenRunIds = completedListenRun ? [...normalized.recentListenRunIds, completedListenRun].slice(-MAX_LISTEN_RUN_IDS) : normalized.recentListenRunIds;
  return { accepted: true, reason: null, training: { version: TRAINING_SCHEMA_VERSION, lessons: Object.fromEntries([...entries, [raw.lessonId, nextLesson]]), recentEventIds, recentWatchRunIds, recentFollowRunIds, recentListenRunIds, activityOrder: normalized.activityOrder } };
}
