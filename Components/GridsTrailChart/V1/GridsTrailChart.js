/**
 * 表格金额字段后缀管理器 - 完整修复版
 * @class TableAmountSuffix
 */
class TableAmountSuffix {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    // 合并默认配置
    this.config = {
      containerId: "p_form_expert_fee_apply_d1",
      fieldKeys: ["u_unit_price"],
      suffixText: "元",
      suffixClass: "",
      suffixStyle: {
        color: "#999",
        marginLeft: "2px",
        fontSize: "inherit",
      },
      useSeparateElement: true,
      scrollDebounceTime: 300,
      updateInterval: 1000,
      maxInitRetry: 20, // 增加最大重试次数
      initRetryDelay: 500,
      autoObserve: true,
      debug: true,
      ...options,
    };

    // 状态变量
    this.state = {
      observer: null,
      intervalId: null,
      timeoutId: null,
      isProcessing: false,
      modifiedCount: 0,
      rowCache: new Set(),
      initRetryCount: 0,
      isInitialized: false,
      scrollHandler: null,
    };

    // 初始化
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.createStyles();

    if (this.config.debug) {
      console.log("TableAmountSuffix 初始化，容器ID:", this.config.containerId);
    }

    if (this.config.autoObserve) {
      this.tryInitialize();
    }
  }

  /**
   * 尝试初始化
   */
  tryInitialize() {
    const container = document.getElementById(this.config.containerId);

    if (!container) {
      if (this.state.initRetryCount < this.config.maxInitRetry) {
        this.state.initRetryCount++;
        if (this.config.debug) {
          console.log(
            `[${this.state.initRetryCount}/${this.config.maxInitRetry}] 容器未找到: ${this.config.containerId}, 等待重试...`,
          );
        }
        setTimeout(() => this.tryInitialize(), this.config.initRetryDelay);
        return;
      } else {
        console.error(
          `初始化失败: 无法找到容器 ${this.config.containerId}，请检查容器ID是否正确`,
        );
        return;
      }
    }

    if (this.config.debug) {
      console.log("找到容器，开始监听:", container);
    }

    this.state.isInitialized = true;
    this.startObserving();
    this.processTable();
  }

  /**
   * 创建样式
   */
  createStyles() {
    const styleId = "table-amount-suffix-styles-" + Date.now();
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleEl = document.createElement("style");
    styleEl.id = styleId;

    const styles = `
            .amount-suffix-wrapper {
                display: inline-flex !important;
                align-items: center !important;
                white-space: nowrap !important;
            }
            
            .amount-value {
                flex-shrink: 0;
                white-space: nowrap;
            }
            
            .amount-suffix-separate {
                display: inline-block !important;
                white-space: nowrap !important;
                color: #999 !important;
                margin-left: 2px !important;
                font-size: inherit !important;
            }
            
            .has-amount-suffix {
                position: relative;
            }
        `;

    // 添加自定义样式
    if (this.config.suffixStyle) {
      styleEl.textContent =
        styles +
        `
                .custom-amount-suffix {
                    ${this.objectToCss(this.config.suffixStyle)}
                }
            `;
    } else {
      styleEl.textContent = styles;
    }

    document.head.appendChild(styleEl);
  }

  /**
   * 对象转CSS
   */
  objectToCss(styleObj) {
    if (!styleObj) return "";
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value} !important;`)
      .join(" ");
  }

  /**
   * 驼峰转连字符
   */
  camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * 主处理函数
   */
  processTable() {
    if (!this.state.isInitialized || this.state.isProcessing) {
      return;
    }

    this.state.isProcessing = true;

    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }

    this.state.timeoutId = setTimeout(() => {
      try {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
          if (this.config.debug) {
            console.warn("容器在运行时被移除");
          }
          this.state.isProcessing = false;
          return;
        }

        const result = this.addSuffixToTable(container);
        if (result > 0 && this.config.debug) {
          console.log(`处理完成，修改了 ${result} 个字段`);
        }
      } catch (error) {
        console.error("处理表格时出错:", error);
      } finally {
        this.state.isProcessing = false;
        this.state.timeoutId = null;
      }
    }, 100);
  }

  /**
   * 添加后缀到表格
   */
  addSuffixToTable(container) {
    const tableRows = this.findTableRows(container);
    let currentModified = 0;

    if (this.config.debug) {
      console.log(`找到 ${tableRows.length} 行`);
    }

    tableRows.forEach((row, rowIndex) => {
      const rowKey = this.getRowKey(row, rowIndex);

      if (this.state.rowCache.has(rowKey)) {
        return;
      }

      this.config.fieldKeys.forEach((fieldKey) => {
        const element = this.findFieldElement(row, fieldKey);
        if (element) {
          if (this.addSuffixToElement(element, rowKey)) {
            currentModified++;
            this.state.modifiedCount++;
          }
        }
      });

      this.state.rowCache.add(rowKey);
    });

    if (currentModified > 0) {
      console.log(`表格金额后缀添加完成，本次处理 ${currentModified} 个字段`);
    }

    return currentModified;
  }

  /**
   * 查找表格行
   */
  findTableRows(container) {
    const rowSelectors = [
      "tr[data-row-key]",
      "tr[data-index]",
      '[class*="table-row"]',
      ".table-row",
      "tr",
      ".ant-table-row",
      "tbody > *",
    ];

    for (const selector of rowSelectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) {
        if (this.config.debug) {
          console.log(`使用选择器 "${selector}" 找到 ${rows.length} 行`);
        }
        return rows;
      }
    }

    return [];
  }

  /**
   * 获取行标识
   */
  getRowKey(row, index) {
    const dataKey =
      row.getAttribute("data-row-key") || row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const rowId = row.getAttribute("id");

    if (dataKey) return `key:${dataKey}`;
    if (dataIndex) return `index:${dataIndex}`;
    if (rowId) return `id:${rowId}`;

    return `row-${index}`;
  }

  /**
   * 查找字段元素
   */
  findFieldElement(row, fieldKey) {
    const selectors = [
      `[data-key="${fieldKey}"]`,
      `[fieldname="${fieldKey}"]`,
      `[name="${fieldKey}"]`,
      `[data-field="${fieldKey}"]`,
      `[data-col-key="${fieldKey}"]`,
      `td[data-key="${fieldKey}"]`,
      `.${fieldKey}`,
      `#${fieldKey}`,
    ];

    for (const selector of selectors) {
      const element = row.querySelector(selector);
      if (element) {
        if (this.config.debug) {
          console.log(`找到字段元素 ${fieldKey}:`, selector, element);
        }
        return element;
      }
    }

    return null;
  }

  /**
   * 添加后缀到元素
   */
  addSuffixToElement(element, rowKey) {
    if (this.hasSuffix(element)) {
      return false;
    }

    const numericElement = this.findDeepestNumericElement(element);
    if (!numericElement) {
      if (this.config.debug) {
        console.log("未找到数值元素:", element);
      }
      return false;
    }

    const currentText = this.getElementText(numericElement);
    if (!currentText || currentText.trim().includes(this.config.suffixText)) {
      return false;
    }

    const numericMatch = this.extractNumericValue(currentText);
    if (!numericMatch) {
      return false;
    }

    const { numericText } = numericMatch;

    if (this.config.useSeparateElement) {
      this.safeAddSeparateSuffix(numericElement, numericText);
    } else {
      this.addSuffixAsText(numericElement, currentText);
    }

    element.setAttribute("data-has-suffix", "true");
    return true;
  }

  /**
   * 深度查找数值元素
   */
  findDeepestNumericElement(element) {
    // 优先查找直接的文本节点
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && /\d/.test(node.nodeValue)) {
        textNodes.push({
          node: node.parentElement || element,
          text: node.nodeValue.trim(),
        });
      }
    }

    if (textNodes.length > 0) {
      return textNodes[0].node;
    }

    // 回退到子元素查找
    const allElements = Array.from(element.getElementsByTagName("*"));
    for (let i = allElements.length - 1; i >= 0; i--) {
      const el = allElements[i];
      const text = this.getElementText(el);
      if (
        text &&
        /\d/.test(text) &&
        !el.classList.contains("amount-suffix-wrapper")
      ) {
        return el;
      }
    }

    return element;
  }

  /**
   * 获取元素文本
   */
  getElementText(element) {
    if (!element) return "";

    if (element.nodeType === Node.TEXT_NODE) {
      return element.nodeValue.trim();
    }

    if (element.value !== undefined && element.value !== null) {
      return String(element.value).trim();
    }

    return (element.textContent || element.innerText || "").trim();
  }

  /**
   * 检查是否有后缀
   */
  hasSuffix(element) {
    if (!element) return false;

    if (element.getAttribute("data-has-suffix") === "true") {
      return true;
    }

    if (element.classList.contains("has-amount-suffix")) {
      return true;
    }

    if (
      element.querySelector(".amount-suffix-separate, .amount-suffix-wrapper")
    ) {
      return true;
    }

    const text = this.getElementText(element);
    return text.includes(this.config.suffixText);
  }

  /**
   * 提取数字值
   */
  extractNumericValue(text) {
    if (!text) return null;

    const numericMatch = text.match(/[-+]?[0-9,.]+/);
    if (!numericMatch) return null;

    const numericText = numericMatch[0].trim();
    const numericValue = numericText.replace(/,/g, "");

    if (isNaN(parseFloat(numericValue))) {
      return null;
    }

    return { numericText, numericValue };
  }

  /**
   * 安全添加独立后缀
   */
  safeAddSeparateSuffix(numericElement, numericText) {
    if (!numericElement || !numericElement.parentNode) {
      console.error("无法添加后缀：元素无效");
      return;
    }

    if (this.config.debug) {
      console.log("添加后缀到元素:", numericElement, "文本:", numericText);
    }

    // 创建包装器
    const wrapper = document.createElement("span");
    wrapper.className = "amount-suffix-wrapper";

    // 复制原始样式
    const originalStyle = numericElement.getAttribute("style");
    if (originalStyle) {
      wrapper.setAttribute("style", originalStyle);
    }

    // 复制类名
    wrapper.className += " " + numericElement.className;

    // 创建数值元素
    const valueSpan = document.createElement("span");
    valueSpan.className = "amount-value";
    valueSpan.textContent = numericText;

    // 创建后缀元素
    const suffixSpan = document.createElement("span");
    suffixSpan.className = "amount-suffix-separate";
    if (this.config.suffixClass) {
      suffixSpan.classList.add(this.config.suffixClass);
    }
    suffixSpan.textContent = this.config.suffixText;

    // 应用自定义样式
    Object.keys(this.config.suffixStyle).forEach((key) => {
      suffixSpan.style[key] = this.config.suffixStyle[key];
    });

    // 组装
    wrapper.appendChild(valueSpan);
    wrapper.appendChild(suffixSpan);

    // 替换原始元素
    try {
      numericElement.parentNode.replaceChild(wrapper, numericElement);

      if (this.config.debug) {
        console.log("元素替换成功:", wrapper);
      }
    } catch (error) {
      console.error("替换元素失败:", error);

      // 回退方案：在原始元素后插入
      numericElement.parentNode.insertBefore(
        wrapper,
        numericElement.nextSibling,
      );
    }
  }

  /**
   * 添加后缀作为文本
   */
  addSuffixAsText(element, originalText) {
    if (!element) return;

    const newText = originalText + " " + this.config.suffixText;

    if (element.nodeType === Node.TEXT_NODE) {
      element.nodeValue = newText;
    } else if (element.value !== undefined) {
      element.value = newText;
    } else {
      element.textContent = newText;
    }

    element.classList.add("has-amount-suffix");
  }

  /**
   * 启动监听
   */
  startObserving() {
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();

    if (this.config.debug) {
      console.log("启动监听器");
    }
  }

  /**
   * 设置DOM监听
   */
  setupMutationObserver() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.error("无法设置监听：容器不存在");
      return;
    }

    if (this.state.observer) {
      this.state.observer.disconnect();
    }

    this.state.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
        if (mutation.type === "characterData") {
          shouldProcess = true;
          break;
        }
      }

      if (shouldProcess) {
        if (this.config.debug) {
          console.log("DOM变化检测到，重新处理");
        }
        this.state.rowCache.clear();
        setTimeout(() => this.processTable(), 50);
      }
    });

    this.state.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 设置滚动监听
   */
  setupScrollListener() {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    let scrollTimer = null;
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.processTable();
      }, this.config.scrollDebounceTime);
    };

    container.addEventListener("scroll", handleScroll);
    this.state.scrollHandler = handleScroll;
  }

  /**
   * 启动定期检查
   */
  startPeriodicCheck() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }

    this.state.intervalId = setInterval(() => {
      this.processTable();
    }, this.config.updateInterval);
  }

  /**
   * 重新处理
   */
  reapply() {
    this.state.rowCache.clear();
    this.processTable();
  }

  /**
   * 更新配置
   */
  updateConfig(newOptions) {
    Object.assign(this.config, newOptions);
    this.createStyles();
    this.reapply();
  }

  /**
   * 获取状态
   */
  getStats() {
    return {
      totalModified: this.state.modifiedCount,
      cachedRows: this.state.rowCache.size,
      isProcessing: this.state.isProcessing,
      isInitialized: this.state.isInitialized,
    };
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
      this.state.timeoutId = null;
    }

    if (this.state.observer) {
      this.state.observer.disconnect();
      this.state.observer = null;
    }

    if (this.state.scrollHandler) {
      const container = document.getElementById(this.config.containerId);
      if (container) {
        container.removeEventListener("scroll", this.state.scrollHandler);
      }
      this.state.scrollHandler = null;
    }

    this.state.rowCache.clear();
    this.state.isInitialized = false;
  }
}

// 导出到全局
window.TableAmountSuffix = TableAmountSuffix;

// 自动初始化函数
function initTableAmountSuffix(config = {}) {
  // 检查是否已有实例
  if (window.__tableAmountSuffixInstance) {
    window.__tableAmountSuffixInstance.destroy();
  }

  // 创建新实例
  const instance = new TableAmountSuffix({
    containerId: "p_form_expert_fee_apply_d1",
    fieldKeys: ["u_unit_price"],
    suffixText: "元",
    suffixClass: "",
    suffixStyle: {
      color: "#999",
      marginLeft: "2px",
      fontSize: "inherit",
    },
    debug: true,
    maxInitRetry: 20,
    initRetryDelay: 500,
    ...config,
  });

  // 保存实例引用
  window.__tableAmountSuffixInstance = instance;
  window.suffixManager = instance; // 兼容旧版本

  return instance;
}

// DOM加载完成后自动初始化
function autoInitTableSuffix() {
  // 检查DOM是否已加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        initTableAmountSuffix();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      initTableAmountSuffix();
    }, 1000);
  }
}

// 如果脚本是外部引入，自动初始化
if (typeof window.$NG !== "undefined") {
  // 适配$NG环境
  window.$NG.ready(() => {
    autoInitTableSuffix();
  });
} else {
  // 直接初始化
  autoInitTableSuffix();
}

// 提供手动调用接口
window.initializeAmountSuffix = function (config) {
  return initTableAmountSuffix(config);
};
