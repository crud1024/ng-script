// Components index - auto-load component scripts in this directory's subfolders
// Provides two loading modes:
// - importAll(): uses dynamic ESM `import()` (for bundlers / module loaders)
// - loadAll(): inserts <script> tags to load files in the browser (no bundler)

const COMPONENT_PATHS = [
  "./ButtonGroup/V1/ButtonGroup.js",
  "./DownloadAttachs/V1/DownloadAttachs.js",
  "./Loading/V1/FishingAnimation.js",
  "./Loading/V2/Loading.js",
  "./Message/V1/Message.js",
  "./Message/V2/Message.js",
  "./TimeShaft/V1/TimeShaft.js",
  "./TreeExpandPanel/V1/TreeExpandPanel.js",
];

async function importAll() {
  const results = {};
  await Promise.all(
    COMPONENT_PATHS.map(async (p) => {
      try {
        const mod = await import(p);
        results[p] = mod;
      } catch (err) {
        // dynamic import may fail if file is not a module; keep trying others
        console.warn("import failed for", p, err);
      }
    })
  );
  return results;
}

function resolveScriptUrl(relPath) {
  // Resolve relative to this script's location (if available), otherwise the current location
  try {
    const currentScript = document.currentScript && document.currentScript.src;
    const base = currentScript
      ? new URL(".", currentScript).href
      : window.location.href;
    return new URL(relPath, base).href;
  } catch (e) {
    return relPath;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve(src);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

async function loadAll() {
  const loaded = [];
  for (const p of COMPONENT_PATHS) {
    try {
      const url = resolveScriptUrl(p);
      await loadScript(url);
      loaded.push(p);
    } catch (err) {
      console.warn("Failed to load script", p, err);
    }
  }
  return loaded;
}

const Components = {
  list: COMPONENT_PATHS.slice(),
  importAll,
  loadAll,
};

// Attach to window for non-module consumers
if (typeof window !== "undefined") {
  window.NGComponents = window.NGComponents || {};
  window.NGComponents.Components = Components;
}

// ESM default export
export default Components;
