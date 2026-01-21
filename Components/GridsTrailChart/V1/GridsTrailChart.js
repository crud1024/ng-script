/**
 * 表格金额字段后缀管理器 - 彻底修复重叠问题
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
      waitForRender: 1000,
      maxAttempts: 10,
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
    setTimeout(() => this.init(), this.config.waitForRender);
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

    // 立即处理
    this.processTableImmediately();
  }

  createStyles() {
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    const styles = `
            /* 完全隐藏可能有问题的元素 */
            .suffix-overlap-fix {
                display: inline-flex !important;
                align-items: center !important;
            }
        `;

    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  /**
   * 立即处理表格，不延迟
   */
  processTableImmediately() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const result = this.addSuffixToTable();
      if (result > 0) {
        console.log(`表格金额后缀添加完成，处理了 ${result} 个字段`);
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

    const rows = this.findTableRows(tableContainer);
    if (rows.length === 0) return 0;

    let currentModified = 0;

    rows.forEach((row) => {
      const rowKey = this.getRowKey(row);
      if (this.rowCache.has(rowKey)) return;

      this.config.fieldKeys.forEach((fieldKey) => {
        const element = row.querySelector(`[data-key="${fieldKey}"]`);
        if (element && this.fixSuffixForElement(element)) {
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

  /**
   * 关键修复函数 - 彻底解决重叠问题
   */
  fixSuffixForElement(element) {
    // 1. 先找到 nowrap 元素
    const nowrapElement = element.querySelector(".nowrap");
    if (!nowrapElement) return false;

    // 2. 获取原始文本
    const originalText = nowrapElement.textContent.trim();
    if (!originalText) return false;

    // 3. 检查是否已经有后缀
    if (originalText.includes(this.config.suffixText)) {
      // 检查后缀是否正确，不正确则修复
      if (!this.isSuffixCorrect(nowrapElement)) {
        return this.rebuildNowrap(nowrapElement, originalText);
      }
      return false;
    }

    // 4. 提取数字
    const numberMatch = originalText.match(/[\d,.]+/);
    if (!numberMatch) return false;

    const numberText = numberMatch[0];

    // 5. 重建 nowrap 元素
    return this.rebuildNowrap(nowrapElement, originalText);
  }

  /**
   * 检查后缀是否正确
   */
  isSuffixCorrect(nowrapElement) {
    // 检查是否有正确格式的后缀
    const suffixElements = nowrapElement.querySelectorAll(
      '.amount-suffix-separate, [class*="suffix"]',
    );

    if (suffixElements.length === 0) {
      // 没有后缀元素，检查文本
      const text = nowrapElement.textContent.trim();
      return text.endsWith(this.config.suffixText);
    }

    // 检查后缀元素是否在正确的位置
    const lastChild = nowrapElement.lastElementChild;
    if (!lastChild) return false;

    return lastChild.textContent.includes(this.config.suffixText);
  }

  /**
   * 重建 nowrap 元素内容 - 彻底解决重叠的核心
   */
  rebuildNowrap(nowrapElement, originalText) {
    try {
      // 提取数字
      const numberMatch = originalText.match(/[\d,.]+/);
      if (!numberMatch) return false;

      const numberText = numberMatch[0];

      // 方法1: 暴力清空重建（最保险）
      this.forceRebuildNowrap(nowrapElement, numberText);

      // 方法2: 更优雅的方式（备用）
      // this.elegantRebuildNowrap(nowrapElement, numberText, originalText);

      return true;
    } catch (error) {
      console.error("重建nowrap失败:", error);
      return false;
    }
  }

  /**
   * 暴力清空重建 - 100%有效
   */
  forceRebuildNowrap(nowrapElement, numberText) {
    // 1. 保存原有的样式和类
    const originalClasses = nowrapElement.className;
    const originalStyles = nowrapElement.getAttribute("style");

    // 2. 创建新的HTML结构
    const newHtml = `
            <span class="suffix-overlap-fix">
                <span class="number-part">${numberText}</span>
                <span class="amount-suffix-separate" style="${this.getStyleString()}">${this.config.suffixText}</span>
            </span>
        `;

    // 3. 替换内容
    nowrapElement.innerHTML = newHtml;

    // 4. 恢复原有类名
    nowrapElement.className = originalClasses + " suffix-overlap-fix";

    // 5. 恢复原有样式
    if (originalStyles) {
      nowrapElement.setAttribute("style", originalStyles);
    }

    // 6. 应用自定义样式到后缀元素
    const suffixElement = nowrapElement.querySelector(
      ".amount-suffix-separate",
    );
    if (suffixElement && this.config.suffixClass) {
      suffixElement.classList.add(this.config.suffixClass);
      Object.assign(suffixElement.style, this.config.suffixStyle);
    }
  }

  /**
   * 优雅的重建方式
   */
  elegantRebuildNowrap(nowrapElement, numberText, originalText) {
    // 1. 清空所有子节点
    while (nowrapElement.firstChild) {
      nowrapElement.removeChild(nowrapElement.firstChild);
    }

    // 2. 创建数字文本节点
    const textNode = document.createTextNode(numberText);

    // 3. 创建后缀元素
    const suffixSpan = document.createElement("span");
    suffixSpan.className = "amount-suffix-separate";

    if (this.config.suffixClass) {
      suffixSpan.classList.add(this.config.suffixClass);
    }

    suffixSpan.textContent = ` ${this.config.suffixText}`;

    // 4. 应用样式
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    // 5. 添加到nowrap
    nowrapElement.appendChild(textNode);
    nowrapElement.appendChild(suffixSpan);
  }

  /**
   * 将样式对象转为字符串
   */
  getStyleString() {
    if (!this.config.suffixStyle) return "";

    return Object.entries(this.config.suffixStyle)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}:${value}`;
      })
      .join(";");
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

    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();
  }
}

window.TableAmountSuffix = TableAmountSuffix;
