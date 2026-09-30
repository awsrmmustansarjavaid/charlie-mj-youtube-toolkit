# Development Guide

## Requirements

For the current static version:

- A modern browser.
- Git.
- Optional Python for a local static server.
- A text/code editor.

No Node.js installation is required.

---

## Clone

```bash
git clone https://github.com/YOUR-USERNAME/youtube-learning-toolkit.git
cd youtube-learning-toolkit
```

---

## Run Directly

Open:

```text
index.html
```

Modern browsers support JavaScript modules when served from a normal web origin. If your browser blocks a local module in a particular environment, use the local server method below.

---

## Run with Python

From the repository root:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

---

## Development Workflow

1. Edit HTML.
2. Edit CSS.
3. Edit JavaScript modules.
4. Refresh the browser.
5. Test the affected feature.
6. Commit changes.

Example:

```bash
git status
git add .
git commit -m "Improve transcript organizer"
git push
```

No GitHub Actions workflow is required.

---

## Coding Rules

### Comments

Every source file should explain:

- What the file does.
- Why the file exists.
- Important browser/API limitations.
- Non-obvious implementation choices.

### JavaScript

Prefer:

- Small modules.
- Named exports.
- JSDoc comments.
- Clear variable names.
- No unnecessary dependencies.

### Security

Avoid:

- `innerHTML` for untrusted user content.
- Hard-coded secrets.
- API keys in public JavaScript.
- Automatic uploads of personal notes.

---

## Testing Checklist

### URL parsing

Test:

- YouTube watch URL.
- youtu.be URL.
- Shorts URL.
- Embed URL.
- Invalid URL.

### Thumbnails

Test:

- Normal video.
- Video without maximum resolution thumbnail.
- Broken image handling.

### Transcript

Test:

- SRT.
- VTT.
- Plain text.
- Empty input.
- Duplicate lines.
- Search.

### Local storage

Test:

- Save session.
- Restore session.
- Clear library.

### Export

Test:

- TXT.
- Markdown.
- JSON.
- CSV.

### Responsive layout

Test:

- Desktop.
- Tablet.
- Mobile.

---

## GitHub Pages Deployment

Use:

```text
Settings
→ Pages
→ Deploy from a branch
→ main
→ /
→ Save
```

The application is designed to work without an Actions workflow.

---

## Future Development

Possible next modules:

```text
translation.js
ocr.js
flashcards.js
quiz.js
anki.js
pdf.js
statistics.js
```

These should remain modular so that the static core stays easy to understand.
