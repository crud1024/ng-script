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

// 配置：自动加载的组件（可以修改这个数组来改变自动加载的组件）
const AUTO_LOAD_COMPONENTS = ["Message"];
const DEFAULT_MESSAGE_VERSION = "V1"; // 默认使用 V1 版本

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

// 自动加载指定组件
async function autoLoadComponents() {
  const componentsToLoad = [];

  // 找出需要自动加载的组件路径
  AUTO_LOAD_COMPONENTS.forEach((componentName) => {
    if (componentName === "Message") {
      // 对于 Message，使用指定版本
      const messagePath = COMPONENT_PATHS.find(
        (p) =>
          p.includes(`/${componentName}/`) &&
          p.includes(`/${DEFAULT_MESSAGE_VERSION}/`)
      );
      if (messagePath) {
        componentsToLoad.push(messagePath);
      }
    } else {
      // 其他组件，加载第一个匹配的版本
      const componentPath = COMPONENT_PATHS.find((p) =>
        p.includes(`/${componentName}/`)
      );
      if (componentPath) {
        componentsToLoad.push(componentPath);
      }
    }
  });

  console.log("自动加载组件:", componentsToLoad);

  for (const p of componentsToLoad) {
    try {
      const url = resolveScriptUrl(p);
      await loadScript(url);
      console.log("已加载:", p);
    } catch (err) {
      console.warn("自动加载失败:", p, err);
    }
  }

  // 等待组件就绪
  await waitForComponents();
  return componentsToLoad;
}

// 等待组件就绪
function waitForComponents() {
  return new Promise((resolve) => {
    const componentsToCheck = AUTO_LOAD_COMPONENTS;
    let allReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 3秒超时

    function check() {
      attempts++;

      // 检查所有需要自动加载的组件
      allReady = componentsToCheck.every((componentName) => {
        if (componentName === "Message") {
          return window.Message && typeof window.Message.info === "function";
        }
        // 其他组件的检查条件可以根据实际情况添加
        return window[componentName];
      });

      if (allReady || attempts >= maxAttempts) {
        // 触发就绪事件
        const event = new CustomEvent("NGComponentsReady", {
          detail: {
            components: componentsToCheck,
            allReady: allReady,
            version: DEFAULT_MESSAGE_VERSION,
          },
        });
        window.dispatchEvent(event);
        resolve();
      } else {
        setTimeout(check, 100);
      }
    }

    check();
  });
}

const Components = {
  list: COMPONENT_PATHS.slice(),
  importAll,
  loadAll,
  autoLoadComponents, // 新增：自动加载方法
  config: {
    autoLoad: AUTO_LOAD_COMPONENTS,
    defaultMessageVersion: DEFAULT_MESSAGE_VERSION,
  },
};

// Attach to window for non-module consumers
if (typeof window !== "undefined") {
  window.NGComponents = window.NGComponents || {};
  window.NGComponents.Components = Components;

  // 自动执行（如果配置了自动加载）
  (async () => {
    try {
      await autoLoadComponents();
    } catch (error) {
      console.error("自动加载组件失败:", error);
    }
  })();
}

// 自动触发就绪检测（确保组件可用后触发事件）
(function autoCheckComponents() {
  if (window.Message && typeof window.Message.info === "function") {
    window.dispatchEvent(new CustomEvent("MessageReady"));
  } else {
    setTimeout(autoCheckComponents, 100);
  }
})();

// ESM default export
export default Components;
