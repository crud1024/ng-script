/**
 * 动态脚本加载器
 * 可以根据不同类型加载对应的JavaScript文件
 */

// 基础路径前缀
const BASE_PATH = "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main";

// 脚本类型配置 - 使用相对路径，加载时会自动添加基础前缀
const ScriptConfig = {
  // Map类型脚本 - 可以加载多个
  Map: [
    "/Map/V1/ProMapMarks.js",
    "/Map/V1/AnotherMapScript.js", // 示例：可以添加更多Map脚本
    "/Map/V2/AdvancedMaps.js", // 示例：其他版本的Map脚本
  ],
  // ChangedLog类型脚本 - 单个
  ChangedLog: ["/ChangedLog/SHOWLOGCHANGED.js"],
  // Public类型脚本 - 单个
  Public: ["/PublicAll/PublicScript.js"],
  // Components 类型脚本 - 单个入口，指向 ComPonets/ComPonets.js
  Components: ["/ComPonets/ComPonets.js"],
  // 其他示例脚本类型
  Utils: ["/Utils/CommonUtils.js", "/Utils/Validator.js"],
  UI: ["/UI/Components.js", "/UI/Animations.js"],
};

// 已加载脚本缓存，防止重复加载
const loadedScripts = new Set();

/**
 * 处理脚本URL - 添加基础前缀
 * @param {string} url - 原始URL或相对路径
 * @returns {string} - 处理后的完整URL
 */
function processScriptUrl(url) {
  // 如果已经是完整URL（包含http://或https://），直接返回
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 如果是相对路径（以/开头），添加基础前缀
  if (url.startsWith("/")) {
    return BASE_PATH + url;
  }

  // 其他情况直接返回（可能是相对路径或完整URL）
  return url;
}

/**
 * 加载单个脚本
 * @param {string} url - 脚本URL（可以是相对路径或完整URL）
 * @param {string} type - 脚本类型（可选，用于缓存标识）
 * @returns {Promise} - 返回Promise对象
 */
function loadSingleScript(url, type = "") {
  return new Promise((resolve, reject) => {
    // 处理URL，添加基础前缀
    const processedUrl = processScriptUrl(url);

    // 创建缓存标识
    const cacheKey = type ? `${type}:${processedUrl}` : processedUrl;

    // 检查是否已加载
    if (loadedScripts.has(cacheKey)) {
      console.log(`脚本已加载，跳过: ${processedUrl}`);
      resolve();
      return;
    }

    // 创建script标签
    const script = document.createElement("script");
    script.src = processedUrl;
    script.type = "text/javascript";
    script.async = true;

    // 添加data-type属性，便于调试
    if (type) {
      script.setAttribute("data-script-type", type);
    }

    // 加载成功处理
    script.onload = () => {
      loadedScripts.add(cacheKey);
      console.log(`脚本加载成功 [${type || "unknown"}] : ${processedUrl}`);
      resolve();
    };

    // 加载失败处理
    script.onerror = (error) => {
      console.error(
        `脚本加载失败 [${type || "unknown"}] : ${processedUrl}`,
        error
      );
      reject(new Error(`Failed to load script: ${processedUrl}`));
    };

    // 添加到文档
    document.head.appendChild(script);
  });
}

/**
 * 批量加载脚本
 * @param {Array|string} urls - 脚本URL数组或单个URL（可以是相对路径）
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
 * 直接加载指定URL的脚本（不使用配置）
 * @param {string|Array} urls - 脚本URL或URL数组
 * @param {string} type - 脚本类型（可选）
 * @returns {Promise} - 返回Promise对象
 */
function loadScriptsDirectly(urls, type = "Direct") {
  console.log("直接加载脚本:", urls);
  return loadScripts(urls, type);
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
 * @param {Array|string} urls - 脚本URL或URL数组（可以是相对路径）
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
 * @param {string} url - 脚本URL（可以是相对路径）
 * @param {string} type - 脚本类型（可选）
 * @returns {boolean} - 是否已加载
 */
function isScriptLoaded(url, type = "") {
  const processedUrl = processScriptUrl(url);
  const cacheKey = type ? `${type}:${processedUrl}` : processedUrl;
  return loadedScripts.has(cacheKey);
}

/**
 * 设置新的基础路径
 * @param {string} newBasePath - 新的基础路径
 */
function setBasePath(newBasePath) {
  BASE_PATH = newBasePath;
  console.log(`基础路径已更新为: ${BASE_PATH}`);
}

/**
 * 获取当前基础路径
 * @returns {string} - 当前基础路径
 */
function getBasePath() {
  return BASE_PATH;
}

// 使用示例
document.addEventListener("DOMContentLoaded", function () {
  console.log("脚本加载器已初始化");
  console.log("当前基础路径:", BASE_PATH);

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

  // 示例3：直接加载特定URL
  // loadScriptsDirectly('/Custom/MyScript.js', 'Custom').then(() => {
  //     console.log('自定义脚本加载完成');
  // });
});

// 导出API（如果需要模块化）
window.ScriptLoader = {
  loadSingleScript,
  loadScripts,
  loadScriptsByType,
  loadScriptsDirectly,
  loadAllScripts,
  addScriptConfig,
  clearScriptCache,
  getLoadedScripts,
  isScriptLoaded,
  setBasePath,
  getBasePath,
  ScriptConfig,
  loadedScripts: getLoadedScripts,
};
