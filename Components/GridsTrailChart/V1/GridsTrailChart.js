/**
 * 表格金额字段后缀管理器 - 移除默认样式类选择器
 * @class TableAmountSuffix
 */
class TableAmountSuffix {
  constructor(options = {}) {
    this.config = {
      containerId: "p_form_no_collected_cost_d1",
      fieldKeys: ["u_no_collected_amt"],
      suffixText: "元",
      suffixClass: "", // 移除默认值，为空
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

    this.observer = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Set();

    this.init();
  }

  init() {
    this.createStyles();
    if (this.config.autoObserve) {
      this.startObserving();
    }
  }

  createStyles() {
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    // 只添加基础样式，不添加基于类的样式
    const styles = `
      .amount-suffix-separate {
        display: inline;
      }
      
      /* 只为特定类名添加样式（如果有配置的话） */
      ${this.config.suffixClass ? `.${this.config.suffixClass} { ${this.objectToCss(this.config.suffixStyle)} }` : ""}
    `;

    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  objectToCss(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value};`)
      .join(" ");
  }

  camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

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
      } finally {
        this.isProcessing = false;
        this.timeoutId = null;
      }
    }, 50);
  }

  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return 0;

    const rows = this.findTableRows(tableContainer);
    let currentModified = 0;

    rows.forEach((row) => {
      const rowKey = this.getRowKey(row);
      if (this.rowCache.has(rowKey)) return;

      this.config.fieldKeys.forEach((fieldKey) => {
        const element = row.querySelector(`[data-key="${fieldKey}"]`);
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

  findTableRows(container) {
    const selectors = [
      '[class*="table-row"]',
      ".table-row",
      "[data-row-index]",
      "tr",
    ];

    for (const selector of selectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) return rows;
    }

    return container.children;
  }

  getRowKey(row) {
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const rowId = row.getAttribute("id");

    return (
      dataKey || dataIndex || rowId || `row-${Date.now()}-${Math.random()}`
    );
  }

  /**
   * 关键方法：添加后缀元素
   */
  addSuffixToElement(element) {
    // 查找 nowrap 元素
    const nowrapElement = element.querySelector(".nowrap");
    if (!nowrapElement) return false;

    // 获取文本内容
    const originalText = nowrapElement.textContent.trim();

    // 检查是否已经有后缀
    if (originalText.includes(this.config.suffixText)) {
      return false;
    }

    // 提取数字部分
    const numberMatch = originalText.match(/[\d,.]+/);
    if (!numberMatch) return false;

    const numberText = numberMatch[0];

    // 创建新的内容
    if (this.config.useSeparateElement) {
      // 方法1：使用单独元素
      return this.addSeparateElementSuffix(
        nowrapElement,
        numberText,
        originalText,
      );
    } else {
      // 方法2：直接添加文本
      return this.addTextSuffix(nowrapElement, numberText);
    }
  }

  /**
   * 添加独立元素后缀 - 修复版本
   */
  addSeparateElementSuffix(nowrapElement, numberText, originalText) {
    try {
      // 清空 nowrap 元素的所有内容
      nowrapElement.innerHTML = "";

      // 创建数字文本节点
      const numberNode = document.createTextNode(numberText);

      // 创建后缀元素 - 只添加必要的类名
      const suffixSpan = document.createElement("span");
      suffixSpan.className = "amount-suffix-separate";

      // 如果有配置的类名，添加到class中
      if (this.config.suffixClass) {
        suffixSpan.classList.add(this.config.suffixClass);
      }

      suffixSpan.textContent = ` ${this.config.suffixText}`;

      // 直接应用样式到元素（不使用CSS类选择器）
      Object.assign(suffixSpan.style, this.config.suffixStyle);

      // 添加到 nowrap 元素
      nowrapElement.appendChild(numberNode);
      nowrapElement.appendChild(suffixSpan);

      return true;
    } catch (error) {
      console.error("添加独立元素后缀失败:", error);
      return false;
    }
  }

  /**
   * 添加文本后缀
   */
  addTextSuffix(nowrapElement, numberText) {
    try {
      nowrapElement.textContent = numberText + ` ${this.config.suffixText}`;
      return true;
    } catch (error) {
      console.error("添加文本后缀失败:", error);
      return false;
    }
  }

  startObserving() {
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();
    setTimeout(() => this.processTable(), 100);
  }

  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      setTimeout(() => this.setupMutationObserver(), 1000);
      return;
    }

    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver(() => {
      this.rowCache.clear();
      setTimeout(() => this.processTable(), 100);
    });

    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

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

  startPeriodicCheck() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.processTable();
    }, this.config.updateInterval);
  }

  reapply() {
    this.rowCache.clear();
    this.processTable();
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.observer) this.observer.disconnect();
    if (this.scrollHandler) {
      const tableContainer = document.getElementById(this.config.containerId);
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", this.scrollHandler);
      }
    }

    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();
  }
}

window.TableAmountSuffix = TableAmountSuffix;
