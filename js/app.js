/*
  Charlie MJ YouTube Toolkit
  File: js/app.js
  Purpose:
    Main controller for the static GitHub Pages application.
  Features:
    - YouTube URL parsing and embedded player.
    - Noteey-style URL-first subtitle retrieval.
    - Optional local subtitle fallback.
    - Timestamped transcript search and copy/download.
    - Word-by-word translation for language learning.
    - Vocabulary, notes, exports, and local session library.
*/

import { extractVideoId, buildVideoUrl } from "./youtube.js";
import { createPlayer, callPlayer } from "./player.js";
import { renderThumbnails } from "./thumbnails.js";
import {
  parseTranscript,
  cleanTranscript,
  transcriptToText,
  transcriptToMarkdown,
  formatTimestamp
} from "./transcript.js";
import { extractVocabulary, renderVocabulary } from "./vocabulary.js";
import { loadSessions, saveSession, clearSessions, saveTheme, loadTheme } from "./storage.js";
import { downloadTextFile, vocabularyToCsv } from "./export.js";
import { fetchYouTubeTranscript, languageName } from "./youtube-transcript.js";
import { translateWords, translateText, languageCode } from "./translation.js";

/* ---------- Application state ---------- */
const state = {
  videoId: null,
  videoUrl: null,
  player: null,
  transcript: [],
  vocabulary: [],
  notes: "",
  subtitleLanguage: "",
  subtitleRaw: "",
  translations: []
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
  subtitleStatusChip: document.querySelector("#subtitleStatusChip"),
  openYouTubeLink: document.querySelector("#openYouTubeLink"),
  thumbnailGrid: document.querySelector("#thumbnailGrid"),
  thumbnailStatus: document.querySelector("#thumbnailStatus"),
  subtitleLanguage: document.querySelector("#subtitleLanguage"),
  targetLanguage: document.querySelector("#targetLanguage"),
  showTimestamps: document.querySelector("#showTimestamps"),
  wordByWordToggle: document.querySelector("#wordByWordToggle"),
  getYouTubeSubtitlesButton: document.querySelector("#getYouTubeSubtitlesButton"),
  getSubtitlesButton: document.querySelector("#getSubtitlesButton"),
  copyTranscriptButton: document.querySelector("#copyTranscriptButton"),
  downloadTranscriptButton: document.querySelector("#downloadTranscriptButton"),
  shareSubtitleButton: document.querySelector("#shareSubtitleButton"),
  subtitleSourceInfo: document.querySelector("#subtitleSourceInfo"),
  subtitleUrlInput: document.querySelector("#subtitleUrlInput"),
  fetchSubtitleUrlButton: document.querySelector("#fetchSubtitleUrlButton"),
  externalTranscriptLink: document.querySelector("#externalTranscriptLink"),
  noteeyFallbackLink: document.querySelector("#noteeyFallbackLink"),
  subtitleFile: document.querySelector("#subtitleFile"),
  transcriptInput: document.querySelector("#transcriptInput"),
  cleanTranscriptButton: document.querySelector("#cleanTranscriptButton"),
  clearTranscriptButton: document.querySelector("#clearTranscriptButton"),
  transcriptSearch: document.querySelector("#transcriptSearch"),
  transcriptOutput: document.querySelector("#transcriptOutput"),
  translateTranscriptButton: document.querySelector("#translateTranscriptButton"),
  translationProgress: document.querySelector("#translationProgress"),
  translationOutput: document.querySelector("#translationOutput"),
  sourceLanguage: document.querySelector("#sourceLanguage"),
  vocabularyTargetLanguage: document.querySelector("#vocabularyTargetLanguage"),
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
  restartButton: document.querySelector("#restartButton")
};

/** Update the global status line. */
function setStatus(message, type = "normal") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status ${type}`;
}

/** Escape text before inserting it into HTML. */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Render the current searchable transcript. */
function renderTranscript() {
  const query = elements.transcriptSearch.value.trim().toLocaleLowerCase();
  const showTimes = elements.showTimestamps.checked;
  const filtered = state.transcript.filter((entry) => !query || entry.text.toLocaleLowerCase().includes(query));

  elements.transcriptOutput.innerHTML = "";
  if (!filtered.length) {
    elements.transcriptOutput.innerHTML = '<p class="empty-state">No matching transcript entries.</p>';
    return;
  }

  filtered.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "transcript-line";

    if (showTimes) {
      const time = document.createElement("button");
      time.type = "button";
      time.className = "transcript-time";
      time.textContent = formatTimestamp(entry.start);
      time.title = "Seek the YouTube player to this timestamp";
      time.addEventListener("click", () => {
        if (state.player && typeof state.player.seekTo === "function") {
          state.player.seekTo(entry.start, true);
          callPlayer(state.player, "playVideo");
        }
      });
      row.append(time);
    }

    const text = document.createElement("span");
    text.className = "transcript-text";
    text.textContent = entry.text;
    row.append(text);
    elements.transcriptOutput.append(row);
  });
}

/** Render word-by-word translation cards from state.translations. */
function renderTranslationOutput() {
  elements.translationOutput.innerHTML = "";

  if (!state.translations.length) {
    elements.translationOutput.innerHTML = '<p class="empty-state">No word translations yet.</p>';
    return;
  }

  state.translations.forEach((item) => {
    const row = document.createElement("article");
    row.className = "translation-row";

    const meta = document.createElement("div");
    meta.className = "translation-meta";
    meta.innerHTML = `<span>${escapeHtml(item.languageLabel)}</span><span>${escapeHtml(formatTimestamp(item.start))}</span>`;

    const source = document.createElement("div");
    source.className = "translation-source";
    source.innerHTML = item.words.map((word) => {
      if (!word.isWord) return escapeHtml(word.token);
      return `<span class="study-word">${escapeHtml(word.token)}<small>${escapeHtml(word.translation)}</small></span>`;
    }).join("");

    const sentence = document.createElement("div");
    sentence.className = "translation-sentence";
    sentence.textContent = item.sentenceTranslation ? `Sentence meaning: ${item.sentenceTranslation}` : "";

    row.append(meta, source, sentence);
    elements.translationOutput.append(row);
  });
}

/** Analyze a pasted YouTube URL and prepare video-driven UI. */
async function analyzeVideo(value, autoFetch = false) {
  const videoId = extractVideoId(value);
  if (!videoId) {
    setStatus("Please enter a valid YouTube watch, youtu.be, Shorts, or embed URL.", "error");
    return false;
  }

  state.videoId = videoId;
  state.videoUrl = buildVideoUrl(videoId);
  state.translations = [];

  elements.videoTitle.textContent = `YouTube video ${videoId}`;
  elements.videoId.textContent = `Video ID: ${videoId}`;
  elements.videoTypeChip.textContent = "Analyzed";
  elements.subtitleStatusChip.textContent = "Subtitles not loaded";
  elements.videoThumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  elements.openYouTubeLink.href = state.videoUrl;
  updateExternalSubtitleLinks();
  elements.youtubeUrl.value = state.videoUrl;
  renderThumbnails(elements.thumbnailGrid, videoId);
  elements.thumbnailStatus.textContent = "Available public thumbnail variants";

  if (window.YT && window.YT.Player) {
    mountPlayer(videoId);
  } else {
    window.pendingVideoId = videoId;
  }

  if (autoFetch) {
    await getYouTubeSubtitles();
  } else {
    setStatus("Video analyzed. Click Get YouTube Subtitles to fetch the available caption track.", "success");
  }
  return true;
}

/** Mount or remount the official YouTube embedded player. */
function mountPlayer(videoId) {
  const playerContainer = document.querySelector("#player");
  playerContainer.innerHTML = '<div id="youtube-player"></div>';
  playerContainer.id = "player";
  state.player = createPlayer(videoId, {
    onReady: () => setStatus("YouTube player ready.", "success"),
    onError: () => setStatus("The embedded YouTube player reported an error.", "error")
  });
}

/** Update external fallback links for the current YouTube video. */
function updateExternalSubtitleLinks() {
  if (!state.videoId) return;
  elements.externalTranscriptLink.href = `https://youtube-transcript.ai/transcript/${encodeURIComponent(state.videoId)}.txt`;
  elements.noteeyFallbackLink.href = `https://www.noteey.com/youtube-subtitle-downloader`;
}

/** Fetch and parse a public SRT/VTT/TXT URL supplied by the user. */
async function fetchDirectSubtitleUrl() {
  const url = elements.subtitleUrlInput.value.trim();
  if (!url) {
    setStatus("Paste a direct SRT, VTT, or TXT subtitle URL first.", "error");
    return;
  }

  elements.fetchSubtitleUrlButton.disabled = true;
  setStatus("Fetching the subtitle URL...", "normal");
  try {
    const response = await fetch(url, { credentials: "omit", cache: "no-store" });
    if (!response.ok) throw new Error(`Subtitle URL returned HTTP ${response.status}.`);
    const raw = await response.text();
    const parsed = cleanTranscript(parseTranscript(raw));
    if (!parsed.length) throw new Error("The URL returned no readable SRT/VTT/TXT subtitle entries.");

    state.transcript = parsed;
    state.subtitleRaw = raw;
    state.subtitleLanguage = elements.subtitleLanguage.value === "auto" ? "" : elements.subtitleLanguage.value;
    elements.subtitleStatusChip.textContent = "Subtitle URL loaded";
    elements.subtitleSourceInfo.textContent = `Source: direct subtitle URL • ${parsed.length} entries`;
    renderTranscript();
    renderTranslationOutput();
    setStatus(`Loaded ${parsed.length} subtitle entries from the direct URL.`, "success");
  } catch (error) {
    setStatus(`Direct subtitle URL failed: ${error.message}. The server may block browser CORS requests.`, "error");
  } finally {
    elements.fetchSubtitleUrlButton.disabled = false;
  }
}

/** Fetch the video's public subtitle track using the Noteey-style workflow. */
async function getYouTubeSubtitles() {
  if (!state.videoId) {
    const analyzed = await analyzeVideo(elements.youtubeUrl.value, false);
    if (!analyzed) return;
  }

  const requestedLanguage = elements.subtitleLanguage.value;
  elements.getSubtitlesButton.disabled = true;
  elements.getYouTubeSubtitlesButton.disabled = true;
  elements.subtitleSourceInfo.textContent = "Fetching the available YouTube subtitle track...";
  setStatus("Fetching YouTube subtitles...", "normal");

  try {
    const result = await fetchYouTubeTranscript(state.videoId, requestedLanguage, parseTranscript);
    state.transcript = cleanTranscript(result.entries);
    state.subtitleRaw = result.raw;
    state.subtitleLanguage = result.selectedTrack.language;
    elements.subtitleStatusChip.textContent = `${languageName(result.selectedTrack.language)} loaded`;
    elements.subtitleSourceInfo.textContent = `Source: ${result.source || "YouTube"} • ${languageName(result.selectedTrack.language)} • ${state.transcript.length} subtitle entries`;
    elements.subtitleLanguage.value = result.selectedTrack.language.startsWith("tr") ? "tr" : result.selectedTrack.language.startsWith("ur") ? "ur" : result.selectedTrack.language.startsWith("en") ? "en" : "auto";
    renderTranscript();
    renderTranslationOutput();
    setStatus(`Subtitles loaded successfully: ${state.transcript.length} entries in ${languageName(result.selectedTrack.language)}.`, "success");
  } catch (error) {
    elements.subtitleSourceInfo.textContent = "Automatic subtitle retrieval failed. Use one of the external transcript links or a direct subtitle URL below.";
    setStatus(`${error.message}`, "error");
  } finally {
    elements.getSubtitlesButton.disabled = false;
    elements.getYouTubeSubtitlesButton.disabled = false;
  }
}

/** Load an optional local subtitle file. */
async function loadSubtitleFile(file) {
  if (!file) return;
  try {
    elements.transcriptInput.value = await file.text();
    processManualTranscript();
  } catch {
    setStatus("The subtitle file could not be read.", "error");
  }
}

/** Parse and use manually pasted/local subtitle content. */
function processManualTranscript() {
  const parsed = parseTranscript(elements.transcriptInput.value);
  state.transcript = cleanTranscript(parsed);
  state.subtitleRaw = elements.transcriptInput.value;
  state.subtitleLanguage = languageCode(elements.sourceLanguage.value || "en");
  renderTranscript();
  renderTranslationOutput();

  if (!state.transcript.length) {
    setStatus("No transcript text was detected.", "error");
    return;
  }

  elements.subtitleStatusChip.textContent = "Manual subtitles loaded";
  elements.subtitleSourceInfo.textContent = `Source: local/pasted subtitle • ${state.transcript.length} entries`;
  setStatus(`${state.transcript.length} subtitle entries loaded from the optional fallback.`, "success");
}

/** Translate every subtitle line word-by-word with a small sequential queue. */
async function translateTranscriptWords() {
  if (!state.transcript.length) {
    setStatus("Load YouTube subtitles first.", "error");
    return;
  }

  const source = state.subtitleLanguage || languageCode(elements.sourceLanguage.value || "tr");
  const target = elements.targetLanguage.value;
  const maxLines = Math.min(state.transcript.length, 80);
  state.translations = [];
  elements.translationProgress.textContent = `Preparing ${maxLines} subtitle lines...`;

  for (let index = 0; index < maxLines; index += 1) {
    const entry = state.transcript[index];
    elements.translationProgress.textContent = `Translating line ${index + 1} of ${maxLines}...`;
    const words = await translateWords(entry.text, source, target);

    let sentenceTranslation = "";
    try {
      sentenceTranslation = await translateText(entry.text, source, target);
    } catch {
      sentenceTranslation = "";
    }

    state.translations.push({
      start: entry.start,
      languageLabel: `${languageName(source)} → ${languageName(target)}`,
      words,
      sentenceTranslation
    });

    if (index % 3 === 0) renderTranslationOutput();
  }

  renderTranslationOutput();
  elements.translationProgress.textContent = maxLines < state.transcript.length
    ? `Translated the first ${maxLines} lines to keep browser/API usage reasonable.`
    : `Translated ${maxLines} lines.`;
  setStatus("Word-by-word translation is ready. Check context before treating a single-word meaning as final.", "success");
}

/** Save the complete current workspace to localStorage. */
function saveCurrentSession() {
  if (!state.videoId) {
    setStatus("Analyze a YouTube URL before saving a session.", "error");
    return;
  }

  saveSession({
    videoId: state.videoId,
    videoUrl: state.videoUrl,
    title: elements.videoTitle.textContent,
    thumbnail: elements.videoThumbnail.src,
    transcript: state.transcript,
    vocabulary: state.vocabulary,
    notes: elements.notesInput.value,
    sourceLanguage: elements.sourceLanguage.value,
    targetLanguage: elements.targetLanguage.value,
    subtitleLanguage: state.subtitleLanguage,
    savedAt: new Date().toISOString()
  });

  renderLibrary();
  setStatus("Learning session saved locally in this browser.", "success");
}

/** Render saved sessions. */
function renderLibrary() {
  const sessions = loadSessions();
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
    open.className = "secondary-button button-link";
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

/** Restore a saved learning session. */
async function restoreSession(session) {
  elements.youtubeUrl.value = session.videoUrl;
  await analyzeVideo(session.videoUrl, false);
  state.transcript = session.transcript || [];
  state.vocabulary = session.vocabulary || [];
  state.subtitleLanguage = session.subtitleLanguage || "";
  elements.notesInput.value = session.notes || "";
  elements.sourceLanguage.value = session.sourceLanguage || "Turkish";
  elements.vocabularyTargetLanguage.value = session.targetLanguage || "English";
  renderTranscript();
  renderVocabulary(elements.vocabularyOutput, state.vocabulary);
  setStatus("Saved learning session restored.", "success");
}

/** Export the current workspace. */
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
      `Subtitle language: ${state.subtitleLanguage || "Unknown"}`,
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
    downloadTextFile(`${baseName}-learning.json`, JSON.stringify({
      video: { id: state.videoId, url: state.videoUrl, title: elements.videoTitle.textContent },
      subtitleLanguage: state.subtitleLanguage,
      transcript: state.transcript,
      vocabulary: state.vocabulary,
      notes: elements.notesInput.value,
      translations: state.translations,
      exportedAt: new Date().toISOString()
    }, null, 2), "application/json;charset=utf-8");
    return;
  }

  if (format === "csv") {
    downloadTextFile(`${baseName}-vocabulary.csv`, vocabularyToCsv(state.vocabulary), "text/csv;charset=utf-8");
  }
}

/* ---------- Event listeners ---------- */
elements.videoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await analyzeVideo(elements.youtubeUrl.value, false);
});

elements.getYouTubeSubtitlesButton.addEventListener("click", async () => {
  await analyzeVideo(elements.youtubeUrl.value, true);
});
elements.getSubtitlesButton.addEventListener("click", getYouTubeSubtitles);
elements.fetchSubtitleUrlButton.addEventListener("click", fetchDirectSubtitleUrl);
elements.subtitleFile.addEventListener("change", (event) => loadSubtitleFile(event.target.files[0]));
elements.cleanTranscriptButton.addEventListener("click", processManualTranscript);
elements.clearTranscriptButton.addEventListener("click", () => {
  state.transcript = [];
  state.translations = [];
  elements.transcriptInput.value = "";
  elements.translationOutput.innerHTML = '<p class="empty-state">No word translations yet.</p>';
  renderTranscript();
  setStatus("Transcript cleared.", "normal");
});
elements.transcriptSearch.addEventListener("input", renderTranscript);
elements.showTimestamps.addEventListener("change", renderTranscript);
elements.translateTranscriptButton.addEventListener("click", translateTranscriptWords);
elements.wordByWordToggle.addEventListener("change", () => {
  if (elements.wordByWordToggle.checked) {
    elements.translationOutput.innerHTML = '<p class="empty-state">Click Translate Words to generate word-by-word meanings.</p>';
  } else {
    elements.translationOutput.innerHTML = '<p class="empty-state">Word-by-word translation is turned off.</p>';
  }
});

elements.extractVocabularyButton.addEventListener("click", () => {
  state.vocabulary = extractVocabulary(transcriptToText(state.transcript));
  renderVocabulary(elements.vocabularyOutput, state.vocabulary);
  setStatus(`${state.vocabulary.length} vocabulary candidates extracted.`, state.vocabulary.length ? "success" : "error");
});
elements.saveNotesButton.addEventListener("click", () => {
  state.notes = elements.notesInput.value;
  setStatus("Notes are ready. Save the session to persist them locally.", "success");
});
elements.saveSessionButton.addEventListener("click", saveCurrentSession);
elements.clearLibraryButton.addEventListener("click", () => {
  if (window.confirm("Delete all locally saved learning sessions?")) {
    clearSessions();
    renderLibrary();
    setStatus("Local library cleared.", "success");
  }
});

elements.playButton.addEventListener("click", () => callPlayer(state.player, "playVideo"));
elements.pauseButton.addEventListener("click", () => callPlayer(state.player, "pauseVideo"));
elements.restartButton.addEventListener("click", () => {
  if (state.player && typeof state.player.seekTo === "function") {
    state.player.seekTo(0, true);
    callPlayer(state.player, "playVideo");
  }
});

/**
 * Copy text reliably. Clipboard API is preferred on HTTPS GitHub Pages, with
 * a temporary textarea fallback for browsers that deny clipboard permission.
 */
async function copyTextToClipboard(value) {
  if (!value) throw new Error("Nothing to copy.");

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard permission was denied.");
}

elements.copyTranscriptButton.addEventListener("click", async () => {
  const value = transcriptToText(state.transcript);
  if (!value) return setStatus("There is no transcript to copy yet.", "error");

  try {
    await copyTextToClipboard(value);
    setStatus("Subtitle text copied to the clipboard.", "success");
    elements.copyTranscriptButton.textContent = "Copied ✓";
    window.setTimeout(() => { elements.copyTranscriptButton.textContent = "Copy"; }, 1600);
  } catch (error) {
    setStatus(`Copy failed: ${error.message}`, "error");
  }
});

elements.downloadTranscriptButton.addEventListener("click", () => {
  const value = transcriptToText(state.transcript);
  if (!value) return setStatus("Load subtitles before downloading.", "error");

  const safeId = (state.videoId || "youtube-subtitles").replace(/[^a-z0-9_-]/gi, "-");
  downloadTextFile(`${safeId}-subtitles.txt`, value, "text/plain;charset=utf-8");
  setStatus("Subtitle text downloaded successfully.", "success");
});

/* Share the actual workspace URL when Web Share is available; otherwise copy it. */
elements.shareSubtitleButton.addEventListener("click", async () => {
  if (!state.videoId) return setStatus("Analyze a YouTube video before sharing subtitles.", "error");

  const shareUrl = new URL(window.location.href);
  shareUrl.search = "";
  shareUrl.searchParams.set("v", state.videoId);
  shareUrl.searchParams.set("lang", state.subtitleLanguage || "auto");

  const shareData = {
    title: "Charlie MJ YouTube Toolkit",
    text: `YouTube subtitle workspace for ${state.videoId}`,
    url: shareUrl.toString()
  };

  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ url: shareData.url }))) {
      await navigator.share(shareData);
      setStatus("Subtitle workspace shared successfully.", "success");
      return;
    }

    await copyTextToClipboard(shareData.url);
    setStatus("Share link copied to the clipboard.", "success");
  } catch (error) {
    if (error?.name === "AbortError") {
      setStatus("Share cancelled.", "info");
      return;
    }

    try {
      await copyTextToClipboard(shareData.url);
      setStatus("Share dialog unavailable, so the link was copied instead.", "success");
    } catch {
      window.prompt("Copy this subtitle workspace link:", shareData.url);
    }
  }
});

document.querySelectorAll("[data-export]").forEach((button) => {
  button.addEventListener("click", () => exportWorkspace(button.dataset.export));
});

/* ---------- Theme handling ---------- */
if (loadTheme() === "dark") document.body.classList.add("dark");
elements.themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  saveTheme(isDark ? "dark" : "light");
});

/* ---------- YouTube IFrame API callback ---------- */
window.onYouTubeIframeAPIReady = () => {
  if (window.pendingVideoId) {
    mountPlayer(window.pendingVideoId);
    window.pendingVideoId = null;
  }
};

/* ---------- Initial render ---------- */
renderLibrary();

// Restore a shared video/language URL when the app is opened from a copied link.
const sharedParams = new URLSearchParams(window.location.search);
const sharedVideo = sharedParams.get("v");
const sharedLanguage = sharedParams.get("lang");
if (sharedVideo && /^[A-Za-z0-9_-]{11}$/.test(sharedVideo)) {
  elements.youtubeUrl.value = buildVideoUrl(sharedVideo);
  if (sharedLanguage) elements.subtitleLanguage.value = sharedLanguage;
  analyzeVideo(elements.youtubeUrl.value, false);
}
