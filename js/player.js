/*
  Charlie MJ YouTube Toolkit
  File: js/player.js
  Purpose:
    Wrap the official YouTube IFrame Player API with a small application-friendly API.
  Dependency:
    The YouTube IFrame API script is loaded in index.html.
*/

/**
 * Create the embedded YouTube player.
 *
 * @param {string} videoId - YouTube video ID.
 * @param {object} callbacks - Optional state callbacks.
 * @returns {YT.Player|null} YouTube player instance when API is ready.
 */
export function createPlayer(videoId, callbacks = {}) {
  // The official API exposes YT globally after its script has loaded.
  if (!window.YT || !window.YT.Player) {
    return null;
  }

  const player = new window.YT.Player("player", {
    videoId,
    playerVars: {
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: callbacks.onReady || (() => {}),
      onStateChange: callbacks.onStateChange || (() => {}),
      onError: callbacks.onError || (() => {})
    }
  });

  return player;
}

/**
 * Safely call a player command if the player is ready.
 *
 * @param {object|null} player - YouTube player instance.
 * @param {string} method - Method name such as playVideo.
 */
export function callPlayer(player, method) {
  if (!player || typeof player[method] !== "function") {
    return;
  }

  player[method]();
}
