# Forum release review — 23 November 2026

## Included

- Original manual Earth-to-ENSTAB entrance, seek-friendly media, guest lineup, teaser, current exhibitors, sponsors and Ensta tune.
- Clean in-page logo previews for all 15 edition artwork links. No automatic scrolling or slideshow timers; no historical trust section.
- Removed the 3D campus route and Three.js dependencies. Old `/campus` requests redirect to `/#participer`.
- Header registration opens Volunteery directly. Removed the duplicate registration details row, misleading decorative controls and campus links. Photos now continue toward the programme.
- Guest arrow controls retain keyboard focus after selection.

## Checks

- TypeScript and production build pass.
- No missing local asset references, empty links, unresolved section anchors or remaining campus links in the rendered page.
- Chapter menu opens, selects chapters and closes; reduced-motion toggle changes the story and lineup mode.
- Guest previous/next selection, photo gallery arrows/keyboard navigation, Escape dismissal and focus return work.
- All 15 artwork links open the correct clipped logo in a dialog and dismiss with Escape.
- Archive film starts from the 0:08 excerpt muted; pause, sound toggle and resume work. Teaser native playback works.
- Calendar endpoint returns 200 with the confirmed 25 November 2026 all-day date; both film endpoints return 200 video responses. Campus redirect returns 307 to visit details.
- Desktop and 390/320 px layouts reviewed; no horizontal overflow. Registration URL and directions targets checked; external registration was not submitted, and mailto contact was not sent.

## Content still pending

The detailed programme remains explicitly marked as forthcoming. Add the confirmed sessions, times and speakers when supplied; no schedule has been invented.
