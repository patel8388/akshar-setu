# Akshar Setu — Gujarati text converter

An original, static Gujarati text-conversion workspace combining useful ideas from two public interfaces: two-way Unicode/legacy conversion, a font-map selector, copy/download actions, and a compact guide. It runs entirely in the browser.

## Current scope

The app includes a working bidirectional conversion engine and NFC normalization. It deliberately ships **without third-party legacy-font tables or font files**. The referenced converter pages describe their behavior and font catalogs, but do not grant permission to redistribute their code or conversion maps; a public Gujarati converter repository checked during research also has no declared license. Add a mapping pack that you own or are authorized to use to enable conversion for that font/version.

## Run locally

Open `index.html` in a modern browser, or serve the folder with any static web server. No build step or package installation is needed.

## Mapping-pack format

Create a UTF-8 JSON file with this shape. Each key is a Unicode Gujarati sequence and its value is the exact legacy character sequence for one specific font/version.

```json
{
  "name": "My licensed Gujarati font map",
  "version": "1.0",
  "font": "Font family / version",
  "unicodeToLegacy": {
    "YOUR_UNICODE_SEQUENCE": "YOUR_LEGACY_SEQUENCE"
  }
}
```

Replace the example key/value with real pairs from an authorized source. The converter uses longest-match mapping, preserves unmatched characters, and reports duplicate legacy keys because some maps cannot be reversed without ambiguity. Imported packs are held in memory only for the current browser session. The app does not upload them or your text.

## Included files

- `index.html` — landing page, converter, FAQs, and privacy note.
- `styles.css` — responsive styling.
- `converter-core.js` — independent, longest-match bidirectional map engine.
- `app.js` — local-only browser interactions.
- `mapping-pack.template.json` — blank starter structure.
- `DEPLOY.md` — static hosting notes.
- `.nojekyll` — tells GitHub Pages to serve the static files as-is.

## Hosting

Any static host can serve this folder. For a VPS, copy these files to a new web root or subdirectory; do not replace an existing site. See `DEPLOY.md` for a generic Nginx example. This project has no hosting-specific dependency.
