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
      if (!unicode.length || Array.from(unicode).length > 80) throw new Error("Each Unicode key must contain 1–80 characters.");
      if (typeof legacy !== "string" || !legacy.length || Array.from(legacy).length > 80) throw new Error("Each legacy value must contain 1–80 characters.");
    }
    return {
      name: raw.name.trim(),
      version: typeof raw.version === "string" ? raw.version.slice(0, 40) : "",
      font: typeof raw.font === "string" ? raw.font.slice(0, 160) : "",
      unicodeToLegacy: Object.fromEntries(entries)
    };
  }

  function makeMatcher(pack, direction) {
    const trie = { next: new Map() };
    const seen = new Set();
    let collisions = 0;
    for (const [unicode, legacy] of Object.entries(pack.unicodeToLegacy)) {
      const key = direction === "unicodeToLegacy" ? unicode : legacy;
      const value = direction === "unicodeToLegacy" ? legacy : unicode;
      if (seen.has(key)) {
        collisions++;
        continue;
      }
      seen.add(key);
      let node = trie;
      for (const char of Array.from(key)) {
        if (!node.next.has(char)) node.next.set(char, { next: new Map() });
        node = node.next.get(char);
      }
      node.value = value;
    }
    return { trie, collisions };
  }

  function convertText(text, pack, direction) {
    if (typeof text !== "string") throw new Error("Text must be a string.");
    if (direction !== "legacyToUnicode" && direction !== "unicodeToLegacy") throw new Error("Unknown conversion direction.");
    const { trie, collisions } = makeMatcher(pack, direction);
    if (collisions) throw new Error(`This pack has ${collisions} duplicate legacy sequence${collisions === 1 ? "" : "s"}. Reverse conversion is ambiguous and has been blocked; use an unambiguous authorized map.`);
    const chars = Array.from(text);
    let output = "";
    let unmapped = 0;
    let matched = 0;
    for (let i = 0; i < chars.length;) {
      let node = trie;
      let match = null;
      for (let j = i; j < chars.length && node.next.has(chars[j]); j++) {
        node = node.next.get(chars[j]);
        if (Object.prototype.hasOwnProperty.call(node, "value")) match = { value: node.value, end: j + 1 };
      }
      if (match) {
        output += match.value;
        i = match.end;
        matched++;
      } else {
        output += chars[i];
        unmapped++;
        i++;
      }
    }
    return { text: output, unmapped, collisions, matched };
  }

  const api = { validatePack, convertText };
  root.GujaratiConverterCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
