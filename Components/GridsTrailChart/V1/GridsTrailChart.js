/**
 * 表格金额字段后缀管理器 - 异步安全版
 */
class TableAmountSuffix {
  constructor(options = {}) {
    this.config = {
      containerId: "p_form_no_collected_cost_d1",
      fieldKeys: ["u_no_collected_amt"],
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
      autoObserve: true,
      debug: false,
      waitForRender: 500, // 新增：等待渲染时间
      maxAttempts: 10, // 新增：最大尝试次数
      ...options,
    };

    this.attemptCount = 0;
    this.observer = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Set();

    // 延迟初始化
    this.delayedInit();
  }

  delayedInit() {
    // 等待指定的时间
    setTimeout(() => {
      this.init();
    }, this.config.waitForRender);
  }

  init() {
    // 检查表格容器是否存在
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      this.attemptCount++;

      if (this.attemptCount < this.config.maxAttempts) {
        if (this.config.debug) {
          console.log(
            `表格容器 ${this.config.containerId} 未找到，第 ${this.attemptCount} 次重试...`,
          );
        }
        setTimeout(() => this.init(), 500);
        return;
      } else {
        if (this.config.debug) {
          console.error(
            `表格容器 ${this.config.containerId} 不存在，已尝试 ${this.attemptCount} 次`,
          );
        }
        return;
      }
    }

    if (this.config.debug) {
      console.log("TableAmountSuffix 初始化成功，开始处理表格");
    }

    this.createStyles();

    if (this.config.autoObserve) {
      this.startObserving();
    }

    // 立即处理一次
    this.processTable();
  }

  createStyles() {
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    const styles = `
            .amount-suffix-separate {
                display: inline;
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

    // 检查表格是否有数据
    const rows = this.findTableRows(tableContainer);
    if (rows.length === 0) {
      if (this.config.debug) {
        console.log("表格没有数据行，等待下一次检查");
      }
      return 0;
    }

    let currentModified = 0;

    rows.forEach((row) => {
      const rowKey = this.getRowKey(row);
      if (this.rowCache.has(rowKey)) return;

      this.config.fieldKeys.forEach((fieldKey) => {
        const element = row.querySelector(`[data-key="${fieldKey}"]`);
        if (element) {
          // 先检查是否有 nowrap 元素
          const nowrapElement = element.querySelector(".nowrap");
          if (
            nowrapElement &&
            !nowrapElement.textContent.includes(this.config.suffixText)
          ) {
            if (this.addSuffixToElement(element)) {
              currentModified++;
              this.modifiedCount++;
            }
          }
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
      "tr[data-index]",
      "tr",
      ".row",
      ".ant-table-row",
    ];

    for (const selector of selectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) return rows;
    }

    // 如果没有找到，尝试查找 tbody 的子元素
    const tbodyRows = container.querySelectorAll("tbody > *");
    if (tbodyRows.length > 0) return tbodyRows;

    return [];
  }

  getRowKey(row) {
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const rowId = row.getAttribute("id");

    return (
      dataKey || dataIndex || rowId || `row-${Date.now()}-${Math.random()}`
    );
  }

  addSuffixToElement(element) {
    const nowrapElement = element.querySelector(".nowrap");
    if (!nowrapElement) return false;

    const originalText = nowrapElement.textContent.trim();
    if (!originalText || originalText.includes(this.config.suffixText)) {
      return false;
    }

    const numberMatch = originalText.match(/[\d,.]+/);
    if (!numberMatch) return false;

    const numberText = numberMatch[0];

    // 清空并重新构建
    nowrapElement.innerHTML = "";

    // 添加数字
    const numberNode = document.createTextNode(numberText);
    nowrapElement.appendChild(numberNode);

    // 添加后缀元素
    const suffixSpan = document.createElement("span");
    suffixSpan.className = "amount-suffix-separate";

    if (this.config.suffixClass) {
      suffixSpan.classList.add(this.config.suffixClass);
    }

    suffixSpan.textContent = ` ${this.config.suffixText}`;

    // 应用样式
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    nowrapElement.appendChild(suffixSpan);

    return true;
  }

  startObserving() {
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();
  }

  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return;

    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver((mutations) => {
      // 检查是否有新增行
      const hasNewRows = mutations.some((mutation) => {
        return mutation.type === "childList" && mutation.addedNodes.length > 0;
      });

      if (hasNewRows) {
        this.rowCache.clear();
        setTimeout(() => this.processTable(), 100);
      }
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
