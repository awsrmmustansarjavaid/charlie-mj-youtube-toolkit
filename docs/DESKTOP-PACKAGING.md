# Optional Windows Desktop Packaging

## Important

The main project is an online GitHub Pages web application.

You do **not** need an `.exe` to use the online application.

A desktop `.exe` is an optional future packaging layer.

---

## Option 1: Electron

Electron can load the same frontend into a desktop window.

Typical architecture:

```text
Electron
   │
   ├── Browser Window
   │      │
   │      └── Charlie MJ YouTube Toolkit frontend
   │
   └── Optional desktop integration
```

A future Electron wrapper could provide:

- Windows `.exe`.
- Desktop application icon.
- Native file dialogs.
- Local file storage.
- Optional system integrations.

---

## Option 2: Tauri

Tauri can package a web frontend into a smaller desktop application.

Advantages can include:

- Smaller application footprint.
- Native Rust backend when needed.
- Web frontend reuse.

---

## Recommended Packaging Strategy

Keep the main source independent:

```text
index.html
css/
js/
assets/
```

Then create a separate desktop wrapper.

Do not put desktop-only logic into the core GitHub Pages frontend unless it is required.

---

## Example Future Structure

```text
youtube-learning-toolkit/
│
├── index.html
├── css/
├── js/
├── assets/
│
└── desktop/
    └── electron/
        ├── main.js
        └── package.json
```

The desktop wrapper should be added only when the web version is stable.
