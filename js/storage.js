/*
  Charlie MJ YouTube Toolkit
  File: js/storage.js
  Purpose:
    Store sessions and theme preferences in the browser.
  Storage:
    localStorage is used intentionally because this is a static GitHub Pages app.
  Note:
    Local storage is device/browser-specific and is not a cloud backup.
*/

const STORAGE_KEY = "youtube-learning-toolkit.sessions.v1";
const THEME_KEY = "youtube-learning-toolkit.theme.v1";

/**
 * Load all locally saved sessions.
 *
 * @returns {Array<object>} Saved sessions.
 */
export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Save or replace a session.
 *
 * @param {object} session - Session object.
 */
export function saveSession(session) {
  const sessions = loadSessions();

  const existingIndex = sessions.findIndex((item) => item.videoId === session.videoId);

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)));
}

/**
 * Delete every locally saved session.
 */
export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Store the selected theme.
 *
 * @param {"light"|"dark"} theme - Theme name.
 */
export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Load the selected theme.
 *
 * @returns {"light"|"dark"|null} Theme or null.
 */
export function loadTheme() {
  return localStorage.getItem(THEME_KEY);
}
