# Charlie MJ YouTube Toolkit

A modern, open-source, **GitHub Pages-friendly YouTube learning workspace** for people who want to turn YouTube videos into organized language-learning material.

> **Brand/UI:** The application displays **Charlie MH** as its text logo while the repository/project name is **Charlie MJ YouTube Toolkit**.

## 🚀 Live Demo

<p align="center">
  <a href="https://awsrmmustansarjavaid.github.io/charlie-mj-youtube-toolkit/" target="_blank">
    <img src="https://img.shields.io/badge/🎬%20Launch%20Charlie%20MJ%20YouTube%20Toolkit-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Launch Charlie MJ YouTube Toolkit">
  </a>
</p>

<p align="center">
  <strong>✨ Try the full web application online</strong><br>
  <sub>Click the button above to open the Charlie MJ YouTube Toolkit in a new tab.</sub>
</p>

---

## What this project does

Charlie MJ YouTube Toolkit combines two practical YouTube utilities — **thumbnail downloading/preview** and **subtitle/transcript learning tools** — inside one responsive frontend application.

It can:

- Analyze common YouTube URLs in the browser.
- Extract a YouTube video ID and generate thumbnail URLs.
- Preview multiple thumbnail qualities.
- Open thumbnails directly for saving.
- Embed the selected YouTube video.
- Load SRT, VTT, TXT and compatible local subtitle files.
- Clean and organize transcript text.
- Search transcript content.
- Extract useful vocabulary from cleaned text.
- Store personal study notes in browser storage.
- Save learning sessions locally.
- Export TXT, Markdown, JSON and CSV data.
- Switch between dark and light themes.
- Work responsively on desktop, tablet and mobile.

## Why I built it

Many YouTube learning tools solve only one small problem. This project combines media utilities and language-learning workflow into one focused dashboard so that a learner can move from **video → subtitles → vocabulary → notes → export** without switching between many websites.

The project is also intentionally **static-first**. GitHub Pages can host it directly, so there is no requirement for GitHub Actions, a CI pipeline, a database, or a permanent backend server.

## Architecture

```text
Browser
  │
  ├── Bootstrap 5 + Custom CSS
  │
  ├── YouTube URL parser
  │       └── Thumbnail URL generator
  │
  ├── Embedded YouTube Player
  │
  ├── Subtitle / Transcript Workspace
  │       ├── SRT / VTT / TXT parser
  │       ├── Cleaner
  │       └── Search
  │
  ├── Vocabulary Builder
  │
  ├── Personal Notes
  │
  ├── LocalStorage Learning Library
  │
  └── TXT / MD / JSON / CSV Export
```

## Technologies

- HTML5
- CSS3
- Modern JavaScript
- Bootstrap 5.3
- Bootstrap Icons
- YouTube embedded player
- Browser LocalStorage
- GitHub Pages

## Project structure

```text
.
├── assets/                 # Visual project assets and placeholders
├── css/                    # Custom application styling
├── docs/                   # Detailed project documentation
├── js/                     # Modular frontend JavaScript
├── .gitignore
├── index.html              # Main GitHub Pages entry point
├── LICENSE
└── README.md
```

## Documentation

- [Project Overview](docs/PROJECT.md)
- [Complete Features](docs/FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data Flow](docs/architecture/DATA-FLOW.md)
- [Learning Mode](docs/features/LEARNING-MODE.md)
- [Technologies](docs/TECHNOLOGIES.md)
- [Frontend Design & UX](docs/FRONTEND-DESIGN.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Desktop / EXE Packaging](docs/DESKTOP-PACKAGING.md)

## Run locally

Because this is a static application, you can open `index.html` directly in a browser. A local HTTP server is recommended for the most consistent browser behavior.

### Python local server

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload or push this project.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.

No GitHub Actions workflow is required.

## Optional desktop EXE

The frontend can later be packaged with Electron, Tauri, or another desktop wrapper. See [Desktop Packaging](docs/DESKTOP-PACKAGING.md).

## Important subtitle architecture note

A public static page should not expose private API keys or pretend that browser JavaScript can universally scrape YouTube's caption systems. This version therefore focuses on reliable local subtitle-file/text processing. An optional backend/API adapter can be added later without replacing the frontend architecture.

## Future expansion ideas

- Side-by-side original/translation transcript mode.
- AI-assisted transcript cleanup and sentence segmentation.
- Turkish/Urdu/Arabic/Persian language presets.
- Vocabulary review and spaced repetition.
- Playlist study queue.
- Sentence-level timestamps.
- Favorite vocabulary collections.
- Import/export of Anki-compatible cards.
- Optional OCR workflow for video screenshots.
- Optional desktop application packaging.

## License

MIT License. See [LICENSE](LICENSE).
