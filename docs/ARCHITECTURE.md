# Architecture

## Architecture Goal

The application is designed as a **static single-page application**.

The architecture intentionally avoids:

- GitHub Actions.
- Jenkins.
- AWS.
- Kubernetes.
- Docker.
- A custom backend.
- A database.

GitHub provides source-code hosting and GitHub Pages provides static web hosting.

---

## High-Level Architecture

```text
┌─────────────────────────────────────────────────────┐
│                    User Browser                     │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │             Charlie MJ YouTube Toolkit          │  │
│  │                                               │  │
│  │  URL Parser ── Thumbnail ── YouTube Player   │  │
│  │       │              │             │          │  │
│  │       └──────────────┼─────────────┘          │  │
│  │                      ▼                        │  │
│  │              Transcript Workspace             │  │
│  │                      │                        │  │
│  │        ┌─────────────┼──────────────┐         │  │
│  │        ▼             ▼              ▼         │  │
│  │   Vocabulary       Notes          Export      │  │
│  │        │             │              │         │  │
│  │        └─────────────┼──────────────┘         │  │
│  │                      ▼                        │  │
│  │                Local Storage                 │  │
│  └───────────────────────────────────────────────┘  │
│                         │                           │
└─────────────────────────┼───────────────────────────┘
                          │
             External browser resources
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
     YouTube IFrame API          YouTube image CDN
```

---

## Module Architecture

### `app.js`

The controller.

Responsibilities:

- DOM references.
- Application state.
- Event handlers.
- Feature coordination.
- Session restoration.
- Export coordination.

### `youtube.js`

Responsible for:

- URL parsing.
- Video ID extraction.
- Canonical URL generation.
- Thumbnail URL generation.

### `player.js`

Responsible for:

- YouTube IFrame Player API integration.
- Player commands.

### `thumbnails.js`

Responsible for:

- Thumbnail card generation.
- Thumbnail availability handling.

### `transcript.js`

Responsible for:

- SRT parsing.
- VTT parsing.
- Plain text handling.
- Transcript cleaning.
- Transcript formatting.

### `vocabulary.js`

Responsible for:

- Tokenization.
- Candidate extraction.
- Frequency counting.
- Vocabulary rendering.

### `storage.js`

Responsible for:

- localStorage sessions.
- Theme persistence.

### `export.js`

Responsible for:

- Browser downloads.
- TXT.
- Markdown.
- JSON.
- CSV.

---

## Data Ownership

### Browser-owned data

The following data stays in browser memory/localStorage:

- Transcript.
- Vocabulary.
- Notes.
- Saved sessions.
- Theme preference.

### External resources

The application may load:

- YouTube IFrame Player API.
- YouTube thumbnail images.

---

## Why No Backend?

The V1 feature set does not need a database.

A backend would add:

- Hosting cost.
- Authentication.
- API security requirements.
- Data storage.
- Server maintenance.
- CORS and proxy complexity.

The project therefore starts with a static architecture.

---

## When a Backend Becomes Useful

A backend becomes reasonable if the project later needs:

- Automatic subtitle retrieval from services that require server-side access.
- API keys that must not be exposed in browser code.
- Cloud synchronization.
- User accounts.
- Shared libraries.
- Server-side AI processing.
- Large file processing.

The frontend should remain independent from those services as much as possible.

## Subtitle and translation update
See [YOUTUBE-SUBTITLES.md](YOUTUBE-SUBTITLES.md) for the URL-first subtitle workflow, optional local fallback, and word-by-word translation design.
