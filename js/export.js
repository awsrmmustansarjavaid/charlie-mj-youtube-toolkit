/*
  Charlie MJ YouTube Toolkit
  File: js/export.js
  Purpose:
    Export the current learning workspace to browser-generated files.
  Privacy:
    Files are generated locally. No upload is performed by this module.
*/

/**
 * Trigger a browser download from text content.
 *
 * @param {string} filename - Output filename.
 * @param {string} content - File content.
 * @param {string} mimeType - MIME type.
 */
export function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

/**
 * Build a CSV string from vocabulary candidates.
 *
 * @param {Array<object>} vocabulary - Vocabulary items.
 * @returns {string} CSV document.
 */
export function vocabularyToCsv(vocabulary) {
  const header = "word,frequency";
  const rows = vocabulary.map((item) => {
    const safeWord = `"${String(item.word).replaceAll('"', '""')}"`;
    return `${safeWord},${item.count}`;
  });

  return [header, ...rows].join("\n");
}
