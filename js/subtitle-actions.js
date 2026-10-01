/*
  Charlie MJ YouTube Toolkit
  File: js/subtitle-actions.js
  Purpose:
    Provide an independent, dependency-free controller for the three primary
    subtitle actions: Copy, Download TXT, and Share Link.

  Why this file is separate:
    These actions must remain usable even if an optional feature such as the
    YouTube player, translation provider, or transcript provider encounters
    an error. The controller reads the currently rendered transcript directly
    from the page and therefore does not depend on app.js internal state.
*/
(function () {
  "use strict";

  /** Return an element by id. */
  function byId(id) {
    return document.getElementById(id);
  }

  /** Update the application's visible status message without requiring app.js. */
  function status(message, type) {
    var node = byId("statusMessage");
    if (!node) return;
    node.textContent = message;
    node.className = "status " + (type || "normal");
  }

  /**
   * Return the best transcript text currently visible to the user.
   * The rendered transcript is preferred because it represents the fetched
   * YouTube subtitles; the manual textarea is used as a fallback.
   */
  function getTranscriptText() {
    var output = byId("transcriptOutput");
    var input = byId("transcriptInput");
    var rendered = output ? output.innerText.trim() : "";
    var manual = input ? input.value.trim() : "";

    if (rendered && !/^No matching transcript entries\.$/i.test(rendered)) {
      return rendered;
    }
    return manual;
  }

  /** Copy text using Clipboard API first and a legacy selection fallback second. */
  async function copyText(text) {
    if (!text) throw new Error("There is no subtitle text to copy yet.");

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-10000px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      textarea.remove();
    }

    if (!copied) {
      throw new Error("The browser blocked clipboard access. Select the transcript and use Ctrl+C.");
    }
  }

  /** Build a stable filename from the current YouTube URL/video id. */
  function getFilename() {
    var url = byId("youtubeUrl");
    var raw = url ? url.value.trim() : "";
    var match = raw.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/i);
    var id = match ? match[1] : "youtube";
    return id.replace(/[^A-Za-z0-9_-]/g, "-") + "-subtitles.txt";
  }

  /** Download subtitle text as a local UTF-8 TXT file. */
  function downloadText(text) {
    if (!text) throw new Error("There is no subtitle text to download yet.");

    var blob = new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = getFilename();
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    window.setTimeout(function () {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1500);
  }

  /** Build a share URL that preserves the current YouTube video and language. */
  function getShareUrl() {
    var input = byId("youtubeUrl");
    var raw = input ? input.value.trim() : "";
    var url = new URL(window.location.href);
    url.search = "";
    url.hash = "";

    try {
      var source = new URL(raw);
      var videoId = source.searchParams.get("v");
      if (!videoId) {
        var parts = source.pathname.split("/").filter(Boolean);
        videoId = parts[parts.length - 1] || "";
      }
      if (videoId) url.searchParams.set("v", videoId);
    } catch (_) {
      /* Keep the current page URL when the input is not a complete URL. */
    }

    var language = byId("subtitleLanguage");
    if (language && language.value) url.searchParams.set("lang", language.value);
    return url.toString();
  }

  /** Share through the native Web Share API, then clipboard, then a prompt. */
  async function shareUrl(url) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Charlie MJ YouTube Toolkit",
          text: "YouTube subtitle workspace",
          url: url
        });
        return "shared";
      } catch (error) {
        if (error && error.name === "AbortError") return "cancelled";
      }
    }

    try {
      await copyText(url);
      return "copied";
    } catch (_) {
      window.prompt("Copy this Charlie MJ subtitle workspace link:", url);
      return "prompt";
    }
  }

  /** Restore a button label after a short success state. */
  function flash(button, label, original) {
    button.textContent = label;
    window.setTimeout(function () {
      button.textContent = original;
    }, 1600);
  }

  function install() {
    var copyButton = byId("copyTranscriptButton");
    var downloadButton = byId("downloadTranscriptButton");
    var shareButton = byId("shareSubtitleButton");
    if (!copyButton || !downloadButton || !shareButton) return;

    /*
      Capture-phase handlers deliberately stop the event before app.js can
      register a duplicate handler. This makes these three actions independent
      and deterministic.
    */
    copyButton.addEventListener("click", async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        await copyText(getTranscriptText());
        flash(copyButton, "Copied ✓", "Copy");
        status("Subtitle text copied to the clipboard.", "success");
      } catch (error) {
        status(error.message, "error");
      }
    }, true);

    downloadButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        downloadText(getTranscriptText());
        flash(downloadButton, "Downloaded ✓", "Download TXT");
        status("Subtitle TXT file downloaded.", "success");
      } catch (error) {
        status(error.message, "error");
      }
    }, true);

    shareButton.addEventListener("click", async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        var result = await shareUrl(getShareUrl());
        if (result === "shared") status("Subtitle workspace shared successfully.", "success");
        else if (result === "copied") status("Share link copied to the clipboard.", "success");
        else status("Share link opened for manual copying.", "success");
        flash(shareButton, result === "shared" ? "Shared ✓" : "Link Copied ✓", "Share Link");
      } catch (error) {
        status("Share failed: " + error.message, "error");
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
