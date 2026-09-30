# Data Flow

## 1. YouTube URL

```text
User
  │
  ▼
URL input
  │
  ▼
extractVideoId()
  │
  ▼
video ID
  │
  ├──────────────► Thumbnail URLs
  │
  ├──────────────► Canonical YouTube URL
  │
  └──────────────► Embedded player
```

---

## 2. Subtitle File

```text
Local SRT/VTT/TXT
       │
       ▼
Browser File API
       │
       ▼
Transcript textarea
       │
       ▼
parseTranscript()
       │
       ▼
cleanTranscript()
       │
       ▼
Transcript workspace
```

---

## 3. Vocabulary

```text
Clean transcript
       │
       ▼
extractVocabulary()
       │
       ▼
Tokenization
       │
       ▼
Stop-word filtering
       │
       ▼
Frequency counting
       │
       ▼
Vocabulary list
```

---

## 4. Export

```text
Workspace
    │
    ├── Transcript
    ├── Vocabulary
    └── Notes
          │
          ▼
      export.js
          │
          ▼
       Blob()
          │
          ▼
 Browser download
```

---

## 5. Saved Session

```text
Workspace
    │
    ▼
saveSession()
    │
    ▼
localStorage
    │
    ▼
Browser-local library
```

---

## Privacy Boundary

```text
                Browser
┌─────────────────────────────────────┐
│ Transcript                          │
│ Notes                               │
│ Vocabulary                          │
│ Saved sessions                      │
│ Export generation                   │
└──────────────────┬──────────────────┘
                   │
                   │ external resources
                   ▼
          YouTube player / images
```

The project does not automatically upload the user's notes or subtitle files to a custom server.
