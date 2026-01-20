/**
 * 表格金额字段后缀管理器 - 简化版
 * @class TableAmountSuffix
 */
class TableAmountSuffix {
  constructor(options = {}) {
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

    const styles = `
      .amount-suffix-separate {
        display: inline;
        ${this.objectToCss(this.config.suffixStyle)}
      }
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
        if (result > 0) {
          console.log(`表格金额后缀添加完成，本次处理 ${result} 个字段`);
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
      this.config.fieldKeys.forEach((fieldKey) => {
        const element = row.querySelector(`[data-key="${fieldKey}"]`);
        if (element && this.addSuffixToElement(element)) {
          currentModified++;
          this.modifiedCount++;
        }
      });
    });

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

  /**
   * 关键修复：正确地在 nowrap 元素中添加后缀
   */
  addSuffixToElement(element) {
    // 查找 nowrap 元素
    const nowrapElement = element.querySelector(".nowrap");
    if (!nowrapElement) return false;

    // 获取完整的HTML内容
    const originalHtml = nowrapElement.innerHTML;
    const originalText = nowrapElement.textContent.trim();

    // 检查是否已经有后缀
    if (originalText.includes(this.config.suffixText)) {
      return false;
    }

    // 提取数字部分（包括逗号分隔）
    const numberMatch = originalText.match(/[\d,.]+/);
    if (!numberMatch) return false;

    const numberText = numberMatch[0];

    // 创建新的HTML：保留原有结构，在数字后添加后缀
    if (this.config.useSeparateElement) {
      // 方法1：使用span元素包裹后缀
      const newHtml = originalHtml.replace(
        numberText,
        numberText +
          `<span class="amount-suffix-separate ${this.config.suffixClass}">${this.config.suffixText}</span>`,
      );
      nowrapElement.innerHTML = newHtml;

      // 应用样式到新创建的后缀元素
      const suffixElement = nowrapElement.querySelector(
        ".amount-suffix-separate",
      );
      if (suffixElement) {
        Object.assign(suffixElement.style, this.config.suffixStyle);
      }
    } else {
      // 方法2：直接添加文本后缀
      nowrapElement.textContent = numberText + ` ${this.config.suffixText}`;
    }

    return true;
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
      this.processTable();
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
