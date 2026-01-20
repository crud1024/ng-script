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
      setTimeout(() => this.startObserving(), 100);
    }
  }

  /**
   * 创建必要的样式
   */
  createStyles() {
    // 如果已经存在样式，先移除
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    // 创建样式元素
    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    let styles = "";

    if (this.config.useSeparateElement) {
      // 独立元素模式
      styles = `
                .amount-suffix-wrapper {
                    display: inline-flex;
                    align-items: center;
                }
                .amount-value {
                    flex-shrink: 0;
                }
                .amount-suffix-separate {
                    display: inline-block;
                }
                .amount-suffix-separate.${this.config.suffixClass} {
                    ${this.objectToCss(this.config.suffixStyle)}
                }
            `;
    } else {
      // 文本模式 - 使用伪元素
      styles = `
                .has-amount-suffix {
                    position: relative;
                    padding-right: 20px;
                }
                .has-amount-suffix::after {
                    content: "${this.config.suffixText}";
                    ${this.objectToCss(this.config.suffixStyle)}
                    position: absolute;
                    right: 0;
                    top: 0;
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

    if (this.timeoutId) clearTimeout(this.timeoutId);

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
    }, 50);
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

    // 查找所有行 - 更灵活的选择器
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
    // 更广泛的行选择器
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

    // 如果没有找到，返回所有直接子元素
    return container.children;
  }

  /**
   * 获取行的唯一标识
   */
  getRowKey(row, index) {
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const dataId = row.getAttribute("data-id");
    const rowId = row.getAttribute("id");

    return dataKey || dataIndex || dataId || rowId || `row-${index}`;
  }

  /**
   * 查找字段元素 - 更灵活的查找逻辑
   */
  findFieldElement(row, fieldKey) {
    // 多种可能的元素选择器
    const selectors = [
      `[data-key="${fieldKey}"]`,
      `[fieldname="${fieldKey}"]`,
      `[name="${fieldKey}"]`,
      `[data-field="${fieldKey}"]`,
      `[key="${fieldKey}"]`,
      `.${fieldKey}`,
      `#${fieldKey}`,
      `[class*="${fieldKey}"]`,
      `[data-col="${fieldKey}"]`,
    ];

    for (const selector of selectors) {
      const element = row.querySelector(selector);
      if (element) return element;
    }

    // 尝试查找包含数字的元素
    const allElements = row.querySelectorAll("span, div, td, p");
    for (const element of allElements) {
      const text = (element.textContent || "").trim();
      if (this.isNumericText(text)) {
        return element;
      }
    }

    return null;
  }

  /**
   * 判断是否为数字文本
   */
  isNumericText(text) {
    if (!text) return false;
    const numericValue = text.replace(/[,\s]/g, "");
    return !isNaN(parseFloat(numericValue)) && isFinite(numericValue);
  }

  /**
   * 添加后缀到元素
   */
  addSuffixToElement(element) {
    const currentText = this.getElementText(element);
    if (!currentText) return false;

    // 检查是否已有后缀
    if (this.hasSuffix(element, currentText)) {
      return false;
    }

    // 提取数字部分
    const numericMatch = this.extractNumericValue(currentText);
    if (!numericMatch) return false;

    const { numericText } = numericMatch;

    // 根据配置选择不同的添加方式
    if (this.config.useSeparateElement) {
      return this.addSuffixAsSeparateElement(element, numericText, currentText);
    } else {
      return this.addSuffixAsText(element, currentText);
    }
  }

  /**
   * 获取元素文本
   */
  getElementText(element) {
    const text =
      element.textContent || element.innerText || element.value || "";
    return text.trim();
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
    if (element.classList.contains("has-amount-suffix")) {
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
    // 更灵活的数字匹配
    const numericMatch = text.match(/([\d,.]+)/);
    if (!numericMatch) return null;

    const numericText = numericMatch[1];
    const numericValue = numericText.replace(/[^\d.-]/g, "");

    if (isNaN(parseFloat(numericValue))) {
      return null;
    }

    return { numericText, numericValue };
  }

  /**
   * 添加后缀作为独立元素
   */
  addSuffixAsSeparateElement(element, numericText, originalText) {
    try {
      // 如果元素已经有内容，只添加后缀
      if (element.children.length > 0) {
        // 查找最后一个子元素
        const lastChild = element.lastElementChild;
        const suffixSpan = document.createElement("span");
        suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
        suffixSpan.textContent = ` ${this.config.suffixText}`;
        suffixSpan.style.cssText = this.objectToCss(this.config.suffixStyle);

        // 如果最后一个元素已经有空格或样式，直接添加
        if (lastChild && lastChild.textContent.trim() === numericText) {
          element.appendChild(suffixSpan);
        } else {
          // 否则创建包装器
          element.innerHTML = "";
          const wrapper = document.createElement("span");
          wrapper.className = "amount-suffix-wrapper";

          const valueSpan = document.createElement("span");
          valueSpan.className = "amount-value";
          valueSpan.textContent = numericText;

          wrapper.appendChild(valueSpan);
          wrapper.appendChild(suffixSpan);
          element.appendChild(wrapper);
        }
      } else {
        // 直接创建
        element.innerHTML = "";
        const wrapper = document.createElement("span");
        wrapper.className = "amount-suffix-wrapper";

        const valueSpan = document.createElement("span");
        valueSpan.className = "amount-value";
        valueSpan.textContent = numericText;

        const suffixSpan = document.createElement("span");
        suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
        suffixSpan.textContent = ` ${this.config.suffixText}`;
        suffixSpan.style.cssText = this.objectToCss(this.config.suffixStyle);

        wrapper.appendChild(valueSpan);
        wrapper.appendChild(suffixSpan);
        element.appendChild(wrapper);
      }

      element.classList.add("has-amount-suffix");
      return true;
    } catch (error) {
      console.error("添加独立元素后缀失败:", error);
      return false;
    }
  }

  /**
   * 添加后缀作为文本
   */
  addSuffixAsText(element, originalText) {
    try {
      // 直接在文本后添加后缀
      const newText = originalText + ` ${this.config.suffixText}`;

      if (element.textContent !== undefined) {
        element.textContent = newText;
      } else if (element.innerText !== undefined) {
        element.innerText = newText;
      } else if (element.value !== undefined) {
        element.value = newText;
      }

      // 标记元素并应用样式
      element.classList.add("has-amount-suffix");
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
      setTimeout(() => this.setupMutationObserver(), 500);
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
