/**
 * 动态脚本加载器
 * 可以根据不同类型加载对应的JavaScript文件
 */

// 脚本类型配置
const ScriptConfig = {
  // Map类型脚本 - 可以加载多个
  Map: [
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Map/V1/ProMapMarks.js",
    "/Map/V1/ProMapMarks.js",
  ],
  // ChangedLog类型脚本 - 单个
  ChangedLog: ["/ChangedLog/SHOWLOGCHANGED.js"],
  // Public类型脚本 - 单个
  Public: ["/PublicAll/PublicScript.js"],
};

// 已加载脚本缓存，防止重复加载
const loadedScripts = new Set();

/**
 * 加载单个脚本
 * @param {string} url - 脚本URL
 * @param {string} type - 脚本类型（可选，用于缓存标识）
 * @returns {Promise} - 返回Promise对象
 */
function loadSingleScript(url, type = "") {
  return new Promise((resolve, reject) => {
    // 创建缓存标识
    const cacheKey = type ? `${type}:${url}` : url;

    // 检查是否已加载
    if (loadedScripts.has(cacheKey)) {
      console.log(`脚本已加载，跳过: ${url}`);
      resolve();
      return;
    }

    // 创建script标签
    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    script.async = true;

    // 加载成功处理
    script.onload = () => {
      loadedScripts.add(cacheKey);
      console.log(`脚本加载成功: ${url}`);
      resolve();
    };

    // 加载失败处理
    script.onerror = (error) => {
      console.error(`脚本加载失败: ${url}`, error);
      reject(new Error(`Failed to load script: ${url}`));
    };

    // 添加到文档
    document.head.appendChild(script);
  });
}

/**
 * 批量加载脚本
 * @param {Array|string} urls - 脚本URL数组或单个URL
 * @param {string} type - 脚本类型（可选）
 * @returns {Promise} - 返回Promise对象
 */
function loadScripts(urls, type = "") {
  // 如果是字符串，转换为数组
  const urlArray = Array.isArray(urls) ? urls : [urls];

  // 如果没有URL，直接返回
  if (urlArray.length === 0) {
    return Promise.resolve();
  }

  console.log(`开始加载${type ? type + "类型" : ""}脚本:`, urlArray);

  // 顺序加载所有脚本（保持加载顺序）
  return urlArray.reduce((promiseChain, url) => {
    return promiseChain.then(() => loadSingleScript(url, type));
  }, Promise.resolve());
}

/**
 * 按类型加载脚本
 * @param {string|Array} types - 脚本类型或类型数组
 * @returns {Promise} - 返回Promise对象
 */
function loadScriptsByType(types) {
  // 如果是字符串，转换为数组
  const typeArray = Array.isArray(types) ? types : [types];

  // 如果没有指定类型，直接返回
  if (typeArray.length === 0) {
    console.warn("未指定脚本类型");
    return Promise.resolve();
  }

  console.log(`开始加载类型脚本:`, typeArray);

  // 顺序加载所有类型的脚本
  return typeArray.reduce((promiseChain, type) => {
    return promiseChain.then(() => {
      const urls = ScriptConfig[type];
      if (urls && urls.length > 0) {
        return loadScripts(urls, type);
      } else {
        console.warn(`未找到类型为"${type}"的脚本配置`);
        return Promise.resolve();
      }
    });
  }, Promise.resolve());
}

/**
 * 加载所有已配置的脚本
 * @returns {Promise} - 返回Promise对象
 */
function loadAllScripts() {
  const allTypes = Object.keys(ScriptConfig);
  console.log("开始加载所有已配置的脚本:", allTypes);
  return loadScriptsByType(allTypes);
}

/**
 * 添加新的脚本配置
 * @param {string} type - 脚本类型
 * @param {Array|string} urls - 脚本URL或URL数组
 */
function addScriptConfig(type, urls) {
  if (!ScriptConfig[type]) {
    ScriptConfig[type] = [];
  }

  const urlArray = Array.isArray(urls) ? urls : [urls];
  ScriptConfig[type].push(...urlArray);
  console.log(`已添加脚本配置 - 类型: ${type}, 数量: ${urlArray.length}`);
}

/**
 * 清空已加载脚本缓存
 */
function clearScriptCache() {
  loadedScripts.clear();
  console.log("已清空脚本缓存");
}

/**
 * 获取已加载的脚本列表
 * @returns {Array} - 已加载的脚本URL数组
 */
function getLoadedScripts() {
  return Array.from(loadedScripts);
}

/**
 * 检查脚本是否已加载
 * @param {string} url - 脚本URL
 * @param {string} type - 脚本类型（可选）
 * @returns {boolean} - 是否已加载
 */
function isScriptLoaded(url, type = "") {
  const cacheKey = type ? `${type}:${url}` : url;
  return loadedScripts.has(cacheKey);
}

// 使用示例
document.addEventListener("DOMContentLoaded", function () {
  console.log("脚本加载器已初始化");

  // 示例1：加载Map类型的所有脚本
  // loadScriptsByType('Map').then(() => {
  //     console.log('Map脚本加载完成');
  // }).catch(error => {
  //     console.error('Map脚本加载失败:', error);
  // });

  // 示例2：加载多个类型的脚本
  // loadScriptsByType(['Map', 'ChangedLog', 'Public']).then(() => {
  //     console.log('所有指定类型脚本加载完成');
  // });

  // 示例3：加载所有已配置的脚本
  // loadAllScripts().then(() => {
  //     console.log('所有脚本加载完成');
  // });

  // 示例4：动态添加新的脚本配置并加载
  // addScriptConfig('Utils', '/utils/common.js');
  // loadScriptsByType('Utils');
});

// 导出API（如果需要模块化）
window.ScriptLoader = {
  loadSingleScript,
  loadScripts,
  loadScriptsByType,
  loadAllScripts,
  addScriptConfig,
  clearScriptCache,
  getLoadedScripts,
  isScriptLoaded,
  ScriptConfig,
  loadedScripts: getLoadedScripts,
};
