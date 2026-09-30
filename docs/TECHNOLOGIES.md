# Technologies

## HTML5

HTML provides the application structure.

Used for:

- Forms.
- Navigation.
- Buttons.
- Video workspace.
- Transcript area.
- Notes.
- Export controls.

---

## CSS3

CSS provides:

- Responsive layout.
- Light/dark theme.
- Cards.
- Buttons.
- Mobile layout.
- Typography.
- Dashboard layout.

No CSS framework is required.

---

## JavaScript ES Modules

The application uses browser-native ES modules.

Benefits:

- No bundler.
- No package installation.
- Clear module boundaries.
- Direct GitHub Pages compatibility.

---

## YouTube IFrame Player API

The official YouTube IFrame Player API is used for the embedded player.

It provides JavaScript controls for the embedded player.

The application does not use it to download YouTube video files.

---

## Browser File API

Used to read user-selected subtitle files locally.

Examples:

- SRT.
- VTT.
- TXT.

---

## Browser Blob API

Used to generate downloadable files locally.

Examples:

- TXT.
- Markdown.
- JSON.
- CSV.

---

## localStorage

Used for:

- Saved sessions.
- Theme preference.

This keeps V1 serverless.

---

## GitHub

GitHub provides:

- Source-code repository.
- Version control.
- Issue tracking.
- Project documentation.

---

## GitHub Pages

GitHub Pages hosts the static website.

No GitHub Actions workflow is required.

The repository can be configured to publish the `main` branch root directory.

---

## Why Vanilla JavaScript?

The project is deliberately lightweight.

A framework such as React could be introduced later, but the current application does not need:

- npm dependencies.
- Bundling.
- transpilation.
- a build pipeline.

This makes the repository easier for beginners to understand and deploy.
