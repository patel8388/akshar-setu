(function (root) {
  "use strict";

  function validatePack(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The JSON root must be an object.");
    if (typeof raw.name !== "string" || !raw.name.trim() || raw.name.trim().length > 80) throw new Error("Add a short pack name (1–80 characters).");
    const map = raw.unicodeToLegacy;
    if (!map || typeof map !== "object" || Array.isArray(map)) throw new Error("The pack must contain a unicodeToLegacy object.");
    const entries = Object.entries(map);
    if (!entries.length) throw new Error("This map has no character pairs yet.");
    if (entries.length > 50000) throw new Error("The map is too large (maximum 50,000 pairs).");
    for (const [unicode, legacy] of entries) {
      if (typeof unicode !== "string" || !unicode.length || Array.from(unicode).length > 80) throw new Error("Each Unicode key must contain 1–80 characters.");
      if (typeof legacy !== "string" || !legacy.length || Array.from(legacy).length > 80) throw new Error("Each legacy value must contain 1–80 characters.");
    }
    return {
      name: raw.name.trim(),
      version: typeof raw.version === "string" ? raw.version.slice(0, 40) : "",
      font: typeof raw.font === "string" ? raw.font.slice(0, 80) : "",
      unicodeToLegacy: Object.fromEntries(entries)
    };
  }

  function makeEntries(pack, direction) {
    const pairs = Object.entries(pack.unicodeToLegacy);
    const seen = new Set();
    let collisions = 0;
    const entries = [];
    for (const [unicode, legacy] of pairs) {
      const key = direction === "unicodeToLegacy" ? unicode : legacy;
      const value = direction === "unicodeToLegacy" ? legacy : unicode;
      if (seen.has(key)) {
        if (direction === "legacyToUnicode") collisions++;
        continue;
      }
      seen.add(key);
      entries.push({ key, value, size: Array.from(key).length });
    }
    entries.sort((a, b) => b.size - a.size || b.key.length - a.key.length);
    return { entries, collisions };
  }

  function convertText(text, pack, direction) {
    if (typeof text !== "string") throw new Error("Text must be a string.");
    if (direction !== "legacyToUnicode" && direction !== "unicodeToLegacy") throw new Error("Unknown conversion direction.");
    const { entries, collisions } = makeEntries(pack, direction);
    const chars = Array.from(text);
    let output = "";
    let unmapped = 0;
    for (let i = 0; i < chars.length;) {
      let match = null;
      for (const entry of entries) {
        if (i + entry.size > chars.length) continue;
        if (chars.slice(i, i + entry.size).join("") === entry.key) {
          match = entry;
          break;
        }
      }
      if (match) {
        output += match.value;
        i += match.size;
      } else {
        output += chars[i];
        unmapped++;
        i++;
      }
    }
    return { text: output, unmapped, collisions };
  }

  const api = { validatePack, convertText };
  root.GujaratiConverterCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
