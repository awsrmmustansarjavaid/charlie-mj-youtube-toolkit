# YouTube Subtitle Workflow

## Default behavior

The Charlie MJ YouTube Toolkit now treats the pasted YouTube URL as the primary subtitle source.

The workflow is:

1. Paste a YouTube URL.
2. Click **Analyze Video** or **Get YouTube Subtitles**.
3. The application detects the YouTube video ID.
4. The application attempts to discover the video's public caption tracks.
5. The user can choose a preferred language such as Turkish, Urdu, English, Arabic, or Persian.
6. The selected track is parsed into timestamped subtitle entries.
7. The transcript can be searched, copied, downloaded, and synchronized with the embedded player.

## Noteey-style features

The subtitle area intentionally follows the simple workflow documented by Noteey:

- Paste a YouTube URL.
- Generate/access subtitles.
- View the subtitle text.
- Copy the subtitle text.
- Save the subtitle text.

Reference: https://www.noteey.com/youtube-subtitle-downloader

## Why the implementation uses a fallback

GitHub Pages only serves static files. It does not provide a private backend that can safely fetch YouTube caption data for every browser request.

The application therefore attempts:

1. Direct browser access to YouTube's public timed-text endpoint.
2. A read-only public CORS proxy when the browser blocks the direct request.
3. A small language-probing fallback when a caption-track list is unavailable.

This is intentionally best-effort. YouTube can change caption endpoints, require different request behavior, or restrict a video. A static GitHub Pages application cannot guarantee access to every video's captions.

If automatic retrieval fails, the UI keeps **local SRT/VTT/TXT import** as an optional fallback. It is not the default workflow.

## Subtitle languages

The UI includes common learning languages:

- Turkish (`tr`)
- Urdu (`ur`)
- English (`en`)
- Arabic (`ar`)
- Persian (`fa`)
- German (`de`)
- French (`fr`)
- Spanish (`es`)

YouTube may expose additional languages for a particular video. The underlying caption-track parser accepts arbitrary YouTube language codes.

## Word-by-word translation

When the user enables **Word-by-word translation**, the application:

1. Uses the detected subtitle language as the source language.
2. Splits each subtitle sentence into words and punctuation.
3. Sends individual words to the browser translation provider.
4. Shows the translated word directly underneath the source word.
5. Also shows a sentence-level translation for context.

The application deliberately labels this as machine-assisted translation. Single-word translations can be ambiguous because Turkish, Urdu, Arabic, Persian, and other languages are highly contextual.

## Translation provider

The current frontend uses the public MyMemory translation endpoint for small study requests. The integration is designed for learning rather than high-volume translation. Providers and limits can change, so the code keeps translation isolated in `js/translation.js`.

For larger production usage, replace the provider with a dedicated translation API or an application-owned backend.

## Privacy

Transcript text, notes, and saved sessions are handled in the browser by this project. Translation requests necessarily send the requested word/sentence to the translation provider. Users should avoid sending private or confidential text to third-party translation services.


## Recovery and fallback flow

1. Paste a YouTube URL.
2. The browser calls the public transcript service first.
3. If that fails, the app retries YouTube timed-text endpoints through browser-safe fallback routes.
4. If that also fails, the UI provides a direct transcript URL link and Noteey link.
5. Users can paste a public SRT/VTT/TXT URL into **Direct subtitle URL fallback**.
6. Local subtitle upload remains available as the final manual fallback.

The app is intentionally static and does not hide an API key in GitHub Pages. Third-party services can change availability, rate limits, or CORS policy.
