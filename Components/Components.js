// Components aggregator: map each component to its highest-version entry
const components = {
  ButtonGroup: "./ButtonGroup/V1/ButtonGroup.js",
  DownloadAttachs: "./DownloadAttachs/V1/DownloadAttachs.js",
  Loading: "./Loading/V2/Loading.js",
  Message: "./Message/V2/Message.js",
  TimeShaft: "./TimeShaft/V1/TimeShaft.js",
  TreeExpandPanel: "./TreeExpandPanel/V1/TreeExpandPanel.js",
};

async function loadAll(options = {}) {
  const results = {};
  for (const [name, path] of Object.entries(components)) {
    try {
      // Try ESM dynamic import first
      const mod = await import(path);
      // prefer default export, then module namespace
      results[name] = mod.default ?? mod;
    } catch (err) {
      // Fallback: if scripts define globals, try to read from window
      try {
        if (typeof window !== "undefined" && window[name]) {
          results[name] = window[name];
        } else {
          results[name] = null;
          console.warn(`Component ${name} failed to load from ${path}:`, err);
        }
      } catch (e) {
        results[name] = null;
        console.warn(`Component ${name} load fallback failed:`, e);
      }
    }
  }

  // attach to window for easy global access in browser
  try {
    if (typeof window !== "undefined") {
      window.Components = window.Components || {};
      Object.assign(window.Components, results);
    }
  } catch (e) {
    // ignore in non-browser environments
  }

  return results;
}

// Convenience: synchronous access to configured paths
function getRegistry() {
  return { ...components };
}

// Export API
export { components as registry, getRegistry, loadAll };
export default { registry: components, getRegistry, loadAll };
