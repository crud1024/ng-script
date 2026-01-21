/**
 * 表格金额字段后缀管理器 - 完全修复版
 * @description 修复后缀重叠问题，确保后缀添加在正确的位置
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
      waitForRender: 1500,
      maxAttempts: 10,
      ...options,
    };

    this.observer = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Set();
    this.attemptCount = 0;

    // 延迟初始化
    this.delayedInit();
  }

  delayedInit() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.init(), this.config.waitForRender);
      });
    } else {
      setTimeout(() => this.init(), this.config.waitForRender);
    }
  }

  init() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      this.attemptCount++;
      if (this.attemptCount < this.config.maxAttempts) {
        setTimeout(() => this.init(), 500);
        return;
      }
      return;
    }

    if (this.config.debug) {
      console.log("TableAmountSuffix 初始化成功");
    }

    this.createStyles();

    if (this.config.autoObserve) {
      this.startObserving();
    }

    this.processTable();
  }

  createStyles() {
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    if (this.config.suffixClass) {
      styleEl.textContent = `
                .${this.config.suffixClass} {
                    ${this.objectToCss(this.config.suffixStyle)}
                }
            `;
    } else {
      styleEl.textContent = "";
    }

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
      } catch (error) {
        if (this.config.debug) {
          console.error("处理表格时出错:", error);
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
        if (element && this.processAmountCell(element)) {
          currentModified++;
          this.modifiedCount++;
        }
      });

      this.rowCache.add(rowKey);
    });

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
   * 核心修复：处理金额单元格 - 确保后缀在正确位置
   */
  processAmountCell(cellElement) {
    // 第一步：清理外部可能存在的错误后缀
    this.cleanExternalSuffix(cellElement);

    // 第二步：查找最里层的数字元素
    const innerSpan = this.findInnerSpan(cellElement);
    if (!innerSpan) return false;

    // 第三步：检查是否已经有后缀
    const currentText = innerSpan.textContent.trim();
    if (currentText.includes(this.config.suffixText)) {
      return false;
    }

    // 第四步：提取数字
    const numberMatch = currentText.match(/[\d,.]+/);
    if (!numberMatch) return false;

    const numberText = numberMatch[0];

    // 第五步：重建内层span内容
    return this.rebuildInnerSpan(innerSpan, numberText);
  }

  /**
   * 清理外部后缀元素
   */
  cleanExternalSuffix(cellElement) {
    // 查找所有在editor-container外部但又在cell内部的后缀元素
    const allSuffixes = cellElement.querySelectorAll(
      ".amount-suffix-separate, .ant-input-number-suffix",
    );

    allSuffixes.forEach((suffix) => {
      // 检查这个后缀元素是否在editor-container内部
      const isInsideEditor = suffix.closest(".editor-container");
      if (!isInsideEditor) {
        suffix.remove();
      }
    });
  }

  /**
   * 查找最里层的数字span
   */
  findInnerSpan(cellElement) {
    // 根据你提供的DOM结构：.nowrap > span
    return cellElement.querySelector(".nowrap > span");
  }

  /**
   * 重建内层span内容
   */
  rebuildInnerSpan(innerSpan, numberText) {
    try {
      // 保存原始类名和样式
      const originalClass = innerSpan.className;
      const originalStyle = innerSpan.getAttribute("style");

      // 清空内容
      innerSpan.innerHTML = "";

      // 创建新的内容
      if (this.config.useSeparateElement) {
        // 创建数字节点
        const numberNode = document.createTextNode(numberText);
        innerSpan.appendChild(numberNode);

        // 创建后缀元素
        const suffixSpan = document.createElement("span");
        suffixSpan.className = "amount-suffix-separate";

        if (this.config.suffixClass) {
          suffixSpan.classList.add(this.config.suffixClass);
        }

        suffixSpan.textContent = ` ${this.config.suffixText}`;

        // 应用样式
        Object.assign(suffixSpan.style, this.config.suffixStyle);

        // 确保显示正确
        suffixSpan.style.display = "inline";
        suffixSpan.style.whiteSpace = "nowrap";

        innerSpan.appendChild(suffixSpan);
      } else {
        // 文本模式
        innerSpan.textContent = numberText + ` ${this.config.suffixText}`;
      }

      // 恢复原始类名和样式
      innerSpan.className = originalClass;
      if (originalStyle) {
        innerSpan.setAttribute("style", originalStyle);
      }

      return true;
    } catch (error) {
      if (this.config.debug) {
        console.error("重建内层span失败:", error);
      }
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
