(() => {
  "use strict";
  const core = window.GujaratiConverterCore;
  const catalog = window.GujaratiFontCatalog || { fonts: [], sources: {} };
  const byId = (id) => document.getElementById(id);
  const source = byId("sourceText");
  const output = byId("outputText");
  const packSelect = byId("fontPack");
  const fontSelect = byId("legacyFont");
  const fileInput = byId("packFile");
  const status = byId("statusMessage");
  const packs = new Map();
  let activePack = null;
  let selectedFontId = "";
  let mode = "unicodeCleanup";

  const labels = {
    unicodeCleanup: { source: "Gujarati Unicode", target: "Normalized Unicode" },
    legacyToUnicode: { source: "Legacy font text", target: "Gujarati Unicode" },
    unicodeToLegacy: { source: "Gujarati Unicode", target: "Legacy font text" }
  };
  const countChars = (text) => Array.from(text).length;
  const plural = (n) => `${n} ${n === 1 ? "character" : "characters"}`;
  const normalizedName = (text) => String(text || "").trim().replace(/\s+/g, " ").toLowerCase();
  const selectedFont = () => catalog.fonts.find((font) => font.id === selectedFontId);
  const packForFont = (font) => font && Array.from(packs.entries()).find(([, pack]) => normalizedName(pack.font) === normalizedName(font.name));

  function setStatus(text, isError = false) {
    status.textContent = text;
    status.classList.toggle("error", isError);
  }

  function updateCounts() {
    byId("source-count").textContent = plural(countChars(source.value));
    byId("output-count").textContent = plural(countChars(output.value));
  }

  function availabilityMessage() {
    if (mode === "unicodeCleanup") return "Ready: Unicode NFC cleanup. This standardizes Unicode sequences; it does not decode legacy text.";
    if (activePack) return `Local import: ${activePack.name}${activePack.font ? ` · ${activePack.font}` : " · font not specified"}. Check the exact font/version and proofread output; this pack is not independently verified.`;
    const font = selectedFont();
    return font
      ? `${font.name}: conversion unavailable — no verified, licensed map is bundled. Import an authorized JSON pack for this exact font/version.`
      : "Choose a font and import an authorized JSON mapping pack. No verified legacy maps are bundled, so legacy conversion is not yet enabled.";
  }

  function updateAvailability() {
    byId("convertNow").disabled = mode !== "unicodeCleanup" && !activePack;
    byId("convertNow").textContent = mode === "unicodeCleanup" ? "Clean Unicode" : "Convert now";
    byId("pack-help").textContent = availabilityMessage();
    fontSelect.value = selectedFontId;
  }

  function convert() {
    updateAvailability();
    updateCounts();
    if (!source.value) {
      output.value = "";
      setStatus(availabilityMessage());
    } else if (mode === "unicodeCleanup") {
      output.value = source.value.normalize("NFC");
      setStatus(`Unicode NFC cleanup complete · ${plural(countChars(output.value))} · processed only in this browser.`);
    } else if (!activePack) {
      output.value = "";
      setStatus(availabilityMessage(), true);
    } else {
      try {
        const result = core.convertText(source.value, activePack, mode);
        output.value = result.text;
        let message = `Local pack: ${activePack.name} · ${plural(countChars(result.text))} out`;
        if (result.unmapped) message += ` · ${result.unmapped} unmapped input ${result.unmapped === 1 ? "character" : "characters"} kept unchanged`;
        if (result.collisions) message += ` · ${result.collisions} ambiguous reverse key${result.collisions === 1 ? "" : "s"}; check this map`;
        if (!result.matched && source.value.trim()) message += " · no mapped sequences matched; check direction, font and version";
        message += ". Proofread against the original; font-specific shaping may need additional rules.";
        setStatus(message, Boolean(result.collisions || (!result.matched && source.value.trim())));
      } catch (error) {
        output.value = "";
        setStatus(error.message || "Could not convert this text.", true);
      }
    }
    updateCounts();
  }

  function setMode(nextMode) {
    if (!labels[nextMode]) return;
    mode = nextMode;
    document.querySelectorAll(".mode-button").forEach((button) => {
      const selected = button.dataset.mode === mode;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    byId("source-label").textContent = labels[mode].source;
    byId("output-label").textContent = labels[mode].target;
    source.placeholder = mode === "legacyToUnicode" ? "Paste text copied from the exact legacy font/version…" : "Paste or type Gujarati Unicode text here…";
    const arrow = document.querySelector(".direction-rail span");
    if (arrow) arrow.textContent = mode === "unicodeToLegacy" ? "←" : "→";
    convert();
  }

  function renderCatalog() {
    const query = normalizedName(byId("catalogSearch").value);
    const visible = catalog.fonts.filter((font) => normalizedName(font.name).includes(query));
    const grid = byId("catalogGrid");
    grid.replaceChildren();
    for (const font of visible) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "font-option";
      button.dataset.fontId = font.id;
      button.classList.toggle("selected", font.id === selectedFontId);
      button.setAttribute("aria-pressed", String(font.id === selectedFontId));
      const name = document.createElement("strong");
      name.textContent = font.name;
      const availability = document.createElement("span");
      availability.className = "font-status";
      availability.textContent = packForFont(font) ? "Local pack imported · not independently verified" : "Map not bundled";
      const reference = document.createElement("small");
      reference.textContent = `Listed by: ${font.sources.map((key) => catalog.sources[key]?.name || key).join(" · ")}`;
      button.append(name, availability, reference);
      grid.appendChild(button);
    }
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "catalog-empty";
      empty.textContent = "No font names match this search. Try a shorter family name.";
      grid.appendChild(empty);
    }
    byId("catalogCount").textContent = `${visible.length} of ${catalog.fonts.length} font options shown`;
  }

  function chooseFont(id, focusConverter = false) {
    selectedFontId = id;
    const match = packForFont(selectedFont());
    activePack = match ? match[1] : null;
    packSelect.value = match ? match[0] : "";
    if (mode === "unicodeCleanup" && id) setMode("legacyToUnicode");
    else convert();
    renderCatalog();
    if (focusConverter) {
      byId("converter").scrollIntoView({ behavior: "smooth", block: "start" });
      fontSelect.focus({ preventScroll: true });
    }
  }

  function syncFontFromPack() {
    const match = activePack && catalog.fonts.find((font) => normalizedName(font.name) === normalizedName(activePack.font));
    selectedFontId = match ? match.id : "";
    fontSelect.value = selectedFontId;
    renderCatalog();
  }

  for (const font of catalog.fonts) {
    const option = document.createElement("option");
    option.value = font.id;
    option.textContent = `${font.name} — map not bundled`;
    fontSelect.appendChild(option);
  }
  byId("catalogSummary").textContent = `${catalog.fonts.length} distinct legacy font labels and versions from the two reference catalogs are listed below. Unicode cleanup is ready; 0 independently verified legacy mappings are bundled.`;

  document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  source.addEventListener("input", convert);
  byId("convertNow").addEventListener("click", convert);
  fontSelect.addEventListener("change", () => chooseFont(fontSelect.value));
  byId("catalogSearch").addEventListener("input", renderCatalog);
  byId("catalogGrid").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-font-id]");
    if (button) chooseFont(button.dataset.fontId, true);
  });
  packSelect.addEventListener("change", () => {
    activePack = packs.get(packSelect.value) || null;
    syncFontFromPack();
    convert();
  });
  byId("uploadPack").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setStatus("Map file is larger than 1 MB. Choose a smaller JSON file.", true);
      fileInput.value = "";
      return;
    }
    try {
      const pack = core.validatePack(JSON.parse(await file.text()));
      const id = `pack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      packs.set(id, pack);
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${pack.name}${pack.font ? ` · ${pack.font}` : ""} (local import)`;
      packSelect.appendChild(option);
      packSelect.value = id;
      activePack = pack;
      syncFontFromPack();
      for (const fontOption of fontSelect.options) {
        const font = catalog.fonts.find((entry) => entry.id === fontOption.value);
        if (font && packForFont(font)) fontOption.textContent = `${font.name} — local pack imported`;
      }
      convert();
      if (!source.value || mode === "unicodeCleanup") setStatus(`Loaded ${pack.name} only in this browser. Select a legacy conversion direction to use it. The map is not independently verified.`);
    } catch (error) {
      setStatus(error instanceof SyntaxError ? "That file is not valid JSON." : (error.message || "Could not read this map pack."), true);
    } finally {
      fileInput.value = "";
    }
  });

  byId("copyOutput").addEventListener("click", async () => {
    if (!output.value) return setStatus("There is no output to copy yet.");
    try {
      await navigator.clipboard.writeText(output.value);
      setStatus("Output copied to clipboard.");
    } catch {
      output.focus();
      output.select();
      setStatus("Select the highlighted output and copy it.");
    }
  });
  byId("downloadOutput").addEventListener("click", () => {
    if (!output.value) return setStatus("There is no output to download yet.");
    const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "unicodeCleanup" ? "gujarati-unicode-normalized.txt" : "gujarati-converted.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Text file downloaded locally.");
  });
  byId("normalizeText").addEventListener("click", () => {
    source.value = source.value.normalize("NFC");
    setMode("unicodeCleanup");
  });
  byId("sampleText").addEventListener("click", () => {
    source.value = "ગુજરાતી ભાષા અને અક્ષરો";
    setMode("unicodeCleanup");
    source.focus();
  });
  byId("swapText").addEventListener("click", () => {
    if (!output.value) return setStatus("Create some output first, then swap it into the input.");
    source.value = output.value;
    setMode(mode === "unicodeCleanup" ? "unicodeCleanup" : mode === "legacyToUnicode" ? "unicodeToLegacy" : "legacyToUnicode");
    source.focus();
  });
  byId("clearText").addEventListener("click", () => {
    source.value = "";
    output.value = "";
    convert();
    source.focus();
  });

  renderCatalog();
  setMode(mode);
})();
