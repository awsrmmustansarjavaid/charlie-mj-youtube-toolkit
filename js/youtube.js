/*
  Charlie MJ YouTube Toolkit
  File: js/youtube.js
  Purpose:
    Parse supported YouTube URLs and construct safe client-side resources.
  Important:
    This module does not scrape YouTube pages or bypass YouTube restrictions.
    It only extracts the public video ID from common URL formats.
*/

/**
 * Extract a YouTube video ID from common YouTube URL formats.
 *
 * @param {string} value - User-provided YouTube URL.
 * @returns {string|null} Eleven-character video ID or null when unsupported.
 */
export function extractVideoId(value) {
  try {
    const url = new URL(value.trim());

    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      const id = url.searchParams.get("v");
      if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
        return id;
      }

      // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
      const shortsMatch = url.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})/);
      if (shortsMatch) {
        return shortsMatch[1];
      }

      // Embed URL: https://www.youtube.com/embed/VIDEO_ID
      const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/);
      if (embedMatch) {
        return embedMatch[1];
      }
    }

    // Short URL: https://youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "").slice(0, 11);
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    // Invalid URLs are handled by the caller through the null return value.
  }

  return null;
}

/**
 * Build the public YouTube video URL for an ID.
 *
 * @param {string} videoId - YouTube video ID.
 * @returns {string} Canonical watch URL.
 */
export function buildVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/**
 * Build a thumbnail URL using YouTube's public thumbnail naming convention.
 *
 * @param {string} videoId - YouTube video ID.
 * @param {string} variant - Thumbnail variant such as maxresdefault or hqdefault.
 * @returns {string} Thumbnail URL.
 */
export function buildThumbnailUrl(videoId, variant = "hqdefault") {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/${variant}.jpg`;
}

/**
 * Return the thumbnail definitions used by the UI.
 *
 * @returns {Array<object>} Thumbnail metadata.
 */
export function getThumbnailDefinitions() {
  return [
    { key: "maxresdefault", label: "Maximum", dimensions: "Usually 1920 × 1080" },
    { key: "sddefault", label: "SD", dimensions: "Usually 640 × 480" },
    { key: "hqdefault", label: "High Quality", dimensions: "Usually 480 × 360" },
    { key: "mqdefault", label: "Medium", dimensions: "Usually 320 × 180" },
    { key: "default", label: "Default", dimensions: "Usually 120 × 90" }
  ];
}
