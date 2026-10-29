"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const core = require("./converter-core.js");
const catalog = require("./font-catalog.js");
let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }

// Synthetic engine fixtures, deliberately not labelled as any real font map.
const pack = core.validatePack({ name: "Synthetic engine fixture only", font: "Not a real legacy font", unicodeToLegacy: { "ક": "a", "કા": "ab", "ક્ષ": "Z", "😀": "~" } });
test("longest match wins for Unicode sequences", () => assert.equal(core.convertText("કા ક ક્ષ", pack, "unicodeToLegacy").text, "ab a Z"));
test("longest match wins for legacy sequences", () => assert.equal(core.convertText("ab a Z", pack, "legacyToUnicode").text, "કા ક ક્ષ"));
test("synthetic round trip in both directions", () => {
  const text = "કા ક ક્ષ 😀";
  const encoded = core.convertText(text, pack, "unicodeToLegacy").text;
  assert.equal(core.convertText(encoded, pack, "legacyToUnicode").text, text);
});
test("unknown input preserved and counted as codepoints", () => {
  const result = core.convertText("X😀", pack, "unicodeToLegacy");
  assert.equal(result.text, "X~"); assert.equal(result.unmapped, 1); assert.equal(result.matched, 1);
});
test("empty input returns empty output", () => assert.equal(core.convertText("", pack, "unicodeToLegacy").text, ""));
test("invalid packs and directions rejected", () => {
  assert.throws(() => core.validatePack({name:"empty", unicodeToLegacy:{}}), /no character pairs/);
  assert.throws(() => core.validatePack({name:"bad", unicodeToLegacy:{"ક":null}}), /legacy value/);
  assert.throws(() => core.convertText("a", pack, "invalid"), /Unknown conversion direction/);
});
test("ambiguous reverse mapping blocked instead of guessing", () => {
  const ambiguous = core.validatePack({ name:"Ambiguous synthetic fixture", unicodeToLegacy:{"ક":"a","ખ":"a"} });
  assert.equal(core.convertText("કખ", ambiguous, "unicodeToLegacy").text, "aa");
  assert.throws(() => core.convertText("a", ambiguous, "legacyToUnicode"), /ambiguous and has been blocked/);
});
test("exact reference catalog coverage and unique IDs", () => {
  assert.equal(catalog.fonts.length, 104);
  assert.equal(catalog.fonts.filter(f => f.sources.includes("fontconverter")).length, 31);
  assert.equal(catalog.fonts.filter(f => f.sources.includes("pramukh")).length, 94);
  assert.equal(catalog.fonts.filter(f => f.sources.length === 2).length, 21);
  assert.equal(new Set(catalog.fonts.map(f => f.id)).size, 104);
  assert.equal(new Set(catalog.fonts.map(f => f.name.trim().replace(/\s+/g," ").toLowerCase())).size, 104);
  assert(catalog.fonts.every(f => f.status === "map-unavailable"));
});
test("visible controls and network guard remain present", () => {
  const html = fs.readFileSync(__dirname + "/index.html", "utf8");
  for (const id of ["convertNow", "legacyFont", "fontPack", "catalogSearch", "catalogGrid"]) assert(html.includes(`id="${id}"`));
  for (const mode of ["unicodeCleanup", "legacyToUnicode", "unicodeToLegacy"]) assert(html.includes(`data-mode="${mode}"`));
  assert(html.includes("connect-src 'none'"));
  const app = fs.readFileSync(__dirname + "/app.js", "utf8");
  assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage/.test(app));
});
console.log(`\n${passed} regression checks passed. Synthetic tests do not establish support for any real legacy font.`);
