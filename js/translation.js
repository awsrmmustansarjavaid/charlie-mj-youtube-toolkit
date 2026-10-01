/*
  Charlie MJ YouTube Toolkit
  File: js/translation.js
  Purpose:
    Provide lightweight browser-side translation for language learners.
  Provider:
    MyMemory's public translation endpoint is used for small study requests.
  Important:
    Translation is machine-assisted and contextual accuracy is not guaranteed.
*/

const cache = new Map();
const API = "https://api.mymemory.translated.net/get";

/**
 * Normalize a user-facing language name/code to a translation code.
 *
 * @param {string} value - Language name or ISO code.
 * @returns {string} ISO language code.
 */
export function languageCode(value) {
  const raw = String(value || "en").trim().toLowerCase();
  const map = {
    turkish: "tr", türkçe: "tr", turkce: "tr",
    english: "en", urdu: "ur", اردو: "ur",
    arabic: "ar", العربية: "ar", persian: "fa", farsi: "fa",
    german: "de", french: "fr", spanish: "es", italian: "it",
    russian: "ru", portuguese: "pt", dutch: "nl"
  };
  return map[raw] || raw.split(/[-_]/)[0] || "en";
}

/**
 * Translate a short piece of text.
 *
 * @param {string} text - Source text.
 * @param {string} source - Source language.
 * @param {string} target - Target language.
 * @returns {Promise<string>} Translation.
 */
export async function translateText(text, source, target) {
  const clean = String(text || "").trim();
  if (!clean) return "";

  const sourceCode = languageCode(source);
  const targetCode = languageCode(target);
  if (sourceCode === targetCode) return clean;

  const key = `${sourceCode}|${targetCode}|${clean.toLocaleLowerCase()}`;
  if (cache.has(key)) return cache.get(key);

  const params = new URLSearchParams({
    q: clean,
    langpair: `${sourceCode}|${targetCode}`
  });

  const response = await fetch(`${API}?${params.toString()}`, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Translation request failed (${response.status}).`);
  }

  const data = await response.json();
  const result = data?.responseData?.translatedText || clean;
  cache.set(key, result);
  return result;
}

/**
 * Translate individual word tokens while preserving punctuation.
 *
 * @param {string} sentence - Source sentence.
 * @param {string} source - Source language.
 * @param {string} target - Target language.
 * @returns {Promise<Array<object>>} Word/translation pairs.
 */
export async function translateWords(sentence, source, target) {
  const tokens = String(sentence || "").match(/[\p{L}\p{M}’'-]+|[^\p{L}\p{M}’'-]+/gu) || [];
  const output = [];

  for (const token of tokens) {
    if (!/[\p{L}\p{M}]/u.test(token)) {
      output.push({ token, translation: "", isWord: false });
      continue;
    }

    try {
      const translation = await translateText(token, source, target);
      output.push({ token, translation, isWord: true });
    } catch {
      output.push({ token, translation: "—", isWord: true });
    }
  }

  return output;
}
