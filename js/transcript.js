/*
  Charlie MJ YouTube Toolkit
  File: js/transcript.js
  Purpose:
    Parse SRT/VTT/plain text locally and render a clean, searchable transcript.
  Privacy:
    Transcript text remains in the browser unless the user explicitly exports
    or saves it through the application's local library.
*/

/**
 * Convert a timestamp such as 00:01:02.500 into seconds.
 *
 * @param {string} timestamp - SRT/VTT timestamp.
 * @returns {number} Number of seconds.
 */
export function timestampToSeconds(timestamp) {
  const normalized = timestamp.trim().replace(",", ".");
  const parts = normalized.split(":").map(Number);

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return 0;
}

/**
 * Format seconds as a short human-readable timestamp.
 *
 * @param {number} seconds - Time in seconds.
 * @returns {string} HH:MM:SS.
 */
export function formatTimestamp(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

/**
 * Parse SRT, VTT, or plain text into transcript entries.
 *
 * @param {string} source - Subtitle/transcript text.
 * @returns {Array<{start:number,end:number,text:string}>} Transcript entries.
 */
export function parseTranscript(source) {
  const cleaned = source.replace(/\r\n/g, "\n").trim();

  if (!cleaned) {
    return [];
  }

  // VTT files can contain a WEBVTT header and metadata.
  const withoutHeader = cleaned.replace(/^WEBVTT[^\n]*\n+/i, "");

  // Split into subtitle blocks. This works for common SRT/VTT structures.
  const blocks = withoutHeader.split(/\n{2,}/);

  const entries = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes("-->"));

    if (timingIndex >= 0) {
      const timing = lines[timingIndex];
      const match = timing.match(
        /(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})/
      );

      if (!match) {
        continue;
      }

      const text = lines
        .slice(timingIndex + 1)
        .join(" ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        entries.push({
          start: timestampToSeconds(match[1]),
          end: timestampToSeconds(match[2]),
          text
        });
      }

      continue;
    }

    // A block without subtitle timing is treated as plain text.
    const plain = lines.join(" ").replace(/\s+/g, " ").trim();
    if (plain && !/^\d+$/.test(plain)) {
      entries.push({
        start: 0,
        end: 0,
        text: plain
      });
    }
  }

  // If parsing produced no timed entries, use paragraph-based plain text.
  if (!entries.length) {
    return cleaned
      .split(/\n{2,}|\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ start: 0, end: 0, text }));
  }

  return entries;
}

/**
 * Produce a cleaner reading transcript by joining subtitle fragments.
 *
 * @param {Array<object>} entries - Parsed transcript entries.
 * @returns {Array<object>} Cleaned entries.
 */
export function cleanTranscript(entries) {
  const output = [];

  for (const entry of entries) {
    const text = entry.text
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .trim();

    if (!text) {
      continue;
    }

    const previous = output[output.length - 1];

    // Remove exact duplicates often produced by overlapping captions.
    if (previous && previous.text.toLowerCase() === text.toLowerCase()) {
      continue;
    }

    output.push({ ...entry, text });
  }

  return output;
}

/**
 * Create a plain-text export from transcript entries.
 *
 * @param {Array<object>} entries - Transcript entries.
 * @returns {string} Plain transcript.
 */
export function transcriptToText(entries) {
  return entries.map((entry) => entry.text).join("\n\n");
}

/**
 * Create Markdown output from transcript entries.
 *
 * @param {Array<object>} entries - Transcript entries.
 * @returns {string} Markdown transcript.
 */
export function transcriptToMarkdown(entries) {
  return entries
    .map((entry) => `**${formatTimestamp(entry.start)}** — ${entry.text}`)
    .join("\n\n");
}
