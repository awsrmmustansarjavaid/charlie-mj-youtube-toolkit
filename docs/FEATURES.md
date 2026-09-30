# Feature Specification

## 1. YouTube URL Analyzer

### Supported URL forms

- `youtube.com/watch?v=...`
- `youtu.be/...`
- `youtube.com/shorts/...`
- `youtube.com/embed/...`

### Output

- Video ID
- Canonical YouTube URL
- Thumbnail preview
- Embedded player

---

## 2. Thumbnail Downloader

The application generates public thumbnail URLs for common YouTube thumbnail variants.

### Included variants

- Maximum resolution
- SD
- High quality
- Medium
- Default

Availability depends on the video.

### Actions

- Preview
- Open image
- Download

---

## 3. Embedded Player

The official YouTube IFrame Player API is used.

Current controls:

- Play
- Pause
- Restart

The architecture is ready for:

- Timestamp seeking
- Playback progress
- Keyboard shortcuts
- Transcript synchronization

---

## 4. Subtitle / Transcript Workspace

Users can:

- Paste transcript text.
- Paste SRT.
- Paste VTT.
- Load local subtitle files.
- Clean the transcript.
- Search the transcript.
- Click timestamp buttons.
- Export the result.

---

## 5. Transcript Cleaner

The cleaner:

- Normalizes line endings.
- Removes common subtitle markup.
- Normalizes whitespace.
- Removes exact duplicate caption entries.
- Preserves timing when available.
- Converts captions into readable entries.

---

## 6. Vocabulary Builder

The current implementation is deliberately offline and deterministic.

It:

- Tokenizes transcript text.
- Supports Unicode letters.
- Removes a small set of common stop words.
- Counts word frequency.
- Displays candidate vocabulary.

It does not pretend to provide dictionary-quality translations.

---

## 7. Notes

Users can maintain personal notes such as:

- Vocabulary.
- Grammar.
- Important sentences.
- Questions.
- Study reminders.

---

## 8. Local Library

Sessions can contain:

- Video URL.
- Video ID.
- Title.
- Thumbnail.
- Transcript.
- Vocabulary.
- Notes.
- Source language.
- Target language.
- Saved timestamp.

The library is browser-local.

---

## 9. Export

### TXT

Human-readable transcript.

### Markdown

Study document containing transcript and notes.

### JSON

Structured learning session.

### CSV

Vocabulary frequency data.

---

## 10. Planned Advanced Features

The architecture can later be expanded with:

- Automatic caption retrieval through an appropriate API/service.
- Translation API integration.
- AI transcript organization.
- AI vocabulary explanations.
- Grammar explanations.
- Flashcards.
- Spaced repetition.
- Quiz generation.
- OCR from screenshots.
- Image text extraction.
- Anki export.
- PDF generation.
- Cloud synchronization.
- Optional user accounts.

These are deliberately not required for the static V1.
