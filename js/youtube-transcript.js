/*
  Charlie MJ YouTube Toolkit
  File: js/youtube-transcript.js
  Purpose:
    Retrieve publicly available YouTube caption tracks from a pasted video URL.

  Architecture note:
    GitHub Pages has no server-side runtime. The module first attempts the
    public YouTube timed-text endpoint from the browser. If the browser blocks
    the request because of cross-origin rules, it retries through a public
    read-only CORS proxy. This is a best-effort browser architecture; YouTube
    can change or restrict caption endpoints at any time.
*/

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`
];

/**
 * Fetch text directly and then through a CORS proxy when required.
 *
 * @param {string} url - Resource URL.
 * @returns {Promise<string>} Response body.
 */
async function fetchTextWithFallback(url) {
  try {
    const direct = await fetch(url, { credentials: "omit" });
    if (direct.ok) {
      return await direct.text();
    }
  } catch {
    // Continue to the proxy fallback.
  }

  let lastStatus = "unknown";
  for (const buildProxyUrl of CORS_PROXIES) {
    try {
      const proxied = await fetch(buildProxyUrl(url), { credentials: "omit" });
      lastStatus = proxied.status;
      if (proxied.ok) {
        return await proxied.text();
      }
    } catch {
      // Try the next public read-only proxy.
    }
  }

  throw new Error(`Subtitle request failed (${lastStatus}).`);
}

/**
 * Parse YouTube's caption-track XML list.
 *
 * @param {string} xmlText - Caption list XML.
 * @returns {Array<object>} Available caption tracks.
 */
function parseTrackList(xmlText) {
  const documentXml = new DOMParser().parseFromString(xmlText, "text/xml");
  return [...documentXml.querySelectorAll("track")].map((track) => ({
    language: track.getAttribute("lang_code") || "",
    name: track.getAttribute("name") || "",
    kind: track.getAttribute("kind") || "manual",
    isTranslatable: track.getAttribute("cantran") !== "0"
  })).filter((track) => track.language);
}

/**
 * Return the URL for a specific timed-text track.
 *
 * @param {string} videoId - YouTube video ID.
 * @param {object} track - Caption metadata.
 * @returns {string} Timed-text URL.
 */
function buildCaptionUrl(videoId, track) {
  const params = new URLSearchParams({
    v: videoId,
    lang: track.language,
    fmt: "vtt"
  });

  if (track.kind === "asr") {
    params.set("kind", "asr");
  }

  return `https://www.youtube.com/api/timedtext?${params.toString()}`;
}

/**
 * Choose a caption track using a preferred language or a useful fallback.
 *
 * @param {Array<object>} tracks - Available tracks.
 * @param {string} preferredLanguage - Language code or auto.
 * @returns {object|null} Selected track.
 */
function chooseTrack(tracks, preferredLanguage = "auto") {
  if (!tracks.length) {
    return null;
  }

  if (preferredLanguage && preferredLanguage !== "auto") {
    const exact = tracks.find((track) => track.language.toLowerCase() === preferredLanguage.toLowerCase());
    if (exact) return exact;

    const partial = tracks.find((track) => track.language.toLowerCase().startsWith(`${preferredLanguage.toLowerCase()}-`));
    if (partial) return partial;
  }

  // Prefer manually authored captions over ASR when auto detection is used.
  return tracks.find((track) => track.kind !== "asr") || tracks[0];
}

/**
 * Fetch subtitles for a public YouTube video.
 *
 * @param {string} videoId - YouTube video ID.
 * @param {string} preferredLanguage - Desired language code or auto.
 * @param {Function} parseTranscript - Existing application transcript parser.
 * @returns {Promise<object>} Track and transcript information.
 */


/** Normalize common human language labels into ISO-like codes. */
function normalizeLanguageCode(value) {
  const raw = String(value || "").trim().toLowerCase();
  const aliases = {
    turkish: "tr", türkçe: "tr", turkce: "tr",
    urdu: "ur", اردو: "ur",
    english: "en", en: "en",
    arabic: "ar", العربية: "ar",
    persian: "fa", farsi: "fa", فارسی: "fa",
    german: "de", french: "fr", spanish: "es",
    italian: "it", russian: "ru"
  };
  return aliases[raw] || raw || "auto";
}

/**
 * Fetch a transcript through a public CORS-enabled transcript service.
 *
 * This is intentionally the first network strategy for GitHub Pages because
 * the official YouTube caption download API is owner/OAuth restricted and
 * browser calls to YouTube caption endpoints can be blocked by CORS.
 * The service returns timestamped Markdown/text for public videos.
 *
 * @param {string} videoId - YouTube video ID.
 * @param {string} preferredLanguage - Requested language or auto.
 * @param {Function} parseTranscript - Existing transcript parser.
 * @returns {Promise<object>} Normalized transcript result.
 */
async function fetchViaPublicTranscriptService(videoId, preferredLanguage, parseTranscript) {
  const base = `https://youtube-transcript.ai/transcript/${encodeURIComponent(videoId)}.txt`;
  const url = preferredLanguage && preferredLanguage !== "auto"
    ? `${base}?lang=${encodeURIComponent(preferredLanguage)}`
    : base;

  const response = await fetch(url, { credentials: "omit", cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Public transcript service returned HTTP ${response.status}.`);
  }

  const raw = await response.text();
  const entries = parseTimestampedTranscriptText(raw, parseTranscript);
  if (!entries.length) {
    throw new Error("The transcript service returned no readable subtitle lines.");
  }

  const languageMatch = raw.match(/^language:\s*([^\\n]+)/im);
  const detectedLanguage = normalizeLanguageCode(languageMatch?.[1]?.trim() || preferredLanguage || "auto");

  return {
    tracks: [{ language: detectedLanguage, name: languageName(detectedLanguage), kind: "service" }],
    selectedTrack: { language: detectedLanguage, name: languageName(detectedLanguage), kind: "service" },
    entries,
    raw,
    source: "youtube-transcript.ai"
  };
}

/**
 * Parse the timestamped Markdown/text returned by the public service.
 * Supports lines such as "[1:23] Hello world".
 *
 * @param {string} raw - Service response.
 * @param {Function} parseTranscript - Local parser used as a fallback.
 * @returns {Array<object>} Transcript entries.
 */
function parseTimestampedTranscriptText(raw, parseTranscript) {
  const entries = [];
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  for (const line of lines) {
    const match = line.match(/^\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+?)\s*$/);
    if (!match) continue;
    entries.push({
      start: timestampToSecondsLoose(match[1]),
      end: timestampToSecondsLoose(match[1]),
      text: match[2].replace(/[*_`]/g, "").trim()
    });
  }

  if (entries.length) return entries;
  return parseTranscript(raw);
}

/** Convert m:ss or h:mm:ss into seconds. */
function timestampToSecondsLoose(timestamp) {
  const parts = timestamp.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export async function fetchYouTubeTranscript(videoId, preferredLanguage, parseTranscript) {
  const errors = [];

  // Strategy 1: public CORS-enabled transcript service.
  try {
    return await fetchViaPublicTranscriptService(videoId, preferredLanguage, parseTranscript);
  } catch (error) {
    errors.push(`Primary transcript service: ${error.message}`);
  }

  // Strategy 2: direct YouTube timed-text endpoint plus public CORS proxies.
  const listUrl = `https://www.youtube.com/api/timedtext?type=list&v=${encodeURIComponent(videoId)}`;
  let tracks = [];

  try {
    const xml = await fetchTextWithFallback(listUrl);
    tracks = parseTrackList(xml);
  } catch (error) {
    errors.push(`YouTube track list: ${error.message}`);
  }

  let selected = chooseTrack(tracks, preferredLanguage);

  if (!selected) {
    const candidates = preferredLanguage && preferredLanguage !== "auto"
      ? [preferredLanguage]
      : ["tr", "ur", "en", "ar", "fa", "de", "fr", "es", "it", "ru"];

    for (const language of candidates) {
      for (const kind of ["", "asr"]) {
        const probe = { language, kind: kind || "manual" };
        try {
          const vtt = await fetchTextWithFallback(buildCaptionUrl(videoId, probe));
          const parsed = parseTranscript(vtt);
          if (parsed.length) {
            selected = probe;
            return {
              tracks: [probe],
              selectedTrack: probe,
              entries: parsed,
              raw: vtt,
              source: "youtube-timedtext"
            };
          }
        } catch (error) {
          errors.push(`${language}/${kind || "manual"}: ${error.message}`);
        }
      }
    }
  }

  if (selected) {
    try {
      const subtitleText = await fetchTextWithFallback(buildCaptionUrl(videoId, selected));
      const entries = parseTranscript(subtitleText);
      if (entries.length) {
        return {
          tracks,
          selectedTrack: selected,
          entries,
          raw: subtitleText,
          source: "youtube-timedtext"
        };
      }
    } catch (error) {
      errors.push(`Selected YouTube track: ${error.message}`);
    }
  }

  throw new Error(
    "No subtitle track could be retrieved automatically. " +
    "Try the external subtitle link below, paste a direct SRT/VTT URL, or use the optional local file. " +
    errors.slice(0, 2).join(" ")
  );
}

/**
 * Convert a language code into a friendly display name.
 *
 * @param {string} code - ISO-like language code.
 * @returns {string} Friendly language name.
 */
export function languageName(code) {
  const names = {
    tr: "Turkish",
    ur: "Urdu",
    en: "English",
    ar: "Arabic",
    fa: "Persian",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    ru: "Russian"
  };

  return names[code?.split("-")[0]] || code || "Unknown";
}
