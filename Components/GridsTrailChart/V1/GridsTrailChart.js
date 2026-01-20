/**
 * 表格金额字段后缀管理器
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
      containerId: "p_form_no_collected_cost_d1",
      fieldKeys: ["u_no_collected_amt"],
      suffixText: "元",
      suffixClass: "ant-input-number-suffix",
      suffixStyle: {
        color: "#999",
        marginLeft: "2px",
        fontSize: "inherit",
      },
      useSeparateElement: true,
      scrollDebounceTime: 300,
      updateInterval: 1000,
      autoObserve: true,
      debug: false,
      ...options,
    };

    // 状态变量
    this.observer = null;
    this.scrollObserver = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Set();

    // 初始化
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    // 创建样式
    this.createStyles();

    // 启动监听
    if (this.config.autoObserve) {
      this.startObserving();
    }
  }

  /**
   * 创建必要的样式
   */
  createStyles() {
    // 如果已经存在样式，先移除
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // 创建样式元素
    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    // 基础样式
    let styles = `
            .table-amount-suffix-processed {
                position: relative;
            }
            
            .amount-suffix-wrapper {
                display: inline-flex;
                align-items: center;
                white-space: nowrap;
                width: 100%;
                height: 100%;
                justify-content: flex-end;
            }
            
            .amount-value {
                flex-shrink: 0;
            }
            
            /* 隐藏原有的编辑器内容 */
            .table-amount-suffix-processed .editor-container {
                display: none !important;
            }
        `;

    // 如果使用独立元素，添加默认样式
    if (this.config.useSeparateElement) {
      styles += `
                .amount-suffix-separate {
                    display: inline-block;
                    ${this.objectToCss(this.config.suffixStyle)}
                }
                
                .amount-suffix-separate.${this.config.suffixClass} {
                    /* 这里可以添加额外的样式覆盖 */
                }
            `;
    } else {
      // 文本模式的样式
      styles += `
                .table-amount-suffix-text-mode {
                    position: relative;
                    padding-right: 25px;
                }
                
                .table-amount-suffix-text-mode .editor-container {
                    display: none !important;
                }
                
                .table-amount-suffix-text-mode::after {
                    content: "${this.config.suffixText}";
                    ${this.objectToCss(this.config.suffixStyle)}
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }
            `;
    }

    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  /**
   * 将样式对象转换为CSS字符串
   */
  objectToCss(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value};`)
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
    if (this.isProcessing) return;

    this.isProcessing = true;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      try {
        const result = this.addSuffixToTable();
        if (result > 0 && this.config.debug) {
          console.log(`处理了 ${result} 个字段`);
        }
      } catch (error) {
        console.error("处理表格时出错:", error);
      } finally {
        this.isProcessing = false;
        this.timeoutId = null;
      }
    }, 100);
  }

  /**
   * 添加后缀到表格
   */
  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      if (this.config.debug)
        console.log(`表格容器未找到: ${this.config.containerId}`);
      return 0;
    }

    // 查找所有行
    const tableRows = this.findTableRows(tableContainer);
    let currentModified = 0;

    tableRows.forEach((row, rowIndex) => {
      const rowKey = this.getRowKey(row, rowIndex);

      if (this.rowCache.has(rowKey)) return;

      this.config.fieldKeys.forEach((fieldKey) => {
        const element = this.findFieldElement(row, fieldKey);
        if (element && this.addSuffixToElement(element)) {
          currentModified++;
          this.modifiedCount++;
        }
      });

      this.rowCache.add(rowKey);
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
    // 多种可能的行选择器
    const rowSelectors = [
      '[class*="table-row"]',
      ".table-row",
      "[data-row-index]",
      "tr[data-index]",
      "tr",
      ".row",
      ".ant-table-row",
      "tbody > *",
    ];

    for (const selector of rowSelectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) {
        return rows;
      }
    }

    return container.children;
  }

  /**
   * 获取行的唯一标识
   */
  getRowKey(row, index) {
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const rowId = row.getAttribute("id");

    return dataKey || dataIndex || rowId || `row-${index}`;
  }

  /**
   * 查找字段元素
   */
  findFieldElement(row, fieldKey) {
    // 多种可能的元素选择器
    const selectors = [
      `[data-key="${fieldKey}"]`,
      `[fieldname="${fieldKey}"]`,
      `[name="${fieldKey}"]`,
      `[data-field="${fieldKey}"]`,
      `.${fieldKey}`,
      `#${fieldKey}`,
    ];

    for (const selector of selectors) {
      const element = row.querySelector(selector);
      if (element) return element;
    }

    return null;
  }

  /**
   * 添加后缀到元素
   */
  addSuffixToElement(element) {
    // 获取当前文本
    const currentText = this.getElementText(element);
    if (!currentText) return false;

    // 检查是否已有后缀
    if (this.hasSuffix(element, currentText)) {
      // 如果已经有后缀但可能是旧版本，重新处理
      if (!element.classList.contains("table-amount-suffix-processed")) {
        this.cleanElement(element);
      } else {
        return false;
      }
    }

    // 提取数字部分
    const numericMatch = this.extractNumericValue(currentText);
    if (!numericMatch) {
      if (this.config.debug) {
        console.log("未找到有效数字:", currentText);
      }
      return false;
    }

    const { numericText } = numericMatch;

    // 根据配置选择不同的添加方式
    if (this.config.useSeparateElement) {
      return this.addSuffixAsSeparateElement(element, numericText);
    } else {
      return this.addSuffixAsText(element, numericText, currentText);
    }
  }

  /**
   * 获取元素文本
   */
  getElementText(element) {
    // 先尝试从nowrap元素获取文本
    const nowrapElement = element.querySelector(".nowrap");
    if (nowrapElement) {
      return (
        nowrapElement.textContent ||
        nowrapElement.innerText ||
        ""
      ).trim();
    }

    // 如果没有nowrap元素，尝试从editor-container获取
    const editorContainer = element.querySelector(".editor-container");
    if (editorContainer) {
      return (
        editorContainer.textContent ||
        editorContainer.innerText ||
        ""
      ).trim();
    }

    // 最后尝试元素本身的文本
    return (
      element.textContent ||
      element.innerText ||
      element.value ||
      ""
    ).trim();
  }

  /**
   * 清理元素内容
   */
  cleanElement(element) {
    // 移除可能存在的旧版本后缀元素
    const oldSuffix = element.querySelector(".amount-suffix-separate");
    if (oldSuffix) {
      oldSuffix.remove();
    }

    // 移除旧版本的包装器
    const oldWrapper = element.querySelector(".amount-suffix-wrapper");
    if (oldWrapper) {
      oldWrapper.remove();
    }

    // 移除相关类名
    element.classList.remove(
      "table-amount-suffix-processed",
      "table-amount-suffix-text-mode",
      "has-amount-suffix",
    );
  }

  /**
   * 检查是否已有后缀
   */
  hasSuffix(element, text) {
    // 检查文本是否包含后缀
    if (text.includes(this.config.suffixText)) {
      return true;
    }

    // 检查元素是否已被标记
    if (element.classList.contains("table-amount-suffix-processed")) {
      return true;
    }

    // 检查是否有独立的后缀元素
    if (element.querySelector(".amount-suffix-separate")) {
      return true;
    }

    return false;
  }

  /**
   * 提取数字值
   */
  extractNumericValue(text) {
    // 移除空白字符和可能的其他字符
    const cleanText = text.replace(/\s+/g, "");
    const numericMatch = cleanText.match(/[-+]?[0-9,]*\.?[0-9]+/);
    if (!numericMatch) return null;

    const numericText = numericMatch[0];
    const numericValue = numericText.replace(/,/g, "");

    if (isNaN(parseFloat(numericValue))) {
      return null;
    }

    return { numericText, numericValue };
  }

  /**
   * 添加后缀作为独立元素
   */
  addSuffixAsSeparateElement(element, numericText) {
    try {
      // 先清理旧内容
      this.cleanElement(element);

      // 创建一个新的内容容器
      const contentDiv = document.createElement("div");
      contentDiv.className = "editor-container cell-disabled";
      contentDiv.style.cssText =
        "padding: 0px 6px; text-align: right; justify-content: flex-end;";

      // 创建包装器
      const wrapper = document.createElement("span");
      wrapper.className = "amount-suffix-wrapper";

      // 创建数值元素
      const valueSpan = document.createElement("span");
      valueSpan.className = "amount-value";
      valueSpan.textContent = numericText;

      // 创建后缀元素
      const suffixSpan = document.createElement("span");
      suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
      suffixSpan.textContent = ` ${this.config.suffixText}`;

      // 应用自定义样式
      Object.assign(suffixSpan.style, this.config.suffixStyle);

      // 组装
      wrapper.appendChild(valueSpan);
      wrapper.appendChild(suffixSpan);
      contentDiv.appendChild(wrapper);

      // 清空原元素，但保留原有属性
      const attributes = Array.from(element.attributes);
      element.innerHTML = "";
      attributes.forEach((attr) => {
        element.setAttribute(attr.name, attr.value);
      });

      // 添加新的内容
      element.appendChild(contentDiv);

      // 标记元素
      element.classList.add("table-amount-suffix-processed");
      return true;
    } catch (error) {
      console.error("添加独立元素后缀失败:", error);
      return false;
    }
  }

  /**
   * 添加后缀作为文本
   */
  addSuffixAsText(element, numericText, originalText) {
    try {
      // 先清理旧内容
      this.cleanElement(element);

      // 创建新的内容容器
      const contentDiv = document.createElement("div");
      contentDiv.className = "editor-container cell-disabled";
      contentDiv.style.cssText =
        "padding: 0px 6px; text-align: right; justify-content: flex-end;";

      // 创建文本元素
      const textSpan = document.createElement("span");
      textSpan.className = "nowrap";
      textSpan.textContent = numericText + ` ${this.config.suffixText}`;

      contentDiv.appendChild(textSpan);

      // 清空原元素，但保留原有属性
      const attributes = Array.from(element.attributes);
      element.innerHTML = "";
      attributes.forEach((attr) => {
        element.setAttribute(attr.name, attr.value);
      });

      // 添加新的内容
      element.appendChild(contentDiv);

      // 标记元素并应用样式
      element.classList.add("table-amount-suffix-text-mode");
      element.classList.add(this.config.suffixClass);

      // 应用自定义样式
      Object.assign(element.style, this.config.suffixStyle);

      return true;
    } catch (error) {
      console.error("添加文本后缀失败:", error);
      return false;
    }
  }

  /**
   * 启动监听
   */
  startObserving() {
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();

    // 初始处理
    setTimeout(() => this.processTable(), 200);
  }

  /**
   * 设置MutationObserver
   */
  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      setTimeout(() => this.setupMutationObserver(), 1000);
      return;
    }

    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some((mutation) => {
        return (
          mutation.type === "childList" || mutation.type === "characterData"
        );
      });

      if (hasRelevantChanges) {
        this.rowCache.clear();
        this.processTable();
      }
    });

    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 设置滚动监听
   */
  setupScrollListener() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return;

    let scrollTimer = null;

    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.rowCache.clear();
        this.processTable();
      }, this.config.scrollDebounceTime);
    };

    tableContainer.addEventListener("scroll", handleScroll);
    this.scrollHandler = handleScroll;
  }

  /**
   * 启动定期检查
   */
  startPeriodicCheck() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(
      () => this.processTable(),
      this.config.updateInterval,
    );
  }

  /**
   * 手动重新处理表格
   */
  reapply() {
    this.rowCache.clear();
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
   * 获取统计信息
   */
  getStats() {
    return {
      totalModified: this.modifiedCount,
      cachedRows: this.rowCache.size,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.scrollHandler) {
      const tableContainer = document.getElementById(this.config.containerId);
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", this.scrollHandler);
      }
      this.scrollHandler = null;
    }

    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();

    this.rowCache.clear();
  }
}

// 默认导出
window.TableAmountSuffix = TableAmountSuffix;
