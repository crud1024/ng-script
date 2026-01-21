/**
 * 表格金额字段后缀管理器 - 终极修复版
 */
class TableAmountSuffix {
  constructor(options = {}) {
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

    this.delayedInit();
  }

  delayedInit() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.init(), 1000);
      });
    } else {
      setTimeout(() => this.init(), 1000);
    }
  }

  init() {
    if (this.config.debug) {
      console.log("TableAmountSuffix 初始化");
    }

    // 立即执行一次
    this.processTableImmediately();

    if (this.config.autoObserve) {
      this.startObserving();
    }
  }

  processTableImmediately() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const result = this.addSuffixToTable();
      if (result > 0 && this.config.debug) {
        console.log(`处理了 ${result} 个字段`);
      }
    } catch (error) {
      console.error("处理表格失败:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return 0;

    // 查找所有行
    const rows = this.findTableRows(tableContainer);
    let currentModified = 0;

    rows.forEach((row) => {
      const rowKey = this.getRowKey(row);
      if (this.rowCache.has(rowKey)) return;

      this.config.fieldKeys.forEach((fieldKey) => {
        const cell = row.querySelector(`[data-key="${fieldKey}"]`);
        if (cell && this.processCell(cell)) {
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
      ".row",
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

    return dataKey || dataIndex || rowId || `row-${Date.now()}`;
  }

  /**
   * 核心修复函数 - 保证100%正确
   */
  processCell(cell) {
    // 1. 首先清除所有可能的外部后缀元素
    this.removeAllExternalSuffixes(cell);

    // 2. 找到正确的内层元素（.nowrap > span）
    const innerSpan = this.findCorrectInnerSpan(cell);
    if (!innerSpan) return false;

    // 3. 获取文本并检查
    const text = innerSpan.textContent.trim();
    if (!text || text.includes(this.config.suffixText)) return false;

    // 4. 提取数字
    const numberMatch = text.match(/[\d,.]+/);
    if (!numberMatch) return false;

    const numberText = numberMatch[0];

    // 5. 重建内层元素
    return this.rebuildInnerSpan(innerSpan, numberText);
  }

  /**
   * 移除所有外部后缀元素 - 彻底清理
   */
  removeAllExternalSuffixes(cell) {
    // 找到cell下所有的后缀元素
    const allElements = cell.querySelectorAll("*");

    allElements.forEach((element) => {
      // 检查这个元素是否是后缀元素
      const hasSuffixClass =
        element.classList.contains("amount-suffix-separate") ||
        element.classList.contains("ant-input-number-suffix");
      const hasSuffixText = element.textContent.includes(
        this.config.suffixText,
      );

      if ((hasSuffixClass || hasSuffixText) && !element.closest(".nowrap")) {
        element.remove();
      }
    });
  }

  /**
   * 找到正确的内层span
   */
  findCorrectInnerSpan(cell) {
    // 方案1: 直接查找 .nowrap > span
    let innerSpan = cell.querySelector(".nowrap > span");

    // 方案2: 如果找不到，查找包含数字的span
    if (!innerSpan) {
      const spans = cell.querySelectorAll("span");
      for (let span of spans) {
        const text = span.textContent.trim();
        if (
          text &&
          /[\d,.]+/.test(text) &&
          !text.includes(this.config.suffixText)
        ) {
          innerSpan = span;
          break;
        }
      }
    }

    return innerSpan;
  }

  /**
   * 重建内层span
   */
  rebuildInnerSpan(innerSpan, numberText) {
    try {
      // 保存原始样式
      const originalStyle = innerSpan.getAttribute("style");

      // 完全清空内容
      innerSpan.innerHTML = "";

      // 添加数字
      innerSpan.appendChild(document.createTextNode(numberText));

      // 创建后缀元素
      const suffixSpan = document.createElement("span");
      suffixSpan.textContent = ` ${this.config.suffixText}`;

      // 应用配置的样式
      Object.assign(suffixSpan.style, this.config.suffixStyle);

      // 确保显示正确
      suffixSpan.style.display = "inline";
      suffixSpan.style.whiteSpace = "nowrap";

      // 添加类名（如果有配置）
      if (this.config.suffixClass) {
        suffixSpan.className = this.config.suffixClass;
      }

      innerSpan.appendChild(suffixSpan);

      // 恢复原始样式
      if (originalStyle) {
        innerSpan.setAttribute("style", originalStyle);
      }

      return true;
    } catch (error) {
      console.error("重建内层span失败:", error);
      return false;
    }
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

    this.observer = new MutationObserver(() => {
      this.rowCache.clear();
      setTimeout(() => this.processTableImmediately(), 100);
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
        this.processTableImmediately();
      }, this.config.scrollDebounceTime);
    };

    tableContainer.addEventListener("scroll", handleScroll);
    this.scrollHandler = handleScroll;
  }

  startPeriodicCheck() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.processTableImmediately();
    }, this.config.updateInterval);
  }

  reapply() {
    this.rowCache.clear();
    this.processTableImmediately();
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
  }
}

window.TableAmountSuffix = TableAmountSuffix;
