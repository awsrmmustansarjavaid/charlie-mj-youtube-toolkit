/*
  Charlie MJ YouTube Toolkit
  File: js/app.js
  Purpose:
    Main application controller. Connects the HTML UI to feature modules.
  Design:
    This is intentionally framework-free so the project can be hosted as
    ordinary static files on GitHub Pages without a build system or GitHub Actions.
*/

import {
  extractVideoId,
  buildVideoUrl
} from "./youtube.js";

import {
  createPlayer,
  callPlayer
} from "./player.js";

import {
  renderThumbnails
} from "./thumbnails.js";

import {
  parseTranscript,
  cleanTranscript,
  transcriptToText,
  transcriptToMarkdown,
  formatTimestamp
} from "./transcript.js";

import {
  extractVocabulary,
  renderVocabulary
} from "./vocabulary.js";

import {
  loadSessions,
  saveSession,
  clearSessions,
  saveTheme,
  loadTheme
} from "./storage.js";

import {
  downloadTextFile,
  vocabularyToCsv
} from "./export.js";

/* ---------- Application state ---------- */
const state = {
  videoId: null,
  videoUrl: null,
  player: null,
  transcript: [],
  vocabulary: [],
  notes: ""
};

/* ---------- DOM references ---------- */
const elements = {
  videoForm: document.querySelector("#videoForm"),
  youtubeUrl: document.querySelector("#youtubeUrl"),
  statusMessage: document.querySelector("#statusMessage"),
  videoThumbnail: document.querySelector("#videoThumbnail"),
  videoTitle: document.querySelector("#videoTitle"),
  videoId: document.querySelector("#videoId"),
  videoTypeChip: document.querySelector("#videoTypeChip"),
  openYouTubeLink: document.querySelector("#openYouTubeLink"),
  thumbnailGrid: document.querySelector("#thumbnailGrid"),
  thumbnailStatus: document.querySelector("#thumbnailStatus"),
  transcriptInput: document.querySelector("#transcriptInput"),
  subtitleFile: document.querySelector("#subtitleFile"),
  cleanTranscriptButton: document.querySelector("#cleanTranscriptButton"),
  clearTranscriptButton: document.querySelector("#clearTranscriptButton"),
  transcriptSearch: document.querySelector("#transcriptSearch"),
  transcriptOutput: document.querySelector("#transcriptOutput"),
  sourceLanguage: document.querySelector("#sourceLanguage"),
  targetLanguage: document.querySelector("#targetLanguage"),
  extractVocabularyButton: document.querySelector("#extractVocabularyButton"),
  vocabularyOutput: document.querySelector("#vocabularyOutput"),
  notesInput: document.querySelector("#notesInput"),
  saveNotesButton: document.querySelector("#saveNotesButton"),
  saveSessionButton: document.querySelector("#saveSessionButton"),
  libraryList: document.querySelector("#libraryList"),
  clearLibraryButton: document.querySelector("#clearLibraryButton"),
  themeToggle: document.querySelector("#themeToggle"),
  playButton: document.querySelector("#playButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  copyTranscriptButton: document.querySelector("#copyTranscriptButton"),
  copyVideoUrlButton: document.querySelector("#copyVideoUrlButton"),
  readingModeButton: document.querySelector("#readingModeButton"),
  heroSessionsCount: document.querySelector("#heroSessionsCount"),
  heroWordsCount: document.querySelector("#heroWordsCount"),
  heroLinesCount: document.querySelector("#heroLinesCount")
};

/* ---------- Utility functions ---------- */

/**
 * Update the visible application status.
 *
 * @param {string} message - Status message.
 * @param {"normal"|"success"|"error"} type - Status style.
 */
function setStatus(message, type = "normal") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status ${type}`;
}

/**
 * Escape text before inserting it into HTML.
 *
 * @param {string} value - Untrusted text.
 * @returns {string} Escaped HTML.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Render the current transcript and apply the current search query.
 */
function renderTranscript() {
  const query = elements.transcriptSearch.value.trim().toLocaleLowerCase();

  const filtered = state.transcript.filter((entry) => {
    return !query || entry.text.toLocaleLowerCase().includes(query);
  });

  elements.transcriptOutput.innerHTML = "";
  if (elements.heroLinesCount) {
    elements.heroLinesCount.textContent = String(state.transcript.length);
  }

  if (!filtered.length) {
    elements.transcriptOutput.innerHTML = '<p class="empty-state">No matching transcript entries.</p>';
    return;
  }

  filtered.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "transcript-line";

    const time = document.createElement("button");
    time.type = "button";
    time.className = "transcript-time";
    time.textContent = formatTimestamp(entry.start);
    time.title = "Seek the YouTube player to this timestamp";

    // Timed entries can seek the embedded YouTube player.
    time.addEventListener("click", () => {
      if (state.player && entry.start > 0 && typeof state.player.seekTo === "function") {
        state.player.seekTo(entry.start, true);
        callPlayer(state.player, "playVideo");
      }
    });

    const text = document.createElement("span");
    text.className = "transcript-text";
    text.textContent = entry.text;

    row.append(time, text);
    elements.transcriptOutput.append(row);
  });
}

/**
 * Save the current workspace as a local session.
 */
function saveCurrentSession() {
  if (!state.videoId) {
    setStatus("Analyze a YouTube URL before saving a session.", "error");
    return;
  }

  const session = {
    videoId: state.videoId,
    videoUrl: state.videoUrl,
    title: elements.videoTitle.textContent,
    thumbnail: elements.videoThumbnail.src,
    transcript: state.transcript,
    vocabulary: state.vocabulary,
    notes: elements.notesInput.value,
    sourceLanguage: elements.sourceLanguage.value,
    targetLanguage: elements.targetLanguage.value,
    savedAt: new Date().toISOString()
  };

  saveSession(session);
  renderLibrary();
  setStatus("Learning session saved locally in this browser.", "success");
}

/**
 * Render saved sessions.
 */
function renderLibrary() {
  const sessions = loadSessions();
  if (elements.heroSessionsCount) {
    elements.heroSessionsCount.textContent = String(sessions.length);
  }
  elements.libraryList.innerHTML = "";

  if (!sessions.length) {
    elements.libraryList.innerHTML = '<p class="empty-state">No saved sessions yet.</p>';
    return;
  }

  sessions.forEach((session) => {
    const row = document.createElement("div");
    row.className = "library-item";

    const information = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = session.title || session.videoId;

    const saved = document.createElement("small");
    saved.textContent = `Saved ${new Date(session.savedAt).toLocaleString()}`;

    information.append(title, saved);

    const actions = document.createElement("div");
    actions.className = "button-row";

    const open = document.createElement("a");
    open.className = "secondary-button";
    open.href = session.videoUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "Open";

    const restore = document.createElement("button");
    restore.className = "primary-button";
    restore.type = "button";
    restore.textContent = "Restore";
    restore.addEventListener("click", () => restoreSession(session));

    actions.append(open, restore);
    row.append(information, actions);
    elements.libraryList.append(row);
  });
}

/**
 * Restore a previously saved session into the workspace.
 *
 * @param {object} session - Saved session.
 */
function restoreSession(session) {
  elements.youtubeUrl.value = session.videoUrl;
  analyzeVideo(session.videoUrl);

  state.transcript = session.transcript || [];
  state.vocabulary = session.vocabulary || [];
  elements.notesInput.value = session.notes || "";
  elements.sourceLanguage.value = session.sourceLanguage || "";
  elements.targetLanguage.value = session.targetLanguage || "";

  renderTranscript();
  renderVocabulary(elements.vocabularyOutput, state.vocabulary);
  setStatus("Saved learning session restored.", "success");
}

/**
 * Analyze a YouTube URL and update all URL-driven features.
 *
 * @param {string} value - YouTube URL.
 */
function analyzeVideo(value) {
  const videoId = extractVideoId(value);

  if (!videoId) {
    setStatus("Please enter a valid YouTube watch, youtu.be, Shorts, or embed URL.", "error");
    return;
  }

  state.videoId = videoId;
  state.videoUrl = buildVideoUrl(videoId);

  elements.videoTitle.textContent = `YouTube video ${videoId}`;
  elements.videoId.textContent = `Video ID: ${videoId}`;
  elements.videoTypeChip.textContent = "Analyzed";
  elements.videoThumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  elements.openYouTubeLink.href = state.videoUrl;

  renderThumbnails(elements.thumbnailGrid, videoId);
  elements.thumbnailStatus.textContent = "Available public thumbnail variants";
  elements.youtubeUrl.value = state.videoUrl;

  // The API may not be ready when the user clicks Analyze immediately.
  if (window.YT && window.YT.Player) {
    mountPlayer(videoId);
  } else {
    window.pendingVideoId = videoId;
    setStatus("Video analyzed. Waiting for the YouTube player API to finish loading.", "normal");
  }

  setStatus("Video analyzed. Thumbnail and player tools are ready.", "success");
}

/**
 * Mount or remount the YouTube player.
 *
 * @param {string} videoId - YouTube video ID.
 */
function mountPlayer(videoId) {
  const playerContainer = document.querySelector("#player");

  // Replacing the container avoids conflicts when changing videos.
  playerContainer.innerHTML = '<div id="youtube-player"></div>';
  playerContainer.id = "player";

  state.player = createPlayer(videoId, {
    onReady: () => setStatus("YouTube player ready.", "success"),
    onError: () => setStatus("The embedded YouTube player reported an error.", "error")
  });
}

/**
 * Prepare the transcript from the textarea.
 */
function processTranscript() {
  const parsed = parseTranscript(elements.transcriptInput.value);
  state.transcript = cleanTranscript(parsed);

  renderTranscript();

  if (!state.transcript.length) {
    setStatus("No transcript text was detected.", "error");
    return;
  }

  setStatus(`${state.transcript.length} transcript entries organized.`, "success");
}

/**
 * Load a local subtitle file into the transcript textarea.
 *
 * @param {File} file - Local subtitle file.
 */
async function loadSubtitleFile(file) {
  if (!file) {
    return;
  }

  try {
    elements.transcriptInput.value = await file.text();
    processTranscript();
  } catch {
    setStatus("The subtitle file could not be read.", "error");
  }
}

/**
 * Export the current workspace in the requested format.
 *
 * @param {"txt"|"md"|"json"|"csv"} format - Export format.
 */
function exportWorkspace(format) {
  const baseName = state.videoId || "youtube-learning-session";

  if (format === "txt") {
    downloadTextFile(`${baseName}-transcript.txt`, transcriptToText(state.transcript));
    return;
  }

  if (format === "md") {
    const markdown = [
      `# ${elements.videoTitle.textContent}`,
      "",
      "## Transcript",
      "",
      transcriptToMarkdown(state.transcript),
      "",
      "## Notes",
      "",
      elements.notesInput.value || "No notes."
    ].join("\n");

    downloadTextFile(`${baseName}-learning.md`, markdown, "text/markdown;charset=utf-8");
    return;
  }

  if (format === "json") {
    const data = {
      video: {
        id: state.videoId,
        url: state.videoUrl,
        title: elements.videoTitle.textContent
      },
      transcript: state.transcript,
      vocabulary: state.vocabulary,
      notes: elements.notesInput.value,
      languages: {
        source: elements.sourceLanguage.value,
        target: elements.targetLanguage.value
      },
      exportedAt: new Date().toISOString()
    };

    downloadTextFile(
      `${baseName}-learning.json`,
      JSON.stringify(data, null, 2),
      "application/json;charset=utf-8"
    );
    return;
  }

  if (format === "csv") {
    downloadTextFile(
      `${baseName}-vocabulary.csv`,
      vocabularyToCsv(state.vocabulary),
      "text/csv;charset=utf-8"
    );
  }
}

/* ---------- Enhanced frontend helpers ---------- */

/**
 * Copy text using the browser Clipboard API and show a short status message.
 * Clipboard access is optional; the application continues to work without it.
 * @param {string} value - Text to copy.
 * @param {string} successMessage - Feedback displayed after copying.
 */
async function copyToClipboard(value, successMessage) {
  if (!value) {
    setStatus("There is nothing to copy yet.", "error");
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    setStatus(successMessage, "success");
  } catch {
    setStatus("Clipboard access was blocked by the browser. Use the export buttons instead.", "error");
  }
}

/**
 * Toggle the distraction-free transcript reading overlay.
 */
function toggleReadingMode() {
  const active = document.body.classList.toggle("reading-mode");
  elements.readingModeButton.textContent = active ? "✕ Close Reading Mode" : "☰ Reading Mode";
}

/**
 * Smoothly scroll to a local section selected by a quick-action button.
 * @param {string} selector - CSS selector for the destination.
 */
function scrollToSection(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Event listeners ---------- */

elements.videoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  analyzeVideo(elements.youtubeUrl.value);
});

elements.subtitleFile.addEventListener("change", (event) => {
  loadSubtitleFile(event.target.files[0]);
});

elements.cleanTranscriptButton.addEventListener("click", processTranscript);

elements.clearTranscriptButton.addEventListener("click", () => {
  elements.transcriptInput.value = "";
  state.transcript = [];
  renderTranscript();
  setStatus("Transcript cleared.", "normal");
});

elements.transcriptSearch.addEventListener("input", renderTranscript);

elements.extractVocabularyButton.addEventListener("click", () => {
  const text = transcriptToText(state.transcript);
  state.vocabulary = extractVocabulary(text);
  if (elements.heroWordsCount) {
    elements.heroWordsCount.textContent = String(state.vocabulary.length);
  }
  renderVocabulary(elements.vocabularyOutput, state.vocabulary);

  if (state.vocabulary.length) {
    setStatus(`${state.vocabulary.length} vocabulary candidates extracted.`, "success");
  }
});

elements.saveNotesButton.addEventListener("click", () => {
  state.notes = elements.notesInput.value;
  setStatus("Notes are currently stored in the workspace. Save the session to persist them locally.", "success");
});

elements.saveSessionButton.addEventListener("click", saveCurrentSession);

elements.clearLibraryButton.addEventListener("click", () => {
  if (window.confirm("Delete all locally saved learning sessions?")) {
    clearSessions();
    renderLibrary();
    setStatus("Local library cleared.", "success");
  }
});

document.querySelectorAll("[data-export]").forEach((button) => {
  button.addEventListener("click", () => exportWorkspace(button.dataset.export));
});

elements.playButton.addEventListener("click", () => callPlayer(state.player, "playVideo"));
elements.pauseButton.addEventListener("click", () => callPlayer(state.player, "pauseVideo"));
elements.restartButton.addEventListener("click", () => {
  if (state.player && typeof state.player.seekTo === "function") {
    state.player.seekTo(0, true);
    callPlayer(state.player, "playVideo");
  }
});

// Copy the currently analyzed YouTube URL for quick sharing.
elements.copyVideoUrlButton?.addEventListener("click", () => copyToClipboard(state.videoUrl || elements.youtubeUrl.value, "YouTube URL copied to the clipboard."));

// Copy the cleaned transcript as plain text.
elements.copyTranscriptButton?.addEventListener("click", () => copyToClipboard(transcriptToText(state.transcript), "Transcript copied to the clipboard."));

// Toggle a focused transcript reading view for language study.
elements.readingModeButton?.addEventListener("click", toggleReadingMode);

// Wire hero quick actions without introducing a frontend router.
document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => scrollToSection(button.dataset.scrollTarget));
});

/* ---------- Theme handling ---------- */
const storedTheme = loadTheme();

if (storedTheme === "dark") {
  document.body.classList.add("dark");
}

elements.themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  saveTheme(isDark ? "dark" : "light");
});

/* ---------- YouTube API callback ---------- */

/**
 * Global callback required by the YouTube IFrame API.
 * It is intentionally placed on window because YouTube calls it by name.
 */
window.onYouTubeIframeAPIReady = () => {
  if (window.pendingVideoId) {
    mountPlayer(window.pendingVideoId);
    window.pendingVideoId = null;
  }
};

/* ---------- Initial render ---------- */
renderLibrary();
