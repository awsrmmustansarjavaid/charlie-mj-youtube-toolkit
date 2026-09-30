# Language Learning Mode

## Purpose

The learning mode transforms a generic YouTube transcript utility into a study workspace.

---

## Basic Workflow

```text
YouTube video
     ↓
Subtitle / transcript
     ↓
Clean text
     ↓
Vocabulary
     ↓
Notes
     ↓
Export
```

---

## Source and Target Languages

The interface contains:

```text
Source language
Target language
```

Examples:

```text
Turkish → English
Urdu → English
Arabic → English
Persian → English
English → Turkish
```

The current V1 stores these fields but does not pretend to provide automatic translation without a translation engine.

---

## Vocabulary Builder

The offline vocabulary builder identifies candidate words based on:

- Unicode word detection.
- Minimum word length.
- Frequency.
- Small built-in stop-word list.

It is intentionally simple and transparent.

---

## Future Translation Layer

A future implementation can add:

```text
Transcript
   ↓
Translation API
   ↓
Original + Translation
```

Any API key should be protected by a suitable backend rather than placed directly in a public GitHub Pages JavaScript file.

---

## Future Flashcards

Vocabulary can become:

```text
Front
------
öğrenmek

Back
------
to learn
```

Potential fields:

- Word.
- Translation.
- Example sentence.
- Source video.
- Timestamp.
- Personal note.
- Difficulty.
- Review history.

---

## Future OCR

A screenshot could be processed:

```text
Video frame
    ↓
OCR
    ↓
Detected text
    ↓
Language detection
    ↓
Translation
    ↓
Organized learning card
```

This would connect the project with a future browser-based OCR language-learning workflow.

---

## Future Quiz

Transcript vocabulary can generate:

- Multiple choice.
- Fill in the blank.
- Matching.
- Translation questions.
- Listening questions.

The quiz engine should keep generated questions tied to the original transcript so learners can review the source context.
