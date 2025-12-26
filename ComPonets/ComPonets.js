/**
 * 动态脚本加载器
 * 支持多种类型的UI组件标签
 */

// 基础路径前缀
const BASE_PATH = "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main";

// 组件标签配置 - 支持多种组件类型，每种类型可能有多个版本
const ScriptConfig = {
  // TreeExpandPanel 组件
  TreeExpandPanel: [
    "/ComPonets/TreeExpandPanel/V1/TreeExpandPanel.js",
    "/ComPonets/TreeExpandPanel/V2/TreeExpandPanel.js",
    "/ComPonets/TreeExpandPanel/V3/TreeExpandPanel.js",
  ],

  // 其他组件类型，可以按需添加
  DataGrid: [
    "/ComPonets/DataGrid/V1/DataGrid.js",
    "/ComPonets/DataGrid/V2/DataGrid.js",
  ],

  ChartPanel: ["/ComPonets/ChartPanel/V1/ChartPanel.js"],

  FormBuilder: [
    "/ComPonets/FormBuilder/V1/FormBuilder.js",
    "/ComPonets/FormBuilder/Pro/FormBuilder.js",
  ],

  ModalDialog: ["/ComPonets/ModalDialog/V1/ModalDialog.js"],

  SidebarMenu: ["/ComPonets/SidebarMenu/V1/SidebarMenu.js"],

  // 基础组件
  Button: ["/ComPonets/Button/V1/Button.js", "/ComPonets/Button/V2/Button.js"],

  Input: ["/ComPonets/Input/V1/Input.js"],

  Select: ["/ComPonets/Select/V1/Select.js"],

  // 布局组件
  Layout: ["/ComPonets/Layout/V1/Layout.js"],

  // 工具组件
  Uploader: ["/ComPonets/Uploader/V1/Uploader.js"],

  // 业务组件
  UserProfile: ["/ComPonets/UserProfile/V1/UserProfile.js"],
};

// 组件元数据 - 存储组件的额外信息
const ComponentMetadata = {
  TreeExpandPanel: {
    displayName: "树形扩展面板",
    description: "支持多级树形结构展开的面板组件",
    category: "Data Display",
    tags: ["tree", "expandable", "panel"],
  },
  DataGrid: {
    displayName: "数据表格",
    description: "功能强大的数据表格组件",
    category: "Data Display",
    tags: ["table", "grid", "data"],
  },
  ChartPanel: {
    displayName: "图表面板",
    description: "数据可视化图表组件",
    category: "Data Visualization",
    tags: ["chart", "graph", "visualization"],
  },
  // 可以继续添加其他组件的元数据
};

// 组件版本映射 - 快速访问特定版本
const ComponentVersionMap = {
  "TreeExpandPanel:V1": "/ComPonets/TreeExpandPanel/V1/TreeExpandPanel.js",
  "TreeExpandPanel:V2": "/ComPonets/TreeExpandPanel/V2/TreeExpandPanel.js",
  "TreeExpandPanel:V3": "/ComPonets/TreeExpandPanel/V3/TreeExpandPanel.js",
  "DataGrid:V1": "/ComPonets/DataGrid/V1/DataGrid.js",
  "DataGrid:V2": "/ComPonets/DataGrid/V2/DataGrid.js",
  "FormBuilder:V1": "/ComPonets/FormBuilder/V1/FormBuilder.js",
  "FormBuilder:Pro": "/ComPonets/FormBuilder/Pro/FormBuilder.js",
  // 可以继续添加其他组件的版本映射
};

// 已加载脚本缓存
const loadedScripts = new Set();

/**
 * 获取所有支持的组件类型
 * @returns {Array} 组件类型列表
 */
function getComponentTypes() {
  return Object.keys(ScriptConfig).filter(
    (type) =>
      type !== "Map" &&
      type !== "ChangedLog" &&
      type !== "Public" &&
      type !== "Utils"
  );
}

/**
 * 获取组件信息
 * @param {string} componentType 组件类型
 * @returns {Object} 组件信息
 */
function getComponentInfo(componentType) {
  const urls = ScriptConfig[componentType] || [];
  const meta = ComponentMetadata[componentType] || {};

  return {
    type: componentType,
    displayName: meta.displayName || componentType,
    description: meta.description || "",
    category: meta.category || "General",
    tags: meta.tags || [],
    versions: urls.map((url) => {
      const match = url.match(/\/V(\d+)\/|\/(Pro|Lite)\//);
      return match ? match[1] || match[2] : "V1";
    }),
    urls: urls,
  };
}

/**
 * 获取所有组件信息
 * @returns {Array} 所有组件信息数组
 */
function getAllComponentsInfo() {
  return getComponentTypes().map((type) => getComponentInfo(type));
}

/**
 * 按分类获取组件
 * @param {string} category 分类名称
 * @returns {Array} 该分类下的组件信息
 */
function getComponentsByCategory(category) {
  return getAllComponentsInfo().filter((comp) => comp.category === category);
}

/**
 * 添加新组件类型
 * @param {string} componentType 组件类型
 * @param {Array} urls 组件URL数组
 * @param {Object} metadata 组件元数据
 */
function addComponentType(componentType, urls, metadata = {}) {
  if (Array.isArray(urls)) {
    ScriptConfig[componentType] = urls;

    // 添加到组件元数据
    if (metadata) {
      ComponentMetadata[componentType] = metadata;
    }

    // 构建版本映射
    urls.forEach((url) => {
      const versionMatch = url.match(
        /\/V(\d+)\/|\/(Pro|Lite|Beta|Alpha)\/|\/(\w+)\//
      );
      if (versionMatch) {
        const version =
          versionMatch[1] || versionMatch[2] || versionMatch[3] || "V1";
        ComponentVersionMap[`${componentType}:${version}`] = url;
      }
    });

    console.log(`已添加组件类型: ${componentType}, 版本数: ${urls.length}`);
  } else {
    console.error("urls参数必须为数组");
  }
}

/**
 * 加载特定组件
 * @param {string} componentType 组件类型
 * @param {string} version 版本号（可选）
 * @param {Object} options 加载选项
 * @returns {Promise} Promise对象
 */
function loadComponent(componentType, version = null, options = {}) {
  return new Promise((resolve, reject) => {
    if (!ScriptConfig[componentType]) {
      const error = new Error(`未找到组件类型: ${componentType}`);
      console.error(error.message);
      reject(error);
      return;
    }

    let url;
    if (version) {
      // 加载特定版本
      const versionKey = `${componentType}:${version}`;
      url = ComponentVersionMap[versionKey];
      if (!url) {
        const error = new Error(
          `未找到组件 ${componentType} 的版本 ${version}`
        );
        console.error(error.message);
        reject(error);
        return;
      }
    } else {
      // 加载最新版本（最后一个）
      url = ScriptConfig[componentType][ScriptConfig[componentType].length - 1];
    }

    console.log(
      `开始加载组件: ${componentType}${version ? " (" + version + ")" : ""}`
    );

    // 调用基础加载函数
    loadSingleScript(url, componentType, options).then(resolve).catch(reject);
  });
}

/**
 * 加载多个组件
 * @param {Array} components 组件数组，每个元素可以是字符串（类型）或对象{type, version}
 * @param {Object} options 加载选项
 * @returns {Promise} Promise对象
 */
function loadComponents(components, options = {}) {
  if (!Array.isArray(components) || components.length === 0) {
    return Promise.resolve();
  }

  console.log(`开始加载 ${components.length} 个组件:`, components);

  // 顺序加载所有组件
  return components.reduce((promiseChain, component) => {
    return promiseChain.then(() => {
      if (typeof component === "string") {
        return loadComponent(component, null, options);
      } else if (component.type) {
        return loadComponent(component.type, component.version, options);
      } else {
        console.warn("无效的组件配置:", component);
        return Promise.resolve();
      }
    });
  }, Promise.resolve());
}

/**
 * 按分类加载组件
 * @param {string|Array} categories 分类名称或名称数组
 * @param {Object} options 加载选项
 * @returns {Promise} Promise对象
 */
function loadComponentsByCategory(categories, options = {}) {
  const categoryArray = Array.isArray(categories) ? categories : [categories];

  if (categoryArray.length === 0) {
    return Promise.resolve();
  }

  // 获取该分类下的所有组件
  const components = [];
  categoryArray.forEach((category) => {
    const categoryComponents = getComponentsByCategory(category);
    components.push(...categoryComponents.map((comp) => comp.type));
  });

  if (components.length === 0) {
    console.warn(`未找到分类 ${categoryArray.join(", ")} 下的组件`);
    return Promise.resolve();
  }

  console.log(
    `按分类加载: ${categoryArray.join(", ")}, 组件数: ${components.length}`
  );
  return loadComponents(components, options);
}

/**
 * 加载所有组件
 * @param {Object} options 加载选项
 * @returns {Promise} Promise对象
 */
function loadAllComponents(options = {}) {
  const allComponents = getComponentTypes();
  console.log(`开始加载所有组件，共 ${allComponents.length} 种类型`);
  return loadComponents(allComponents, options);
}

/**
 * 检查组件是否已加载
 * @param {string} componentType 组件类型
 * @param {string} version 版本号（可选）
 * @returns {boolean} 是否已加载
 */
function isComponentLoaded(componentType, version = null) {
  if (version) {
    const versionKey = `${componentType}:${version}`;
    const url = ComponentVersionMap[versionKey];
    if (url) {
      return isScriptLoaded(url, componentType);
    }
  } else {
    // 检查是否有任意版本已加载
    const urls = ScriptConfig[componentType] || [];
    return urls.some((url) => isScriptLoaded(url, componentType));
  }
  return false;
}

// 以下是原有的基础函数，保持不变但添加了类型检查
function processScriptUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return BASE_PATH + url;
  }
  return url;
}

function loadSingleScript(url, type = "", options = {}) {
  return new Promise((resolve, reject) => {
    const processedUrl = processScriptUrl(url);
    const cacheKey = type ? `${type}:${processedUrl}` : processedUrl;

    if (loadedScripts.has(cacheKey)) {
      console.log(`脚本已加载，跳过: ${processedUrl}`);
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = processedUrl;
    script.type = options.type || "text/javascript";
    script.async = options.async !== false;
    script.defer = options.defer || false;

    if (type) {
      script.setAttribute("data-script-type", type);
      script.setAttribute("data-component", type);
    }

    script.onload = () => {
      loadedScripts.add(cacheKey);
      console.log(`脚本加载成功 [${type || "unknown"}] : ${processedUrl}`);
      if (options.onLoad) options.onLoad();
      resolve(script);
    };

    script.onerror = (error) => {
      console.error(
        `脚本加载失败 [${type || "unknown"}] : ${processedUrl}`,
        error
      );
      if (options.onError) options.onError(error);
      reject(new Error(`Failed to load script: ${processedUrl}`));
    };

    document.head.appendChild(script);
  });
}

function loadScripts(urls, type = "", options = {}) {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  if (urlArray.length === 0) return Promise.resolve();

  console.log(`开始加载${type ? type + "类型" : ""}脚本:`, urlArray);

  if (options.parallel) {
    const promises = urlArray.map((url) =>
      loadSingleScript(url, type, options)
    );
    return Promise.all(promises);
  } else {
    return urlArray.reduce((promiseChain, url) => {
      return promiseChain.then(() => loadSingleScript(url, type, options));
    }, Promise.resolve());
  }
}

function loadScriptsByType(types, options = {}) {
  const typeArray = Array.isArray(types) ? types : [types];
  if (typeArray.length === 0) {
    console.warn("未指定脚本类型");
    return Promise.resolve();
  }

  console.log(`开始加载类型脚本:`, typeArray);

  return typeArray.reduce((promiseChain, type) => {
    return promiseChain.then(() => {
      const urls = ScriptConfig[type];
      if (urls && urls.length > 0) {
        return loadScripts(urls, type, options);
      } else {
        console.warn(`未找到类型为"${type}"的脚本配置`);
        return Promise.resolve();
      }
    });
  }, Promise.resolve());
}

// 初始化事件
document.addEventListener("DOMContentLoaded", function () {
  console.log("组件脚本加载器已初始化");
  console.log("当前基础路径:", BASE_PATH);
  console.log("支持的组件类型:", getComponentTypes());
  console.log("总组件数量:", getComponentTypes().length);

  // 示例：加载所有Data Display分类的组件
  // loadComponentsByCategory('Data Display').then(() => {
  //   console.log('Data Display组件加载完成');
  // });
});

// 导出API
window.ComponentScriptLoader = {
  // 组件相关方法
  getComponentTypes,
  getComponentInfo,
  getAllComponentsInfo,
  getComponentsByCategory,
  addComponentType,
  loadComponent,
  loadComponents,
  loadComponentsByCategory,
  loadAllComponents,
  isComponentLoaded,

  // 基础加载方法
  loadSingleScript,
  loadScripts,
  loadScriptsByType,
  loadScriptsDirectly: function (urls, type = "Direct", options = {}) {
    console.log("直接加载脚本:", urls);
    return loadScripts(urls, type, options);
  },
  loadAllScripts: function (options = {}) {
    const allTypes = Object.keys(ScriptConfig);
    console.log("开始加载所有已配置的脚本:", allTypes);
    return loadScriptsByType(allTypes, options);
  },

  // 配置管理
  addScriptConfig: function (type, urls, append = true) {
    if (!ScriptConfig[type]) ScriptConfig[type] = [];
    const urlArray = Array.isArray(urls) ? urls : [urls];

    if (append) {
      ScriptConfig[type].push(...urlArray);
    } else {
      ScriptConfig[type] = urlArray;
    }

    console.log(
      `已${append ? "添加" : "设置"}脚本配置 - 类型: ${type}, 数量: ${
        urlArray.length
      }`
    );
  },

  // 缓存和路径管理
  clearScriptCache: function () {
    loadedScripts.clear();
    console.log("已清空脚本缓存");
  },
  getLoadedScripts: function () {
    return Array.from(loadedScripts);
  },
  isScriptLoaded: function (url, type = "") {
    const processedUrl = processScriptUrl(url);
    const cacheKey = type ? `${type}:${processedUrl}` : processedUrl;
    return loadedScripts.has(cacheKey);
  },
  setBasePath: function (newBasePath) {
    BASE_PATH = newBasePath;
    console.log(`基础路径已更新为: ${BASE_PATH}`);
  },
  getBasePath: function () {
    return BASE_PATH;
  },

  // 数据访问
  ScriptConfig,
  ComponentMetadata,
  ComponentVersionMap,
  loadedScripts: function () {
    return Array.from(loadedScripts);
  },
};
