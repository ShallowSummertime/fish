const HEX = /^[a-f0-9]{64}$/;
const LESSON_ID = /^[a-f0-9]{16,128}$/;
const STATES = new Set(['needs-confirmation', 'confirmed', 'removed']);
const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const iso = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;

export const freshFlashcardReview = () => ({ version: 1, decks: {} });

export function normalizeFlashcardReview(value, validIds) {
  const raw = object(value), decks = Object.entries(object(raw.decks)).filter(([fingerprint, deck]) => HEX.test(fingerprint) && LESSON_ID.test(object(deck).lessonId) && (!validIds || validIds.has(object(deck).lessonId))).slice(-64).map(([fingerprint, deck]) => {
    const decisions = Object.entries(object(deck.decisions)).filter(([word, decision]) => /^[a-z]{2,20}$/.test(word) && STATES.has(object(decision).status) && (object(decision).candidateId === null || HEX.test(object(decision).candidateId))).slice(-3).map(([word, decision]) => [word, { candidateId: object(decision).candidateId ?? null, status: object(decision).status, updatedAt: iso(object(decision).updatedAt) }]);
    return [fingerprint, { lessonId: object(deck).lessonId, updatedAt: iso(object(deck).updatedAt), decisions: Object.fromEntries(decisions) }];
  });
  return { version: 1, decks: Object.fromEntries(decks) };
}

export function flashcardDecision(review, deck, wordKey) {
  const card = cardFor(deck, wordKey);
  if (!card) return null;
  const storedDeck = normalizeFlashcardReview(review).decks[deck.fingerprint];
  const decision = storedDeck?.lessonId === deck.lessonId ? storedDeck.decisions?.[wordKey] : null;
  if (!decision || !STATES.has(decision.status)) return null;
  if (decision.status === 'removed') return decision.candidateId === null ? decision : null;
  return HEX.test(decision.candidateId || '') && card.candidates.some((candidate) => candidate?.id === decision.candidateId) ? decision : null;
}

function cardFor(deck, wordKey) {
  if (!deck || !HEX.test(deck.fingerprint) || !LESSON_ID.test(deck.lessonId) || !/^[a-z]{2,20}$/.test(wordKey) || !Array.isArray(deck.cards)) return null;
  const card = deck.cards.find((entry) => entry?.wordKey === wordKey);
  if (!card || !Array.isArray(card.candidates) || new Set(card.candidates.map((candidate) => candidate?.id)).size !== card.candidates.length || !card.candidates.every((candidate) => HEX.test(candidate?.id || ''))) return null;
  return card;
}
function validCard(deck, wordKey) { return Boolean(cardFor(deck, wordKey)); }
function update(review, deck, wordKey, decision) {
  const normalized = normalizeFlashcardReview(review), now = new Date().toISOString();
  if (!validCard(deck, wordKey)) return normalized;
  const prior = normalized.decks[deck.fingerprint] || { lessonId: deck.lessonId, updatedAt: now, decisions: {} };
  normalized.decks = Object.fromEntries([...Object.entries(normalized.decks).filter(([key]) => key !== deck.fingerprint).slice(-63), [deck.fingerprint, { lessonId: deck.lessonId, updatedAt: now, decisions: { ...prior.decisions, [wordKey]: { ...decision, updatedAt: now } } }]]);
  return normalized;
}

export function selectFlashcardCandidate(review, deck, wordKey, candidateId) {
  const card = deck?.cards?.find((entry) => entry?.wordKey === wordKey);
  if (!card?.candidates?.some((candidate) => candidate?.id === candidateId) || !HEX.test(candidateId)) return normalizeFlashcardReview(review);
  return update(review, deck, wordKey, { candidateId, status: 'needs-confirmation' });
}
export function confirmFlashcardCandidate(review, deck, wordKey) {
  const prior = flashcardDecision(review, deck, wordKey);
  return prior?.candidateId ? update(review, deck, wordKey, { candidateId: prior.candidateId, status: 'confirmed' }) : normalizeFlashcardReview(review);
}
export function removeFlashcardCard(review, deck, wordKey) { return update(review, deck, wordKey, { candidateId: null, status: 'removed' }); }
export function restoreFlashcardCard(review, deck, wordKey) { return update(review, deck, wordKey, { candidateId: null, status: 'needs-confirmation' }); }
export function confirmedFlashcardCount(review, deck) { return (deck?.cards || []).filter((card) => flashcardDecision(review, deck, card.wordKey)?.status === 'confirmed').length; }
