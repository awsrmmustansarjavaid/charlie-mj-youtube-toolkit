# Frontend Design & UX

## Visual direction

Charlie MJ YouTube Toolkit uses a modern dashboard visual language designed for a learning utility rather than a basic downloader page.

### Main design elements

- **Charlie MH text logo** in the top navigation.
- Sticky glass navigation bar.
- Aurora-style radial background lighting.
- Subtle technical grid background.
- Glassmorphism dashboard cards.
- Bootstrap responsive grid system.
- Large editorial hero typography.
- Gradient primary actions.
- Compact status pills and live indicators.
- Consistent spacing and rounded card system.
- Dark-first interface with optional light mode.
- Reduced-motion support for accessibility.

## Frontend suggestions implemented

### 1. Dashboard layout

Instead of a single vertical form, the application is divided into media, transcript, learning, and export areas.

### 2. Visual hierarchy

The page now has a clear flow:

`Analyze → Video → Player → Thumbnail → Transcript → Vocabulary → Notes → Export`

### 3. Quick capability cards

A feature strip immediately communicates the four core areas of the application.

### 4. Responsive Bootstrap grid

Bootstrap's `container`, `row`, and `col-*` classes handle structural responsiveness. Custom CSS handles branding and component appearance.

### 5. Theme memory

The light/dark choice is stored in LocalStorage so the browser can remember the visitor's preference.

### 6. Future-ready extension points

The frontend is intentionally modular. AI transcript organization, translation, OCR, Anki export, and playlist workflows can be added without replacing the main layout.
