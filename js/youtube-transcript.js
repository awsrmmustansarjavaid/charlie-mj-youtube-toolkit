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
export async function fetchYouTubeTranscript(videoId, preferredLanguage, parseTranscript) {
  const listUrl = `https://www.youtube.com/api/timedtext?type=list&v=${encodeURIComponent(videoId)}`;
  let tracks = [];

  try {
    const xml = await fetchTextWithFallback(listUrl);
    tracks = parseTrackList(xml);
  } catch {
    // Some videos/endpoints do not expose the track list. Try common languages below.
  }

  let selected = chooseTrack(tracks, preferredLanguage);

  // Fallback probing helps when YouTube does not return a track list.
  if (!selected) {
    const candidates = preferredLanguage && preferredLanguage !== "auto"
      ? [preferredLanguage]
      : ["tr", "ur", "en", "ar", "fa", "de", "fr", "es"];

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
              raw: vtt
            };
          }
        } catch {
          // Continue probing another language/kind.
        }
      }
    }
  }

  if (!selected) {
    throw new Error("No public subtitle track was found for this video. The video may have captions disabled or may expose them differently.");
  }

  const subtitleText = await fetchTextWithFallback(buildCaptionUrl(videoId, selected));
  const entries = parseTranscript(subtitleText);

  if (!entries.length) {
    throw new Error("A subtitle track was found, but it contained no readable subtitle entries.");
  }

  return {
    tracks,
    selectedTrack: selected,
    entries,
    raw: subtitleText
  };
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
