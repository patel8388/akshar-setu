(() => {
  "use strict";
  const core = window.GujaratiConverterCore;
  const byId = (id) => document.getElementById(id);
  const source = byId("sourceText");
  const output = byId("outputText");
  const packSelect = byId("fontPack");
  const fileInput = byId("packFile");
  const status = byId("statusMessage");
  const packs = new Map();
  let activePack = null;
  let mode = "legacyToUnicode";

  const labels = {
    legacyToUnicode: { source: "Legacy font text", target: "Gujarati Unicode", from: "Legacy → Unicode" },
    unicodeToLegacy: { source: "Gujarati Unicode", target: "Legacy font text", from: "Unicode → Legacy" }
  };
  const countChars = (text) => Array.from(text).length;
  const plural = (n) => `${n} ${n === 1 ? "character" : "characters"}`;

  function setStatus(text, isError = false) {
    status.textContent = text;
    status.classList.toggle("error", isError);
  }

  function updateCounts() {
    byId("source-count").textContent = plural(countChars(source.value));
    byId("output-count").textContent = plural(countChars(output.value));
  }

  function setMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll(".mode-button").forEach((button) => {
      const selected = button.dataset.mode === mode;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    byId("source-label").textContent = labels[mode].source;
    byId("output-label").textContent = labels[mode].target;
    byId("direction-rail");
    const arrow = document.querySelector(".direction-rail span");
    if (arrow) arrow.textContent = mode === "legacyToUnicode" ? "→" : "←";
    convert();
  }

  function convert() {
    updateCounts();
    if (!source.value) {
      output.value = "";
      setStatus(activePack ? `Ready · ${activePack.name}` : "Add a mapping pack to start converting legacy text.");
      updateCounts();
      return;
    }
    if (!activePack) {
      output.value = "";
      setStatus("No map loaded. Unicode normalization still works; import an authorized map for legacy conversion.");
      updateCounts();
      return;
    }
    try {
      const result = core.convertText(source.value, activePack, mode);
      output.value = result.text;
      let message = `${activePack.name} · ${plural(countChars(result.text))} out`;
      if (result.unmapped) message += ` · ${result.unmapped} unmapped input ${result.unmapped === 1 ? "character" : "characters"} kept unchanged`;
      if (result.collisions) message += ` · ${result.collisions} duplicate legacy key${result.collisions === 1 ? "" : "s"}; first match used`;
      setStatus(message, false);
      updateCounts();
    } catch (error) {
      output.value = "";
      setStatus(error.message || "Could not convert this text.", true);
      updateCounts();
    }
  }

  document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  source.addEventListener("input", convert);
  packSelect.addEventListener("change", () => {
    activePack = packs.get(packSelect.value) || null;
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
      const parsed = JSON.parse(await file.text());
      const pack = core.validatePack(parsed);
      const id = `pack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      packs.set(id, pack);
      const option = document.createElement("option");
      option.value = id;
      option.textContent = pack.font ? `${pack.name} · ${pack.font}` : pack.name;
      packSelect.appendChild(option);
      packSelect.value = id;
      activePack = pack;
      setStatus(`Loaded ${pack.name} locally. No text or mapping file was sent to a server.`);
      convert();
    } catch (error) {
      setStatus(error instanceof SyntaxError ? "That file is not valid JSON." : (error.message || "Could not read this map pack."), true);
    } finally {
      fileInput.value = "";
    }
  });

  byId("copyOutput").addEventListener("click", async () => {
    if (!output.value) {
      setStatus("There is no output to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      setStatus("Converted text copied to clipboard.");
    } catch {
      output.focus();
      output.select();
      setStatus("Select the highlighted output and copy it.");
    }
  });

  byId("downloadOutput").addEventListener("click", () => {
    if (!output.value) {
      setStatus("There is no output to download yet.");
      return;
    }
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gujarati-converted.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Text file downloaded.");
  });

  byId("normalizeText").addEventListener("click", () => {
    source.value = source.value.normalize("NFC");
    convert();
    setStatus("Input normalized to Unicode NFC in this browser.");
  });
  byId("sampleText").addEventListener("click", () => {
    source.value = "ગુજરાતી ભાષા અને અક્ષરો";
    setMode("unicodeToLegacy");
    source.focus();
    convert();
  });
  byId("swapText").addEventListener("click", () => {
    if (!output.value) {
      setStatus("Convert some text first, then swap the result into the input.");
      return;
    }
    const previousOutput = output.value;
    source.value = previousOutput;
    setMode(mode === "legacyToUnicode" ? "unicodeToLegacy" : "legacyToUnicode");
    source.focus();
  });
  byId("clearText").addEventListener("click", () => {
    source.value = "";
    output.value = "";
    convert();
    source.focus();
  });

  setMode(mode);
})();
