# Frontend Design & UX

## Visual Direction

Charlie MJ YouTube Toolkit uses a dark, modern learning-dashboard style rather than a plain utility website. The interface combines glass panels, an aurora background, subtle grid texture, rounded controls, responsive cards, and a strong Charlie MJ brand mark.

## Pakistan × Türkiye Identity

The top strip displays self-contained SVG versions of the Pakistan and Türkiye flags. They are decorative identity elements for the language-learning concept and do not depend on a third-party image host.

## Bootstrap Grid

Bootstrap 5.3 provides the main responsive grid:

- `container-fluid` for full-width dashboard sections.
- `row` and `col-*` for responsive content distribution.
- `col-xl-8` for the primary video workspace.
- `col-xl-4` for transcript, vocabulary, and notes tools.
- Responsive cards collapse into a single-column layout on smaller screens.

## Custom CSS Layer

Bootstrap is not the complete visual design. `css/style.css` adds:

- CSS custom properties for colors and spacing.
- Glassmorphism surfaces.
- Animated background orbs.
- Grid texture overlay.
- Gradient typography.
- Custom chips and status badges.
- Thumbnail presentation.
- Transcript rows.
- Export tiles.
- Responsive navigation.
- Accessibility focus states.
- `prefers-reduced-motion` handling.

## Frontend Enhancements

### Dashboard statistics

The hero displays live counts for saved sessions, vocabulary candidates, and transcript lines.

### Quick actions

The hero card provides one-click navigation to the workspace, learning section, and local library.

### Reading Mode

Reading Mode turns the transcript card into a focused overlay so a learner can concentrate on subtitle text without visual distractions.

### Clipboard actions

The interface includes copy actions for the analyzed YouTube URL and cleaned transcript. The application gracefully reports when browser clipboard permission is unavailable.

### Responsive behavior

The application is designed for:

- Desktop monitors.
- Laptops.
- Tablets.
- Mobile screens.

The player, thumbnail grid, library rows, navigation, and workspace columns adapt to the available width.

## Design Principles

1. **Learning first:** transcript and vocabulary tools remain prominent.
2. **Low friction:** common actions are reachable from the hero and workspace cards.
3. **Portable:** the UI does not require an application account.
4. **Static-host friendly:** no build system is required.
5. **Accessible:** keyboard focus and reduced-motion support are included.
6. **Extendable:** each feature remains separated into a JavaScript module.

## Subtitle and translation update
See [YOUTUBE-SUBTITLES.md](YOUTUBE-SUBTITLES.md) for the URL-first subtitle workflow, optional local fallback, and word-by-word translation design.
