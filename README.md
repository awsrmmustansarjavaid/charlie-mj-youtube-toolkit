# 🎬 Charlie MJ YouTube Toolkit

A modern, static, browser-based **YouTube learning workspace** built for GitHub Pages. The project combines YouTube thumbnail tools, an embedded player, subtitle/transcript organization, vocabulary extraction, personal notes, local session storage, and export tools in one frontend application.

> **Hosting philosophy:** this project is deliberately built without GitHub Actions, a backend server, a database, or a frontend build pipeline. It can be published directly as static files through GitHub Pages.

## 🚀 Live Demo

<p align="center">

  <a href="https://awsrmmustansarjavaid.github.io/charlie-mj-youtube-toolkit/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🎬%20Launch%20Charlie%20MJ%20YouTube%20Toolkit-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Launch Charlie MJ YouTube Toolkit">
  </a>

</p>

<p align="center">
  <strong>✨ Try the full web application online</strong><br>
  <sub>Click the button above to open the Charlie MJ YouTube Toolkit in a new tab.</sub>
</p>

---

## ✨ What is this project?

**Charlie MJ YouTube Toolkit** is designed as a practical YouTube utility and language-learning workspace. Instead of using separate small websites for thumbnails, video opening, transcript cleanup, vocabulary collection, notes, and exports, the user can work with these tasks from one dashboard.

The visual identity combines a **Charlie MJ** brand header with a subtle **Pakistan 🇵🇰 × Türkiye 🇹🇷** language-learning theme.

## 🚀 Main Features

- 🎬 YouTube URL analyzer for watch, youtu.be, Shorts, and embed URLs.
- ▶️ Embedded YouTube player with play, pause, and restart controls.
- 🖼️ Thumbnail downloader/preview for common public YouTube thumbnail variants.
- 📝 SRT, VTT, TXT, CSV, and JSON subtitle/text loading support where the supplied file format is compatible.
- 🧹 Transcript cleanup and organization.
- 🔎 Transcript search.
- ⏱️ Timestamp buttons that can seek the embedded player when transcript timestamps are available.
- 📋 One-click transcript copying.
- 📚 Vocabulary extraction from cleaned transcript text.
- 🌐 Source/target language fields for language-learning organization.
- 🗒️ Personal study notes.
- 💾 Local browser session library using `localStorage`.
- 📤 TXT, Markdown, JSON, and CSV export.
- 🌙 Light/dark theme support from the application settings.
- 📖 Distraction-free transcript Reading Mode.
- 📊 Live dashboard counters for saved sessions, vocabulary items, and transcript lines.
- 📱 Responsive Bootstrap 5 grid for desktop, tablet, and mobile.
- ✨ Glassmorphism cards, animated aurora background, grid texture, micro-interactions, and responsive navigation.
- ♿ Keyboard-focus states and reduced-motion support.
- 🔐 No account or application login required.

## 🧠 Important YouTube subtitle architecture note

GitHub Pages is a static hosting platform. A public frontend should not contain private API keys or pretend that browser JavaScript can freely scrape every YouTube caption endpoint. Therefore, this version keeps subtitle processing **client-side**: users can paste subtitle/transcript content or load a local subtitle file, and the application organizes it in the browser.

This architecture keeps the repository safe and portable. A future optional subtitle service can be connected later without redesigning the learning UI.

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript ES Modules
- Bootstrap 5.3 responsive grid and utilities
- YouTube IFrame Player API
- Browser `localStorage`
- Browser Clipboard API
- File API for local subtitle files
- Blob/download APIs for exports
- SVG assets for the project visual identity
- GitHub Pages for static hosting

## 📁 Repository Structure

```text
charlie-mj-youtube-toolkit/
├── index.html
├── README.md
├── .gitignore
├── LICENSE
├── assets/
│   ├── project-thumbnail.svg
│   ├── video-placeholder.svg
│   ├── pakistan-flag.svg
│   └── turkiye-flag.svg
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── export.js
│   ├── player.js
│   ├── storage.js
│   ├── thumbnails.js
│   ├── transcript.js
│   ├── vocabulary.js
│   └── youtube.js
└── docs/
    ├── PROJECT.md
    ├── FEATURES.md
    ├── ARCHITECTURE.md
    ├── TECHNOLOGIES.md
    ├── DEVELOPMENT.md
    ├── DESKTOP-PACKAGING.md
    ├── FRONTEND-DESIGN.md
    ├── architecture/DATA-FLOW.md
    └── features/LEARNING-MODE.md
```

## 📚 Documentation

| Document | Purpose |
|---|---|
| [Project Overview](docs/PROJECT.md) | Why the project exists, goals, scope, and design philosophy. |
| [Features](docs/FEATURES.md) | Detailed feature-by-feature explanation. |
| [Frontend Design](docs/FRONTEND-DESIGN.md) | Bootstrap layout, visual system, backgrounds, branding, and UX decisions. |
| [Architecture](docs/ARCHITECTURE.md) | Application structure and module responsibilities. |
| [Data Flow](docs/architecture/DATA-FLOW.md) | How URL, transcript, vocabulary, notes, storage, and exports move through the app. |
| [Technologies](docs/TECHNOLOGIES.md) | Technology choices and browser APIs. |
| [Development](docs/DEVELOPMENT.md) | Local development and contribution workflow. |
| [Learning Mode](docs/features/LEARNING-MODE.md) | Language-learning workflow and Reading Mode. |
| [Desktop Packaging](docs/DESKTOP-PACKAGING.md) | Optional approaches for creating a desktop `.exe` wrapper. |

## 💻 Run locally

No package manager is required.

### Option 1 — VS Code Live Server

1. Clone or download the repository.
2. Open the folder in VS Code.
3. Start a static Live Server extension.
4. Open the displayed local URL.

### Option 2 — Python static server

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Opening `index.html` directly may restrict ES modules in some browsers, so a small local HTTP server is recommended.

## 🌐 Publish to GitHub Pages

This repository does **not** need GitHub Actions.

1. Create a GitHub repository named `charlie-mj-youtube-toolkit`.
2. Push the repository to the `main` branch.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save the setting.
7. GitHub Pages will publish the static site.

The expected project URL is:

```text
https://awsrmmustansarjavaid.github.io/charlie-mj-youtube-toolkit/
```

## 🖥️ Optional `.exe`

The frontend itself does not need an `.exe`. If you want a portable Windows application later, the repository can be wrapped with a desktop shell such as Electron, Tauri, or WebView2. See [Desktop Packaging](docs/DESKTOP-PACKAGING.md).

## 🔒 Privacy model

- No user account is required.
- Saved sessions use browser local storage.
- Subtitle files are processed in the browser by the frontend.
- The repository does not include private API credentials.
- Export files are generated locally by the browser.

## 🎯 Future expansion ideas

The current architecture leaves room for additional modules without turning the GitHub Pages project into a backend-heavy application:

- Subtitle language detection.
- Side-by-side original/translation transcript view.
- Phrase and sentence collection.
- Flashcard mode and spaced repetition.
- Custom vocabulary tagging.
- Keyboard shortcuts.
- Transcript line bookmarking.
- Video chapter/section notes.
- Import/export of Anki-compatible data.
- Optional external subtitle/translation API integration.
- PWA install support and offline caching.
- Optional desktop wrapper.

## 📄 License

MIT License. See [LICENSE](LICENSE).

---

<p align="center"><strong>Charlie MJ YouTube Toolkit</strong><br>Built as a practical YouTube + language-learning frontend for GitHub Pages.</p>
