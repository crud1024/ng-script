(function(){
"use strict";
var __modules = {};
__modules["./ListToLayer/V1/ListToLayer.js"] = function(module, exports, require){
/**
 * 通用列表转树形结构函数
 * @param {Array} list - 扁平化数据列表
 * @param {Object} options - 配置选项
 * @param {string} options.idKey - 节点ID键名，默认's_tree_id'
 * @param {string} options.parentKey - 父节点ID键名，默认's_tree_pid'
 * @param {string} options.childrenKey - 子节点键名，默认'children'
 * @param {Object} options.fieldMapping - 字段映射对象，可选
 * @returns {Array} 树形结构数据
 */
function ListToLayer(list, options = {}) {
  // 默认配置
  const defaultOptions = {
    idKey: "s_tree_id",
    parentKey: "s_tree_pid",
    childrenKey: "children",
    fieldMapping: null,
  };

  // 合并配置
  const config = { ...defaultOptions, ...options };
  const { idKey, parentKey, childrenKey, fieldMapping } = config;

  // 如果没有数据，返回空数组
  if (!list || !Array.isArray(list) || list.length === 0) {
    return [];
  }

  // 处理字段映射
  const mapFields = (node) => {
    if (!fieldMapping) return { ...node };

    const mappedNode = {};

    // 处理特殊字段（children字段在后续步骤添加）
    const specialKeys = [childrenKey];

    // 遍历原节点属性
    Object.keys(node).forEach((key) => {
      // 如果存在字段映射，则使用映射后的字段名
      if (fieldMapping[key] !== undefined) {
        mappedNode[fieldMapping[key]] = node[key];
      }
      // 特殊字段不在这里处理
      else if (!specialKeys.includes(key)) {
        mappedNode[key] = node[key];
      }
    });

    return mappedNode;
  };

  // 使用reduce构建节点映射
  const nodeMap = list.reduce((acc, node) => {
    const mappedNode = mapFields(node);
    const nodeId = node[idKey];

    // 确保节点有ID
    if (nodeId !== undefined && nodeId !== null) {
      acc[nodeId] = {
        ...mappedNode,
        [childrenKey]: [],
      };
    }
    return acc;
  }, {});

  // 存储根节点
  const roots = [];

  // 第二次遍历，构建父子关系
  list.forEach((node) => {
    const currentNode = nodeMap[node[idKey]];
    const parentId = node[parentKey];

    // 如果当前节点不存在（可能ID无效），跳过
    if (!currentNode) return;

    // 查找父节点
    if (parentId !== undefined && parentId !== null && nodeMap[parentId]) {
      // 将当前节点添加到父节点的children中
      nodeMap[parentId][childrenKey].push(currentNode);
    } else {
      // 没有父节点或父节点不存在，作为根节点
      roots.push(currentNode);
    }
  });

  return roots;
}

};
__modules["./OrgOrProJectTreeEventBinder/V1/OrgOrProJectTreeEventBinder.js"] = function(module, exports, require){
/**
 * 树节点编码提取与事件绑定工具类
 */
class TreeCodeEventBinder {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {Function} options.onNumberCodeExtracted - 数字编码提取后的回调
   * @param {Function} options.onIdentifierCodeExtracted - 标识符编码提取后的回调
   * @param {string} options.treeContainerSelector - 树容器选择器
   * @param {number} options.retryDelay - 重试延迟(毫秒)
   */
  constructor(options = {}) {
    this.options = {
      treeContainerSelector: ".ant-tree-list-holder-inner",
      retryDelay: 1000,
      ...options,
    };

    this.observer = null;
    this.isInitialized = false;
  }

  /**
   * 从title属性中提取数字编码（格式：[123456]）
   * @param {string} title - title属性值
   * @returns {string|null} 提取的数字编码
   */
  static extractNumberCodeFromTitle(title) {
    if (!title) return null;
    const match = title.match(/\[(\d+)\]/);
    return match ? match[1] : null;
  }

  /**
   * 从title属性中提取标识符编码（多种格式）
   * 支持格式：
   * 1. CS-GQ-00062 (字母-字母-数字)
   * 2. GQ-2508-0002 (字母-数字-数字)
   * 3. 其他类似格式：X-X-XXXXX (包含字母、数字和连字符)
   * @param {string} title - title属性值
   * @returns {string|null} 提取的标识符编码
   */
  static extractIdentifierCodeFromTitle(title) {
    if (!title) return null;

    // 第一种模式：字母-字母-数字 (如 CS-GQ-00062)
    const pattern1 = /([A-Za-z]+)-([A-Za-z]+)-(\d+)/;

    // 第二种模式：字母-数字-数字 (如 GQ-2508-0002)
    const pattern2 = /([A-Za-z]+)-(\d+)-(\d+)/;

    // 第三种模式：更通用的模式，匹配包含字母、数字和连字符的编码
    const pattern3 = /([A-Za-z0-9]+(?:-[A-Za-z0-9]+){2,})/;

    // 优先匹配具体的格式
    let match = title.match(pattern1);
    if (match) {
      return match[0];
    }

    match = title.match(pattern2);
    if (match) {
      return match[0];
    }

    // 最后尝试通用模式
    match = title.match(pattern3);
    if (match) {
      // 检查是否至少包含2个连字符
      const parts = match[0].split("-");
      if (parts.length >= 3) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * 为树节点绑定点击事件
   * @private
   */
  _addTreeItemClickEvents() {
    const treeContainer = document.querySelector(
      this.options.treeContainerSelector
    );

    if (!treeContainer) {
      console.warn(`未找到树容器: ${this.options.treeContainerSelector}`);
      setTimeout(() => this._addTreeItemClickEvents(), this.options.retryDelay);
      return;
    }

    const treeItems = treeContainer.querySelectorAll('div[role="treeitem"]');

    if (treeItems.length === 0) {
      console.warn("树容器中没有找到树节点");
      setTimeout(() => this._addTreeItemClickEvents(), this.options.retryDelay);
      return;
    }

    treeItems.forEach((treeItem, index) => {
      if (treeItem.hasAttribute("data-code-event-added")) {
        return;
      }

      treeItem.setAttribute("data-code-event-added", "true");
      const originalClickHandler = treeItem.onclick;

      treeItem.addEventListener("click", (event) => {
        this._handleTreeItemClick(treeItem, index, originalClickHandler, event);
      });
    });

    console.log(`成功为 ${treeItems.length} 个树节点绑定了事件`);
  }

  /**
   * 处理树节点点击事件
   * @private
   */
  _handleTreeItemClick(treeItem, index, originalClickHandler, event) {
    console.log(`点击了树节点 ${index + 1}`);

    const spans = treeItem.querySelectorAll("span");
    let foundNumberCode = null;
    let foundIdentifierCode = null;

    for (let span of spans) {
      const title = span.getAttribute("title");
      if (title) {
        // 提取数字编码
        if (!foundNumberCode) {
          foundNumberCode =
            TreeCodeEventBinder.extractNumberCodeFromTitle(title);
          if (foundNumberCode) {
            this._triggerNumberCodeEvent(foundNumberCode, title);
          }
        }

        // 提取标识符编码
        if (!foundIdentifierCode) {
          foundIdentifierCode =
            TreeCodeEventBinder.extractIdentifierCodeFromTitle(title);
          if (foundIdentifierCode) {
            this._triggerIdentifierCodeEvent(foundIdentifierCode, title);
          }
        }

        // 如果两种编码都找到了，可以跳出循环
        if (foundNumberCode && foundIdentifierCode) {
          break;
        }
      }
    }

    // 输出未找到编码的情况
    this._logExtractionResult(foundNumberCode, foundIdentifierCode);

    // 执行原始点击事件
    if (originalClickHandler) {
      try {
        originalClickHandler.call(treeItem, event);
      } catch (e) {
        console.error("执行原有点击事件时出错:", e);
      }
    }
  }

  /**
   * 触发数字编码事件
   * @private
   */
  _triggerNumberCodeEvent(numberCode, sourceTitle) {
    console.log(`提取到数字编码: ${numberCode} (来自title: "${sourceTitle}")`);

    if (typeof this.options.onNumberCodeExtracted === "function") {
      this.options.onNumberCodeExtracted(numberCode, sourceTitle);
    }
  }

  /**
   * 触发标识符编码事件
   * @private
   */
  _triggerIdentifierCodeEvent(identifierCode, sourceTitle) {
    console.log(
      `提取到标识符编码: ${identifierCode} (来自title: "${sourceTitle}")`
    );

    if (typeof this.options.onIdentifierCodeExtracted === "function") {
      this.options.onIdentifierCodeExtracted(identifierCode, sourceTitle);
    }
  }

  /**
   * 记录编码提取结果
   * @private
   */
  _logExtractionResult(foundNumberCode, foundIdentifierCode) {
    if (!foundNumberCode && !foundIdentifierCode) {
      console.log("未找到任何编码格式");
    } else if (!foundNumberCode) {
      console.log("未找到数字编码，但找到了标识符编码");
    } else if (!foundIdentifierCode) {
      console.log("未找到标识符编码，但找到了数字编码");
    }
  }

  /**
   * 监听DOM变化
   * @private
   */
  _observeTreeChanges() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          let hasTreeItems = false;
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.matches && node.matches('div[role="treeitem"]')) {
                hasTreeItems = true;
              }
              if (
                node.querySelector &&
                node.querySelector('div[role="treeitem"]')
              ) {
                hasTreeItems = true;
              }
            }
          });

          if (hasTreeItems) {
            setTimeout(() => this._addTreeItemClickEvents(), 100);
          }
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 初始化工具
   */
  init() {
    if (this.isInitialized) {
      console.warn("TreeCodeEventBinder 已经初始化过了");
      return;
    }

    setTimeout(() => {
      this._addTreeItemClickEvents();
      this._observeTreeChanges();
      this.isInitialized = true;
      console.log("TreeCodeEventBinder 初始化完成");
    }, 500);
  }

  /**
   * 销毁工具，清理事件监听
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // 清理已绑定的事件
    const treeContainer = document.querySelector(
      this.options.treeContainerSelector
    );
    if (treeContainer) {
      const treeItems = treeContainer.querySelectorAll(
        'div[role="treeitem"][data-code-event-added]'
      );
      treeItems.forEach((item) => {
        item.removeAttribute("data-code-event-added");
        item.onclick = null;
      });
    }

    this.isInitialized = false;
    console.log("TreeCodeEventBinder 已销毁");
  }

  /**
   * 重新绑定事件
   */
  rebind() {
    this.destroy();
    this.init();
  }

  /**
   * 手动触发数字编码事件
   * @param {string} code - 数字编码
   */
  triggerNumberCodeEvent(code) {
    if (typeof this.options.onNumberCodeExtracted === "function") {
      this.options.onNumberCodeExtracted(code, "手动触发");
    }
  }

  /**
   * 手动触发标识符编码事件
   * @param {string} code - 标识符编码
   */
  triggerIdentifierCodeEvent(code) {
    if (typeof this.options.onIdentifierCodeExtracted === "function") {
      this.options.onIdentifierCodeExtracted(code, "手动触发");
    }
  }
}

// 导出工具类
if (typeof module !== "undefined" && module.exports) {
  module.exports = TreeCodeEventBinder;
} else if (typeof define === "function" && define.amd) {
  define("TreeCodeEventBinder", [], () => TreeCodeEventBinder);
} else {
  window.TreeCodeEventBinder = TreeCodeEventBinder;
}

};

var __cache = {};
function __require(id){ if(__cache[id]) return __cache[id].exports; var module = {exports:{}}; __cache[id]=module; __modules[id](module, module.exports, __require); return module.exports; }
var G = (typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:global));
G.NG = G.NG || {}; G.NG.Utils = G.NG.Utils || {};
G.NG.Utils["ListToLayer/V1/ListToLayer"] = __require("./ListToLayer/V1/ListToLayer.js");
G.NG.Utils["OrgOrProJectTreeEventBinder/V1/OrgOrProJectTreeEventBinder"] = __require("./OrgOrProJectTreeEventBinder/V1/OrgOrProJectTreeEventBinder.js");

})();
