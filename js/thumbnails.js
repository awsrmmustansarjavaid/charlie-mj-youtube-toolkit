/*
  Charlie MJ YouTube Toolkit
  File: js/thumbnails.js
  Purpose:
    Render and manage YouTube thumbnail previews/download links.
  Note:
    Image availability differs between videos. A missing high-resolution
    thumbnail is handled by hiding that card after the browser reports an error.
*/

import { buildThumbnailUrl, getThumbnailDefinitions } from "./youtube.js";

/**
 * Render thumbnail cards for a YouTube video.
 *
 * @param {HTMLElement} container - Target grid.
 * @param {string} videoId - YouTube video ID.
 */
export function renderThumbnails(container, videoId) {
  container.innerHTML = "";

  getThumbnailDefinitions().forEach((item) => {
    const url = buildThumbnailUrl(videoId, item.key);

    const card = document.createElement("article");
    card.className = "thumbnail-card";

    const image = document.createElement("img");
    image.src = url;
    image.alt = `${item.label} YouTube thumbnail`;
    image.loading = "lazy";

    // Some videos do not provide every resolution. Hide unavailable variants.
    image.addEventListener("error", () => {
      card.remove();
    });

    const content = document.createElement("div");
    content.className = "thumbnail-card-content";

    const title = document.createElement("strong");
    title.textContent = item.label;

    const dimensions = document.createElement("span");
    dimensions.textContent = item.dimensions;

    const buttonRow = document.createElement("div");
    buttonRow.className = "button-row";

    const preview = document.createElement("a");
    preview.className = "secondary-button";
    preview.href = url;
    preview.target = "_blank";
    preview.rel = "noopener noreferrer";
    preview.textContent = "Preview";

    const download = document.createElement("a");
    download.className = "primary-button";
    download.href = url;
    download.download = `${videoId}-${item.key}.jpg`;
    download.textContent = "Download";

    buttonRow.append(preview, download);
    content.append(title, dimensions, buttonRow);
    card.append(image, content);
    container.append(card);
  });
}
