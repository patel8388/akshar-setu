# Akshar Setu — Gujarati text tools

A privacy-first static workspace at **https://patel8388.github.io/akshar-setu/**. Text and imported mapping files are processed only in the browser; there is no conversion API, analytics, database, or external font request.

## What works now

- **Unicode cleanup:** NFC normalization, immediately usable without a mapping file.
- **Visible conversion choices:** Unicode cleanup, Legacy → Unicode, and Unicode → Legacy, with an explicit action button.
- **Complete reference-font catalog:** 104 distinct legacy font labels/versions from the two reference selectors, searchable and selectable with mapping availability shown.
- **Local mapping-pack engine:** import authorized JSON data, use longest-sequence matching in either direction, copy output, and download UTF-8 text.

**There are currently zero bundled, independently verified legacy-font mappings.** A font appearing in the catalog is not a claim that it can be converted. Legacy conversion is disabled until a local pack is selected. Imported packs are user-provided data, not independently verified fonts or encodings. No proprietary converter code, mapping tables, or font files from the reference sites have been copied.

The catalog preserves source labels and variants. Font Converter Online has 31 unique non-Unicode selector labels; Pramukh has 94 unique labels (95 options, with `Krishna (Version 1)` repeated). There are 21 exact case/whitespace-insensitive overlaps, giving 104 distinct labels. Some source labels combine several names with `|`; these remain intact. Similar names are **not** assumed to have identical encodings.

See [MAPPING-SOURCES.md](MAPPING-SOURCES.md) for references, reuse findings, and the acceptance checklist for real-font support.

## Run and test

Open `index.html` in a modern browser, or run a static server in this folder. No build step or package installation is required.

```sh
python3 -m http.server 8080
node test.js
```

The tests use synthetic character pairs to test the generic engine. They do not prove support for any real legacy font.

## Mapping-pack format

Create a UTF-8 JSON file with this shape, using pairs you own or are authorized to use. Each key is a Unicode sequence and each value is its exact legacy sequence for one font/version.

```json
{
  "name": "My authorized font map",
  "version": "1.0",
  "font": "Exact font family and version",
  "unicodeToLegacy": {
    "YOUR_UNICODE_SEQUENCE": "YOUR_LEGACY_SEQUENCE"
  }
}
```

The blank `mapping-pack.template.json` is a starter structure, not a real map. Packs are kept only in memory for the current page session. Loading a pack does not upload it and does not install its font. The correct licensed font may be required in your target app to display legacy output.

The generic engine preserves and counts unmapped characters. It never guesses a missing font map. Duplicate legacy sequences make reverse conversion ambiguous, so the engine blocks reverse conversion rather than choosing an arbitrary Unicode character. This simple sequence-table format has no script-specific reordering rules; a real font may need additional handling for pre-base vowels, reph, conjuncts, or contextual glyph forms. Do not treat a schema-valid import as complete or accurate font support. Proofread against the source and test both directions with representative fixtures.

NFC normalization is not legacy decoding, translation, transliteration, spelling correction, or a change of font face.

## Files and deployment

`index.html`, `styles.css`, `app.js`, `converter-core.js`, and `font-catalog.js` form the app. `test.js` contains dependency-free regression checks. `.nojekyll` keeps GitHub Pages serving the static files as-is. GitHub Pages publishes the root of the `main` branch; updates committed there deploy to the same public link. `DEPLOY.md` also contains generic static-server notes.

The page's Content Security Policy sets `connect-src 'none'` as an additional guard against conversion-time network requests. GitHub Pages may log visitor connection details, but it does not receive the text typed into this app.
