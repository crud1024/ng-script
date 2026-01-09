// Components.js - 改为全局脚本
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
      // 直接加载脚本文件（非模块）
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = path;
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load ${path}`));
        document.head.appendChild(script);
      });

      // 从全局对象读取
      if (typeof window !== "undefined" && window[name]) {
        results[name] = window[name];
      } else {
        console.warn(`Component ${name} not found in global scope`);
        results[name] = null;
      }
    } catch (err) {
      console.warn(`Component ${name} failed to load from ${path}:`, err);
      results[name] = null;
    }
  }

  // 挂载到全局
  if (typeof window !== "undefined") {
    window.Components = results;
  }

  return results;
}

function getRegistry() {
  return { ...components };
}

// 直接挂载到全局
window.Components = {};
window.loadAll = loadAll;
window.getRegistry = getRegistry;
window.ComponentsRegistry = components;

// 可选：自动执行加载
loadAll().then((components) => {
  console.log("所有组件已加载", components);
});
