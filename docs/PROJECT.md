# Project Overview

## What Is Charlie MJ YouTube Toolkit?

Charlie MJ YouTube Toolkit is a browser-based, open-source web application for turning a YouTube video URL into a structured workspace for media use and language learning.

The project combines the basic idea of:

1. A YouTube subtitle/transcript utility.
2. A YouTube thumbnail downloader.

Instead of maintaining those tools as separate websites, the project combines them into one dashboard and adds learning-oriented functionality.

---

## Why I Built This Project

Many YouTube utilities solve one small task at a time.

A user may need to:

- Find a thumbnail.
- Read subtitles.
- Copy a transcript.
- Search a transcript.
- Study unfamiliar words.
- Write notes.
- Save useful material.
- Export the result.

Switching between several websites makes that workflow fragmented.

This project brings the workflow into one browser interface.

The larger learning goal is:

```text
Watch
  ↓
Read
  ↓
Understand
  ↓
Collect
  ↓
Organize
  ↓
Review
  ↓
Export
```

---

## Target Users

The project is useful for:

- Language learners.
- Students.
- Researchers working with public video material.
- Developers learning browser APIs.
- People who want lightweight YouTube utilities.
- Users who prefer local-first browser tools.

---

## Core Problems Addressed

### Problem 1: Fragmented YouTube tools

The application combines multiple related utilities.

### Problem 2: Messy subtitle text

Subtitle files often contain timestamps, duplicate lines, and awkward line breaks.

The transcript cleaner converts these into a more readable structure.

### Problem 3: Learning vocabulary

A learner can extract repeated word candidates from a transcript and use them as a starting point for study.

### Problem 4: Losing study notes

The local library stores sessions in the browser.

### Problem 5: Difficult data reuse

Export functions make it possible to move the study data into other applications.

---

## Project Philosophy

The application follows five principles:

### 1. Static first

The first version should work as a static GitHub Pages application.

### 2. Local first

Personal notes, transcripts, and learning sessions should remain in the user's browser unless the user explicitly exports them.

### 3. Modular

Each feature has a focused JavaScript module.

### 4. Transparent

The project should clearly distinguish browser capabilities from functionality that requires a server or external API.

### 5. Expandable

The initial application can later support translation, OCR, flashcards, quizzes, and optional APIs.
