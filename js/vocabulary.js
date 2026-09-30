/*
  Charlie MJ YouTube Toolkit
  File: js/vocabulary.js
  Purpose:
    Provide a deterministic, offline vocabulary candidate extractor.
  Important:
    This is not an AI dictionary and does not claim to know the correct
    translation of every word. It identifies useful-looking tokens and lets
    the learner edit or export them.
*/

/**
 * Extract frequent word candidates from transcript text.
 *
 * @param {string} text - Clean transcript.
 * @param {number} limit - Maximum number of candidates.
 * @returns {Array<{word:string,count:number}>} Candidate vocabulary.
 */
export function extractVocabulary(text, limit = 40) {
  const stopWords = new Set([
    "the", "and", "that", "this", "with", "for", "you", "are", "was", "have",
    "has", "from", "they", "your", "but", "not", "can", "will", "what", "how",
    "bir", "ve", "bu", "şu", "için", "ile", "çok", "ben", "sen", "biz", "siz",
    "da", "de", "mi", "mı", "mu", "mü"
  ]);

  const tokens = text
    .toLocaleLowerCase()
    .match(/[\p{L}\p{M}’'-]{3,}/gu) || [];

  const counts = new Map();

  for (const token of tokens) {
    if (stopWords.has(token)) {
      continue;
    }

    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Render vocabulary candidates into a target element.
 *
 * @param {HTMLElement} container - Target element.
 * @param {Array<object>} words - Vocabulary candidates.
 */
export function renderVocabulary(container, words) {
  container.innerHTML = "";

  if (!words.length) {
    container.innerHTML = '<p class="empty-state">No vocabulary candidates found.</p>';
    return;
  }

  words.forEach((item) => {
    const row = document.createElement("div");
    row.className = "vocab-item";

    const word = document.createElement("strong");
    word.textContent = item.word;

    const count = document.createElement("small");
    count.textContent = `Frequency: ${item.count}`;

    row.append(word, count);
    container.append(row);
  });
}
