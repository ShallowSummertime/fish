export const VIEWING_REMINDER_DEFAULT_MINUTES = 20;
export const VIEWING_REMINDER_MIN_MINUTES = 5;
export const VIEWING_REMINDER_MAX_MINUTES = 120;

export function normalizeViewingReminderMinutes(value) {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return VIEWING_REMINDER_DEFAULT_MINUTES;
  return Math.min(VIEWING_REMINDER_MAX_MINUTES, Math.max(VIEWING_REMINDER_MIN_MINUTES, Math.round(numeric)));
}

export const freshViewingReminderTimer = () => ({ accumulatedMs: 0, playingSinceMs: null });

export function startViewingReminderTimer(timer, now = performance.now()) {
  if (timer.playingSinceMs !== null) return timer;
  return { ...timer, playingSinceMs: now };
}

export function stopViewingReminderTimer(timer, now = performance.now()) {
  if (timer.playingSinceMs === null) return timer;
  return { accumulatedMs: timer.accumulatedMs + Math.max(0, now - timer.playingSinceMs), playingSinceMs: null };
}

export function resetViewingReminderTimer() {
  return freshViewingReminderTimer();
}

export function isViewingReminderDue(timer, minutes, now = performance.now()) {
  const stopped = stopViewingReminderTimer(timer, now);
  return stopped.accumulatedMs >= normalizeViewingReminderMinutes(minutes) * 60_000;
}

export function viewingReminderAction(timer, minutes, lessonEnded = false, now = performance.now()) {
  if (!isViewingReminderDue(timer, minutes, now)) return 'none';
  return lessonEnded ? 'force-break' : 'show-warning';
}

export function speakViewingReminder(message, language, speech = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance) {
  if (!speech || typeof speech.speak !== 'function' || typeof Utterance !== 'function') return false;
  const utterance = new Utterance(String(message || ''));
  utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  speech.cancel?.();
  speech.speak(utterance);
  return true;
}
